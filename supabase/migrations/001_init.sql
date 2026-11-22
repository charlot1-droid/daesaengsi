-- 대생시 · 게임 방, 참가자, 투표
-- 관객은 테이블에 직접 쓰지 못하고, 아래 함수(RPC)로만 입장·투표해요.
-- 진행 상태(rooms.state)는 host_key를 아는 진행자만 바꿀 수 있어요.

create extension if not exists pgcrypto;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique check (pin ~ '^\d{6}$'),
  state jsonb not null default '{"phase":"lobby","seq":0}',
  open boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.room_secrets (
  room_id uuid primary key references public.rooms on delete cascade,
  host_key uuid not null default gen_random_uuid()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 10),
  secret uuid not null default gen_random_uuid(),
  joined_at timestamptz not null default now(),
  unique (room_id, nickname)
);
create index on public.players (room_id, joined_at desc);

create table public.votes (
  room_id uuid not null references public.rooms on delete cascade,
  round int not null,
  player_id uuid not null references public.players on delete cascade,
  option smallint not null check (option between 1 and 3),
  updated_at timestamptz not null default now(),
  primary key (room_id, round, player_id)
);

alter table public.rooms enable row level security;
alter table public.room_secrets enable row level security;
alter table public.players enable row level security;
alter table public.votes enable row level security;

-- 휴대폰은 열린 방의 진행 상태만 읽을 수 있어요 (실시간 구독도 이 규칙을 따라요)
create policy "read open rooms" on public.rooms for select to anon, authenticated using (open);
-- 나머지 테이블은 정책 없음 = 직접 접근 불가

alter publication supabase_realtime add table public.rooms;

-- ───────── 진행자 ─────────

create or replace function public.create_room()
returns table (pin text, host_key uuid)
language plpgsql security definer set search_path = public as $$
declare v_pin text; v_id uuid;
begin
  loop
    v_pin := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    begin
      insert into rooms (pin) values (v_pin) returning id into v_id;
      exit;
    exception when unique_violation then -- 다시 뽑기
    end;
  end loop;
  insert into room_secrets (room_id) values (v_id);
  return query select v_pin, s.host_key from room_secrets s where s.room_id = v_id;
end $$;

create or replace function public._host_room(p_pin text, p_key uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select r.id from rooms r join room_secrets s on s.room_id = r.id
  where r.pin = p_pin and s.host_key = p_key and r.open
$$;

create or replace function public.host_set_state(p_pin text, p_key uuid, p_state jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_id uuid := _host_room(p_pin, p_key);
begin
  if v_id is null then raise exception 'NOT_HOST'; end if;
  update rooms set state = p_state where id = v_id;
end $$;

create or replace function public.host_poll(p_pin text, p_key uuid, p_round int)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_id uuid := _host_room(p_pin, p_key);
begin
  if v_id is null then raise exception 'NOT_HOST'; end if;
  return json_build_object(
    'players', (select count(*) from players where room_id = v_id),
    'names', coalesce((select json_agg(nickname) from (select nickname from players where room_id = v_id order by joined_at desc limit 40) n), '[]'::json),
    'counts', json_build_array(
      (select count(*) from votes where room_id = v_id and round = p_round and option = 1),
      (select count(*) from votes where room_id = v_id and round = p_round and option = 2),
      (select count(*) from votes where room_id = v_id and round = p_round and option = 3)),
    'voters', (select count(*) from votes where room_id = v_id and round = p_round)
  );
end $$;

create or replace function public.host_close(p_pin text, p_key uuid)
returns void language sql security definer set search_path = public as $$
  update rooms set open = false where id = _host_room(p_pin, p_key)
$$;

-- ───────── 관객 ─────────

create or replace function public.join_room(p_pin text, p_nick text)
returns table (player_id uuid, secret uuid)
language plpgsql security definer set search_path = public as $$
declare v_room uuid; v_nick text := btrim(p_nick);
begin
  select id into v_room from rooms where pin = p_pin and open;
  if v_room is null then raise exception 'NO_ROOM'; end if;
  if char_length(v_nick) not between 1 and 10 then raise exception 'NAME_BAD'; end if;
  -- TODO(행사 전): 금칙어 검사 (src/realtime/nickname.ts와 같은 목록)
  begin
    return query insert into players (room_id, nickname) values (v_room, v_nick) returning id, players.secret;
  exception when unique_violation then
    raise exception 'NAME_TAKEN';
  end;
end $$;

create or replace function public.player_check(p_player uuid, p_secret uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from players p join rooms r on r.id = p.room_id where p.id = p_player and p.secret = p_secret and r.open)
$$;

-- 지금 투표 중인 라운드일 때만 받아요. 마감 전에는 다시 눌러 바꿀 수 있어요(덮어쓰기).
create or replace function public.cast_vote(p_player uuid, p_secret uuid, p_round int, p_option int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_room uuid; v_state jsonb;
begin
  select p.room_id, r.state into v_room, v_state
  from players p join rooms r on r.id = p.room_id
  where p.id = p_player and p.secret = p_secret and r.open;
  if v_room is null then return false; end if;
  if v_state->>'phase' <> 'vote' or (v_state->>'round')::int <> p_round or coalesce((v_state->>'paused')::boolean, false) then
    return false;
  end if;
  insert into votes (room_id, round, player_id, option) values (v_room, p_round, p_player, p_option)
  on conflict (room_id, round, player_id) do update set option = excluded.option, updated_at = now();
  return true;
end $$;

revoke all on function public._host_room(text, uuid) from public, anon, authenticated;
grant execute on function public.create_room(), public.host_set_state(text, uuid, jsonb), public.host_poll(text, uuid, int),
  public.host_close(text, uuid), public.join_room(text, text), public.player_check(uuid, uuid),
  public.cast_vote(uuid, uuid, int, int) to anon, authenticated;
