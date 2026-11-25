-- 대생시 · 같은 이름 허용 + "혹시 본인이에요?" 이어받기 (11/26)
-- Supabase 대시보드 → SQL Editor에 이 파일 내용을 붙여 넣고 Run 한 번.
-- 여러 번 실행해도 괜찮아요.

-- 1) 같은 방에서 이름이 겹쳐도 되게
alter table public.players drop constraint if exists players_room_id_nickname_key;
create index if not exists players_room_nick on public.players (room_id, nickname);

-- 2) 입장: p_mode
--    'ask'   이름이 이미 있으면 NAME_EXISTS 로 알려 줘요 (휴대폰이 "본인이에요?"를 물어봐요)
--    'claim' 이미 있는 같은 이름 중 가장 최근 자리를 이어받아요 (인원 그대로)
--    'new'   같은 이름이어도 새로 입장해요 (동명이인)
drop function if exists public.join_room(text, text);
create or replace function public.join_room(p_pin text, p_nick text, p_mode text default 'ask')
returns table (player_id uuid, secret uuid)
language plpgsql security definer set search_path = public as $$
declare v_room uuid; v_nick text := btrim(p_nick);
begin
  select id into v_room from rooms where pin = p_pin and open;
  if v_room is null then raise exception 'NO_ROOM'; end if;
  if char_length(v_nick) not between 1 and 10 then raise exception 'NAME_BAD'; end if;
  if p_mode in ('ask', 'claim') and exists (select 1 from players p where p.room_id = v_room and p.nickname = v_nick) then
    if p_mode = 'ask' then raise exception 'NAME_EXISTS'; end if;
    return query select p.id, p.secret from players p where p.room_id = v_room and p.nickname = v_nick order by p.joined_at desc limit 1;
    return;
  end if;
  return query insert into players (room_id, nickname) values (v_room, v_nick) returning id, players.secret;
end $$;
grant execute on function public.join_room(text, text, text) to anon, authenticated;
