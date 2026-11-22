# 이미지 제작 현황

> `npm run art`가 만드는 파일이에요. 손으로 고치지 말고 `src/art/manifest.ts`를 고쳐요.

필요 **28장** · 완료 10장

## 필요 (ChatGPT로 생성 → docs/prompts.md 템플릿)

| 파일 | 종류 | 무엇 | 쓰는 장면 | 없을 때 |
| --- | --- | --- | --- | --- |
| `bg-festival-night` | 배경 | Stage 1 ① 축제 밤, 밴드 공연 무대 | s1-festival | 자리 표시 |
| `bg-club-fair` | 배경 | Stage 1 ② 동아리 박람회 부스 거리 (낮) | s1-fair | 자리 표시 |
| `bg-orientation-night` | 배경 | Stage 1 ③ 새터 장기자랑 강당 (밤) | s1-ot | 자리 표시 |
| `bg-room-night` | 배경 | Stage 2 여주의 자취방 (밤, DM) | s2, s2-ok | 자리 표시 |
| `bg-restaurant` | 배경 | Stage 3 밥약 식당 (메뉴판은 소품으로 얹음) | s3, s3-ok | 자리 표시 |
| `bg-pc-dawn` | 배경 | Stage 4 수강신청 새벽 책상과 모니터 | s4, s4-ok | 자리 표시 |
| `bg-desk-2am` | 배경 | Stage 5 조별과제 새벽 2시 책상 | s5 | 자리 표시 |
| `bg-bench-sunset` | 배경 | Stage 5 끝, Stage 6 노을 벤치 | s5-ok | 자리 표시 |
| `bg-epilogue-night` | 배경 | 에필로그 밤하늘과 벚꽃 | epilogue | 자리 표시 |
| `sp-namju-a-smile` | 스탠딩 | 스탠딩 A · 미소 | s1-fair, s3 | 자리 표시 |
| `sp-namju-a-laugh` | 스탠딩 | 스탠딩 A · 웃음 | s1-festival, s1-ot, s3-ok | 자리 표시 |
| `sp-namju-a-cool` | 스탠딩 | 스탠딩 A · 시크 | — | 자리 표시 |
| `sp-namju-a-serious` | 스탠딩 | 스탠딩 A · 진지 | — | 자리 표시 |
| `sp-namju-a-flustered` | 스탠딩 | 스탠딩 A · 당황 | — | 자리 표시 |
| `sp-namju-a-soft` | 스탠딩 | 스탠딩 A · 다정 | s5-ok | 자리 표시 |
| `sp-namju-b-cool` | 스탠딩 | 스탠딩 B(무대 의상) · 시크 | s1-festival | 자리 표시 |
| `sp-namju-b-laugh` | 스탠딩 | 스탠딩 B(무대 의상) · 웃음 | — | 자리 표시 |
| `cg-band-spotlight` | CG | 밴드 공연 기타 솔로, 스포트라이트 | s1-festival | 자리 표시 |
| `cg-bench-talk` | CG | Stage 6 노을 벤치 깊은 대화 | s6 | 자리 표시 |
| `cg-true-ending` | CG | TRUE ENDING | true-ending | 자리 표시 |
| `rx-namju-lol` | 리액션 | 배드 엔딩 · "ㅋㅋ 뭐래" | s2 배드1, s4 배드2 | `face-laugh`로 대신 |
| `rx-namju-broke` | 리액션 | 배드 엔딩 · 텅 빈 통장 | s3 배드3 | `face-flustered`로 대신 |
| `rx-namju-blocked` | 리액션 | 배드 엔딩 · 차단 | s2 배드3 | `face-serious`로 대신 |
| `pr-flyers` | 소품 | Stage 1 동아리 박람회 빈 전단지 (떨어지는 연출) | — | 자리 표시 |
| `pr-menu-board` | 소품 | Stage 3 식당 빈 칠판 메뉴판 | s3 | 자리 표시 |
| `pr-bankbook` | 소품 | Stage 3 배드 엔딩 펼친 빈 통장 | s3 배드3 | 자리 표시 |
| `pr-timetable` | 소품 | Stage 4 배드 엔딩 빈 시간표 종이 | s4 배드2 | 자리 표시 |
| `pr-cheer-captain` | 소품 | Stage 1 ① 응원단장 컷인 (인물 컷) | — | 자리 표시 |

## 완료

| 파일 | 종류 | 무엇 |
| --- | --- | --- |
| `namju-sheet` | 기준 | 남주 캐릭터 시트 (기준 이미지) |
| `kv-title` | 키 비주얼 | 타이틀 · 로비 |
| `bg-campus-gate` | 배경 | 오프닝, 프롤로그, Stage 1, 맞팔로우 |
| `face-smile` | 얼굴 컷 | 얼굴 컷 · 미소 |
| `face-laugh` | 얼굴 컷 | 얼굴 컷 · 웃음 |
| `face-cool` | 얼굴 컷 | 얼굴 컷 · 시크 |
| `face-serious` | 얼굴 컷 | 얼굴 컷 · 진지 |
| `face-flustered` | 얼굴 컷 | 얼굴 컷 · 당황 |
| `face-soft` | 얼굴 컷 | 얼굴 컷 · 다정 |
| `pr-napkin` | 소품 | Stage 1 ② 냅킨 쪽지 |
