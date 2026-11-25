# 아트 디렉션 · 이미지 생성 바이블

AI 생성 이미지가 서로 다른 게임처럼 보이지 않게, **모든 그림을 같은 ChatGPT 대화 안에서**, 아래 고정 블록을 그대로 붙여 만들어요. 대화가 끊기면 새 대화에 기준 이미지 3장(`namju-sheet`, `bg-campus-gate`, `kv-title`)을 첨부하고 "이 세 장이 기준이다"라고 먼저 선언한 뒤 이어서 만들어요.

## 1. 고정 블록 (매 프롬프트에 그대로)

**STYLE LOCK**
```
Korean otome-game / premium webtoon illustration, clean thin lineart with soft cel shading and gentle painterly light, delicate hair strands with glossy highlights, slightly desaturated spring pastel palette (cherry-blossom pink, sky blue, warm cream, deep ink navy), soft bloom and light leaks, airy atmosphere, mature-but-youthful proportions (about 1:7.5 head-to-body). NO text, letters, logos or watermark.
```

**CHARACTER LOCK — 김남주**
```
Namju: 21-year-old Korean university sophomore, chemistry major and lead guitarist of the campus band, 183cm, slim with broad shoulders. Soft black hair with a faint blue sheen, textured two-block cut, longer fringe just over the eyebrows, a few loose strands. Calm double-lidded eyes, dark gray-brown irises, straight brows, clean jawline, small mole under the left eye. Outfit A: oversized cream cable-knit cardigan over a plain white crew-neck tee, black wide slacks, white sneakers, thin silver ring on right index finger, black guitar-pick necklace. Keep his face, hair and outfit EXACTLY identical to the Namju character sheet above.
```
의상 B (무대): `open black overshirt over the same white tee, black guitar strap, same necklace and ring.`

**여주는 그림에 넣지 않아요 (11/25)**
여주는 배우가 무대에서 직접 연기해요. 그래서 모든 그림은 **여주의 눈으로 본 장면**이고, 여주는 뒷모습·머리카락·손으로도 나오지 않아요. 매 프롬프트에 붙여요.
```
IMPORTANT: Yeoju (the heroine) must NOT appear anywhere in this image — no back view, no hair, no hands, no shoulder. She is played live on stage, so the image is drawn from her point of view.
```

**CHARACTER LOCK — 새봄 (여주의 친구)** · 기준 이미지 `saebom-sheet` · 11/25 장발로 바꿈 (현장의 여주 배우가 단발이라 겹치지 않게)
```
Saebom — 20-year-old Korean university freshman girl, about 162cm, cheerful and bright. LONG straight dark chocolate-brown hair worn down, reaching mid-back, with light see-through bangs and a small butter-yellow hair clip above her LEFT ear. Round bright eyes with warm brown irises, rosy cheeks, friendly face. Outfit (always identical): oversized light sky-blue hoodie with white drawstrings, light-wash straight jeans, white sneakers, small cream crossbody bag with a thin strap from her right shoulder. Her face, LONG hair, hair clip and outfit must match the Saebom character sheet EXACTLY.
```
새봄 스탠딩: `sp-saebom-{smile, laugh, surprised, wave, wink}` — 남주 스탠딩과 같은 2:3 투명, 허벅지 위. 둘이 함께 서면 새봄 왼쪽 · 남주 오른쪽.

**NEGATIVE**
```
No school uniforms, no blazers, no neckties (university students). No extra fingers, no speech bubbles, no UI, no text.
```

## 2. 종류별 규격

| 종류 | 비율·크기 | 구도 규칙 | 저장 이름 |
| --- | --- | --- | --- |
| 배경 | 16:9, 1792×1024 | 눈높이, 사람 없음, **위 1/3은 하늘·벚꽃처럼 단순하게** (대사창·선택지 자리) | `bg-<장소>.png` |
| 스탠딩 | 2:3 세로, 투명 배경 PNG | 정면 3/4, 허리 위, 모든 표정이 같은 구도. 무대에서는 얼굴이 화면 가운데(위에서 35~55%)에 오도록 배치 | `sp-namju-<의상>-<표정>.png` |
| CG | 16:9 | 캐릭터 + 장면, **여주 없음**(여주 시점), 인물 얼굴은 화면 가운데~아래쪽 (무대에서는 위 30%가 대사 띠로 쓰여서 그림이 그 아래에 그려져요) | `cg-<장면>.png` |
| 리액션 컷 | 1:1 | 가슴 위, 과장된 표정 (BAD ENDING용) | `rx-namju-<상황>.png` |
| 소품 | 1:1, 투명 배경 PNG | 이야기 속 물건을 가까이서 본 그림. **글씨는 절대 그리지 않고 빈 면으로** 생성해요. 내용은 화면에서 손글씨·인쇄체 글꼴로 얹어요(한글이 깨지지 않고, 대본을 바꾸면 바로 바뀌어요) | `pr-<물건>.png` |

## 3. 제작 목록 (대본 기준)

