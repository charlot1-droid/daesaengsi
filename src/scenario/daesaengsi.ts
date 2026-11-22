/**
 * 대생시 대본 — ⚠️ 임시본 (구조 확인용)
 *
 * 장면 흐름·선택지·배드 엔딩·DM·소품·팀 나눔 자리는 실제 구조대로 잡았고,
 * 문장은 디자인 시스템 예시 문장 + 자리채움이에요. 대본(docx)이 확정되면 문장만 바꿔 넣어요.
 * 자리채움 문장에는 '[대본]'이 붙어 있어요 → `npm run check`가 남은 개수를 알려 줘요.
 *
 * 규칙 요약 (자세한 건 schema.ts)
 *  - 대사 한 줄 20~28자, 1~2줄. 넘치면 비트를 나눠요.
 *  - 남주 존댓말, 친구 반말, 나레이터 예능 MC 톤.
 *  - 이모지는 대본 속 메시지(DM)에만.
 */
import type { Scenario } from './schema';

export const scenario: Scenario = {
  title: '대생시: 대학 생활 시뮬레이션',
  start: 'prologue',
  hearts: 5,
  cast: {
    narrator: { name: '나레이터', tab: 'narrator' },
    yeoju: { name: '김여주', sub: '나', tab: 'yeoju' },
    namju: { name: '김남주', sub: '밴드 동아리 선배', tab: 'namju' },
    friend: { name: '친구', tab: 'namju' },
    captain: { name: '응원단장', tab: 'namju' },
  },
  scenes: [
    /* ───────────── 프롤로그 ───────────── */
    {
      id: 'prologue',
      bg: 'bg-campus-gate',
      beats: [
        { t: 'notice', text: '여러분이 고르는 답이\n여주의 대학 생활이 됩니다', sub: '휴대폰에서 1·2·3 중 하나를 눌러 주세요' },
        { t: 'say', who: 'narrator', text: '[대본] 드디어 꿈에 그리던 대학교 입학!' },
        { t: 'say', who: 'yeoju', text: '[대본] (두근두근) 여기가 내 캠퍼스…!' },
      ],
      next: 's1',
    },

    /* ───────────── Stage 1 · 첫 만남 (갈래가 셋, 다시 합쳐져요) ───────────── */
    {
      id: 's1',
      stage: { n: 'Stage 1', name: '운명의 첫 만남' },
      bg: 'bg-campus-gate',
      beats: [
        { t: 'splash', title: '운명의 첫 만남', sub: '[대본] 새내기의 3월' },
        { t: 'say', who: 'friend', text: '[대본] 여주야, 오늘 뭐 할래?' },
      ],
      choice: {
        q: '[대본] 남주 선배를 어디서 처음 만날까?',
        seconds: 30,
        options: [
          { label: '[대본] 축제 밴드 공연 보러 가기', go: 's1-festival', verdict: '축제로!' },
          { label: '[대본] 동아리 박람회 구경하기', go: 's1-fair', verdict: '박람회로!' },
          { label: '[대본] 새터 장기자랑 나가기', go: 's1-ot', verdict: '새터로!' },
        ],
      },
    },
    {
      id: 's1-festival',
      stage: { n: 'Stage 1', name: '운명의 첫 만남' },
      bg: 'bg-festival-night',
      night: true,
      beats: [
        { t: 'say', who: 'captain', text: '[대본] 다들 소리 질러어어!', fx: 'shake' },
        { t: 'notice', text: '여주의 심장 BPM 180', sub: '응원단장 호감도 주가 300% 폭등', tone: 'heart' },
        { t: 'bg', art: 'cg-band-spotlight', night: true },
        { t: 'sprite', face: 'cool', outfit: 'b' },
        { t: 'say', who: 'namju', text: '호응 최고였어요! 공연 끝나고 인스타 알려줄래요?', face: 'laugh' },
        { t: 'prop', art: 'pr-napkin', hand: 'pen', text: '공연 정말 멋졌어요!\n제 인스타는\n@yeoju_0302\n입니다 :)', place: { x: '15%', y: '24%', w: '62%', rot: '-4deg', fs: 64 } },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-fair',
      stage: { n: 'Stage 1', name: '운명의 첫 만남' },
      bg: 'bg-club-fair',
      beats: [
        { t: 'say', who: 'narrator', text: '[대본] 사방에서 전단지가 날아옵니다!', fx: 'flyers', sfx: 'whoosh' },
        { t: 'sprite', face: 'smile' },
        { t: 'say', who: 'namju', text: '혹시 새내기예요? 반가워요!\n인스타 아이디 알려줄래요?' },
        { t: 'say', who: 'yeoju', text: '(당황하며) 네, 네? 저… 저요?' },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-ot',
      stage: { n: 'Stage 1', name: '운명의 첫 만남' },
      bg: 'bg-orientation-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '[대본] 장기자랑 무대에 오른 여주!' },
        { t: 'sprite', face: 'laugh' },
        { t: 'say', who: 'namju', text: '[대본] 와, 진짜 재밌었어요!' },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-follow',
      stage: { n: 'Stage 1', name: '운명의 첫 만남' },
      bg: 'bg-campus-gate',
      beats: [
        { t: 'sprite', face: null },
        { t: 'notify', text: '남주 선배가 팔로우 요청을 보냈어요', face: 'laugh', affinity: 1, sfx: 'heart' },
        { t: 'say', who: 'yeoju', text: '[대본] 맞팔… 해도 되겠지?' },
      ],
      next: 's2',
    },

    /* ───────────── Stage 2 · 첫 메시지 (DM) ───────────── */
    {
      id: 's2',
      stage: { n: 'Stage 2', name: '두근두근 첫 메시지' },
      bg: 'bg-room-night',
      night: true,
      beats: [
        { t: 'splash', title: '두근두근 첫 메시지', sub: '[대본] 그날 밤, 여주의 방' },
        { t: 'say', who: 'yeoju', text: '[대본] 선배한테 먼저 DM 보내 볼까…?' },
      ],
      choice: {
        q: '남주 선배에게 보낼 첫 메시지는?',
        seconds: 20,
        options: [
          {
            label: '"저랑 사귀어주세요 ♡"',
            bad: {
              title: '선배가 웃음을\n참지 못했습니다',
              back: '메시지 쓰기 전으로 돌아가요. 15초 안에 다시 고르세요.',
              react: 'rx-namju-lol',
              beats: [{ t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'laugh', time: '오늘 밤 11:42', msgs: [{ from: 'me', text: '저랑 사귀어주세요 ♡' }, { from: 'them', text: 'ㅋㅋ 뭐래' }] }],
            },
          },
          {
            label: '"선배, 밥약해주세요!"',
            go: 's2-ok',
            affinity: 1,
            verdict: '밥약 성공',
          },
          {
            label: '"이건 내 이모지야" (이상한 짤 전송)',
            phone: '"이건 내 이모지야"',
            bad: {
              title: '선배에게\n차단당했습니다',
              back: '메시지 쓰기 전으로 돌아가요. 15초 안에 다시 고르세요.',
              react: 'rx-namju-blocked',
              beats: [{ t: 'notice', text: '남주 선배님이 회원님을 차단했습니다.', sub: 'Stage 2 배드 엔딩', sfx: 'bad' }],
            },
          },
        ],
      },
    },
    {
      id: 's2-ok',
      stage: { n: 'Stage 2', name: '두근두근 첫 메시지' },
      bg: 'bg-room-night',
      night: true,
      beats: [
        {
          t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'smile', time: '오늘 밤 11:42', read: true, sfx: 'dm',
          msgs: [
            { from: 'me', text: '선배, 밥약해주세요!' },
            { from: 'them', text: '오 좋아요ㅎㅎ 이번 주에 시간 돼요? 맛있는 거 사줄게요!' },
          ],
        },
        { t: 'notify', text: '남주 선배와 밥약이 잡혔어요', face: 'smile', sfx: 'heart' },
      ],
      next: 's3',
    },

    /* ───────────── Stage 3 · 밥약 메뉴 ───────────── */
    {
      id: 's3',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'splash', title: '밥약 메뉴 고르기', sub: '드디어 밥약 당일' },
        { t: 'sprite', face: 'smile' },
        { t: 'say', who: 'namju', text: '[대본] 먹고 싶은 거 아무거나 골라요!' },
        { t: 'prop', art: 'pr-menu-board', hand: 'chalk', text: '김치찌개 8,000\n제육볶음 9,000\n오마카세 시가', place: { x: '16%', y: '26%', w: '68%', rot: '0deg', fs: 64 } },
      ],
      choice: {
        q: '[대본] 여주가 고를 메뉴는?',
        seconds: 20,
        options: [
          { label: '김치찌개', go: 's3-ok', affinity: 1, verdict: '센스 만점' },
          { label: '제육볶음', go: 's3-ok', affinity: 1, verdict: '센스 만점' },
          {
            label: '오마카세 (시가)',
            bad: {
              title: '선배의 통장이\n텅 비었습니다',
              back: '메뉴 고르기 전으로 돌아가요. 15초 안에 다시 고르세요.',
              react: 'rx-namju-broke',
              beats: [{ t: 'prop', art: 'pr-bankbook', hand: 'print', text: '잔액 0원', place: { x: '20%', y: '44%', w: '60%', rot: '0deg', fs: 72 }, sfx: 'bad' }],
            },
          },
        ],
      },
    },
    {
      id: 's3-ok',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'say', who: 'namju', text: '[대본] 오, 저도 그거 좋아해요!', face: 'laugh' },
        { t: 'notify', text: '남주 선배의 호감도가 올랐어요', face: 'laugh', sfx: 'heart' },
      ],
      next: 's4',
    },

    /* ───────────── Stage 4 · 수강신청 ───────────── */
    {
      id: 's4',
      stage: { n: 'Stage 4', name: '수강신청 대전쟁' },
      bg: 'bg-pc-dawn',
      night: true,
      beats: [
        { t: 'splash', title: '수강신청 대전쟁', sub: '[대본] 새벽 9시 59분 50초' },
        { t: 'sprite', face: null },
        { t: 'screen', view: 'sugang', text: '[대본] 수강신청 대기 중', sub: '대기 순번 1,024번' },
        { t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'serious', time: '오전 9:58', msgs: [{ from: 'them', text: '[대본] 수강신청 꿀팁 알려줄까요? 😎' }] },
      ],
      choice: {
        q: '[대본] 여주의 수강신청 전략은?',
        seconds: 20,
        options: [
          { label: '[대본] 선배 꿀팁대로 장바구니부터', go: 's4-ok', affinity: 1, verdict: '올클 성공' },
          {
            label: '[대본] 아무 과목이나 일단 다 담기',
            bad: {
              title: '월~금\n1교시 확정',
              back: '수강신청 전으로 돌아가요. 15초 안에 다시 고르세요.',
              react: 'rx-namju-lol',
              beats: [{ t: 'prop', art: 'pr-timetable', hand: 'print', text: '월 1교시 · 화 1교시 · 수 1교시\n목 1교시 · 금 1교시', place: { x: '12%', y: '30%', w: '76%', rot: '-2deg', fs: 44 }, sfx: 'bad' }],
            },
          },
          { label: '[대본] 늦잠 자고 9시 10분에 접속', go: 's4-ok', verdict: '아슬아슬' },
        ],
      },
    },
    {
      id: 's4-ok',
      stage: { n: 'Stage 4', name: '수강신청 대전쟁' },
      bg: 'bg-pc-dawn',
      night: true,
      beats: [
        { t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'smile', time: '오전 10:02', read: true, msgs: [{ from: 'me', text: '[대본] 선배 덕분에 성공했어요!' }, { from: 'them', text: '[대본] 오 대박ㅎㅎ 같은 수업 있네요?' }] },
      ],
      next: 's5',
    },

    /* ───────────── Stage 5 · 조별과제 ───────────── */
    {
      id: 's5',
      stage: { n: 'Stage 5', name: '조별과제 생존기' },
      bg: 'bg-desk-2am',
      night: true,
      beats: [
        { t: 'splash', title: '조별과제 생존기', sub: '[대본] 새벽 2시, 마감 6시간 전' },
        {
          t: 'phone', title: '[대본] 3조 단톡방 (4)', time: '오전 2:04', msgs: [
            { from: 'them', name: '[대본] 조원1', text: '[대본] 저 자료 아직 못 했어요ㅠ' },
            { from: 'them', name: '김남주', text: '[대본] 제가 PPT 맡을게요!' },
          ],
        },
      ],
      choice: {
        q: '[대본] 여주는 어떻게 할까?',
        seconds: 20,
        options: [
          { label: '[대본] 같이 밤새서 끝내자고 하기', go: 's5-ok', affinity: 1, verdict: '팀플 구원자' },
          { label: '[대본] 몰래 잠수 타기', go: 's5-ok', verdict: '[대본]' },
          { label: '[대본] 선배에게 다 맡기기', go: 's5-ok', verdict: '[대본]' },
        ],
      },
    },
    {
      id: 's5-ok',
      stage: { n: 'Stage 5', name: '조별과제 생존기' },
      bg: 'bg-bench-sunset',
      beats: [
        { t: 'sprite', face: 'soft' },
        { t: 'say', who: 'namju', text: '[대본] 수고했어요. 잠깐 바람 쐴래요?' },
      ],
      next: 's6',
    },

    /* ───────────── Stage 6 · 깊은 대화 + 팀 나눔 ───────────── */
    {
      id: 's6',
      stage: { n: 'Stage 6', name: '노을 아래 깊은 대화' },
      bg: 'cg-bench-talk',
      beats: [
        { t: 'splash', title: '노을 아래 깊은 대화', sub: '[대본]' },
        { t: 'say', who: 'namju', text: '[대본] 여주 씨는 대학에서 뭘 해 보고 싶어요?', face: null },
        { t: 'share', q: '대학에 가면 꼭 이루고 싶은 것은?', hint: '예를 들면 취업, 연애, 해외. 보기에 없는 답도 좋아요.', seconds: 40 },
        { t: 'share', q: '[대본] 팀 나눔 질문 2', seconds: 40 },
        { t: 'share', q: '[대본] 팀 나눔 질문 3', seconds: 40 },
      ],
      next: 'true-ending',
    },

    /* ───────────── TRUE ENDING · 에필로그 ───────────── */
    {
      id: 'true-ending',
      stage: { n: 'TRUE ENDING', name: '[대본]' },
      bg: 'cg-true-ending',
      beats: [
        { t: 'splash', title: 'TRUE ENDING', sub: '[대본]' },
        { t: 'say', who: 'namju', text: '[대본] 엔딩 대사' },
      ],
      next: 'epilogue',
    },
    {
      id: 'epilogue',
      bg: 'bg-epilogue-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '[대본] 에필로그' },
        { t: 'screen', view: 'reveal', text: '[대본] CCC 공개', sub: '[대본] 한 줄 소개' },
        { t: 'notice', text: '함께해 줘서 고마워요', sub: '휴대폰에서 안내를 확인해 주세요' },
      ],
      end: true,
    },
  ],
};
