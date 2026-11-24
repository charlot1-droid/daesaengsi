-- 대생시 · 휴대폰이 진행 상태를 확실히 받도록 (11/25)
-- Supabase 대시보드 → SQL Editor에 이 파일 내용을 붙여 넣고 Run 한 번.
-- 여러 번 실행해도 괜찮아요.

-- 1) 휴대폰이 현재 진행 상태를 읽는 함수 (테이블 권한과 상관없이 동작)
create or replace function public.room_state(p_pin text)
returns jsonb language sql stable security definer set search_path = public as $$
  select state from rooms where pin = p_pin and open
$$;
grant execute on function public.room_state(text) to anon, authenticated;

-- 2) rooms 행 변경 알림(실시간)이 휴대폰에 닿으려면 읽기 권한이 필요해요
grant select on public.rooms to anon, authenticated;

-- 3) 실시간 구독 대상에 rooms가 빠져 있으면 다시 넣어요
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end $$;