| # | 파일 | 쓰는 곳 | 상태 |
| --- | --- | --- | --- |
| 1 | namju-sheet | 기준 · 캐릭터 | ✅ 완료 |
| 2 | bg-campus-gate | 오프닝, 프롤로그, Stage 1, 맞팔로우 | ✅ 완료 |
| 3 | kv-title | 타이틀 화면 | ✅ 완료 |
| 4 | bg-festival-night | Stage 1 ① 축제, 밴드 공연 | 대기 |
| 5 | bg-club-fair | Stage 1 ② 동아리 박람회 | 대기 |
| 6 | bg-orientation-night | Stage 1 ③ 새터 장기자랑 | 대기 |
| 7 | bg-room-night | Stage 2 여주의 방 (DM) | 대기 |
| 8 | bg-restaurant | Stage 3 밥약 식당 (메뉴판은 UI로 얹음) | 대기 |
| 9 | bg-pc-dawn | Stage 4 수강신청 새벽 | 대기 |
| 10 | bg-desk-2am | Stage 5 조별과제 새벽 2시 | 대기 |
| 11 | bg-bench-sunset | Stage 5 끝, Stage 6 노을 벤치 | 대기 |
| 12 | bg-epilogue-night | 에필로그 밤하늘과 벚꽃 | 대기 |
| 13–18 | sp-namju-a-{smile, laugh, cool, serious, flustered, soft} | 대사 중 스탠딩 | 대기 |
| 19–20 | sp-namju-b-{cool, laugh} | 밴드 무대 | 대기 |
| 21 | cg-band-spotlight | 밴드 공연 기타 솔로 | 대기 |
| 22 | cg-bench-talk | Stage 6 깊은 대화 | 대기 |
| 23 | cg-true-ending | TRUE ENDING | 대기 |
| 24–26 | rx-namju-{lol, broke, blocked} | BAD ENDING 3종 (ㅋㅋ 뭐래 / 통장 / 차단) | 대기 |

### 소품 (글자는 화면에서 얹어요)

| # | 파일 | 쓰는 곳 | 얹는 글자 |
| --- | --- | --- | --- |
| 27 | pr-napkin | Stage 1 ② 쪽지 | "공연 정말 멋졌어요! 제 인스타는 @yeoju_0302 입니다 :)" (볼펜 손글씨) |
| 28 | pr-flyers | Stage 1 동아리 박람회 전단지 폭격 | 동아리 이름 (전단지마다 다르게, 떨어지는 애니메이션) |
| 29 | pr-menu-board | Stage 3 식당 메뉴판 | 김치찌개 8,000 / 제육볶음 9,000 / 오마카세 시가 (분필 글씨) |
| 30 | pr-bankbook | Stage 3 배드 엔딩 통장 | 잔액 0원 |
| 31 | pr-timetable | Stage 4 배드 엔딩 시간표 | 월~금 1교시만 빼곡 |
| 32 | pr-cheer-captain | Stage 1 ① 응원단장 컷인 | (글자 없음, 인물 컷) |

수강신청 모니터, 인스타 DM, 차단 알림처럼 **화면 속 화면**은 그림이 아니라 HTML로 만들어요(PhoneDM처럼).

## 4. 프롬프트 템플릿

**배경**
```
Image N: BACKGROUND, landscape 16:9 (1792x1024), same art style as the campus-gate background above. Scene: <장소·시간·빛>. Eye-level camera, NO people. Keep the UPPER third calm and simple (open sky, soft blossoms) because the dialogue box sits at the top of the screen. [STYLE LOCK] [NEGATIVE]
```

**스탠딩**
```
Image N: SPRITE of Namju, portrait 2:3, fully TRANSPARENT background PNG. Front 3/4 view, thigh-up framing, top of head 4% from the top edge, cropped at mid-thigh — identical framing to the previous sprites. Expression: <표정>. Outfit <A/B>. [CHARACTER LOCK — 김남주] [STYLE LOCK] [NEGATIVE]
```

**소품**
```
Image N: a PROP for an in-game close-up, same art style as images 1-3. Subject: <물건>, seen from above with a slight tilt. Its surface must be COMPLETELY BLANK: no writing, no letters, no logo, no print. Soft natural shadow. Fully TRANSPARENT background (PNG with alpha). Square 1024x1024, the object filling about 75% of the frame. NO text anywhere. [STYLE LOCK]
```

**CG**
```
Image N: CG, landscape 16:9. <장면>. Namju <행동·표정>, looking toward the viewer (Yeoju's point of view). Faces in the middle band. [여주 없음 블록] [CHARACTER LOCK] [STYLE LOCK] [NEGATIVE]
```

## 5. 검수 체크리스트 (매 장)
- 남주: 앞머리 길이, 왼눈 밑 점, 은반지, 피크 목걸이, 크림 니트 꽈배기 무늬가 시트와 같은가
- 여주가 그림 어디에도 없는가 (뒷모습·머리카락·손도 없음)
- 글자·간판·로고가 생기지 않았는가 (생기면 같은 프롬프트로 "remove all text"를 요청해 수정)
- 배경 위 1/3이 단순한가 (대사창 자리), 인물 얼굴이 위 1/3에 걸리지 않는가
- 색감이 기준 배경과 같은 파스텔 톤인가 (너무 진하면 "match the palette of the campus-gate background"로 수정)

## 6. 파일 흐름
1. ChatGPT(Chrome)에서 생성 → `ds_<이름>.png`으로 컴퓨터의 `대생시` 폴더에 저장 (원본 보관)
2. 작업 공간에서 WebP(배경 품질 88, 1920폭) / 투명 PNG→WebP 알파로 변환
3. 게임 저장소 `public/art/…`와 이 디자인 시스템의 Assets에 같은 이름으로 넣음


## 일관성 팁 (11/25)
- 새 장면은 **새 대화**에서 남주 시트(`ds_namju_sheet.png`)와 스탠딩 한 장을 첨부하고 시작하면 옛 그림이 섞이지 않아요.
- 남주 머리: 직모 투블럭, 앞머리가 눈썹 위. 웨이브·장발·헝클어짐이 나오면 다시 뽑기.
- 손 흔드는 포즈는 팔과 손이 이어져 있는지 꼭 확인 (타이틀 그림에서 손이 떠 있던 문제).
