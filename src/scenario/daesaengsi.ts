/**
 * 대생시 대본 — 「대생시_대본_수정본 1.docx」를 옮긴 것
 *
 * 대본(docx)의 문장을 그대로 옮기고, 대사창에 맞게 줄만 나눴어요.
 * 대본과 다른 곳은 아래 네 가지뿐이에요.
 *  1. 팻말 → 휴대폰 투표: 오프닝 규칙 대사·규칙 판 (docx 메모 '투표시스템 되면 바꾸기')
 *  2. Stage 4(수강신청)는 대본에 없어서 뺐고, 조별과제 = Stage 4, 깊은 대화 = Stage 5로 번호를 당겼어요.
 *  3. 호감도: 대본은 Stage 3의 ♥♥♥까지만 적혀 있어서, 깊은 대화 뒤 +1, 마지막 선택 +1로 TRUE ENDING에 ♥♥♥♥♥.
 *  4. 대본에 없는 짧은 문구: 휴대폰 결과 카드 제목(verdict), 일부 배드 엔딩 판 제목(대본 문장에서 따옴),
 *     팀 나눔 판의 제목(나레이터 대사에서 따옴).
 *
 * 11/25 추가: 새봄이 스탠딩으로 등장(말할 때 표정, 남주와 함께면 왼쪽), 에필로그 선물이 「새생활의 시작」(새생시) 책자로 바뀜.
 * 대본 3차 수정(11/25) 반영: 팀 나눔이 '질문 5개 중 원하는 것으로 10분 자유 나눔'으로 바뀌어 한 판에 모았고,
 * 마지막 [화면](혼자 시작하지 마세요 + 로고)이 대본에서 빠져서 마지막 장면은 나레이터 인사로 끝나요.
 *
 * 규칙 요약 (자세한 건 schema.ts)
 *  - 대사 한 줄 20~28자, 1~2줄. 넘치면 비트를 나눠요.
 *  - 남주 존댓말, 친구 반말, 나레이터 예능 MC 톤.
 *  - 이모지는 대본 속 메시지(DM)에만. (대본의 [화면] 이모지는 판에서 뺐어요.)
 *  - 나레이터·여주 대사는 무대에서 직접 말해요. 진행자가 S를 누르면 화면에서 숨겨요.
 */
import type { Scenario } from './schema';

/** 팀 나눔 시간 — 대본 '팀 나눔 (총 10분)'. 질문을 골라 자유롭게 나누므로 타이머는 하나예요. */
const SHARE_SECONDS = 600;

export const scenario: Scenario = {
  title: '대생시: 대학 생활 시뮬레이션',
  start: 'opening',
  hearts: 5,
  cast: {
    narrator: { name: '나레이터', tab: 'narrator' },
    yeoju: { name: '김여주', sub: '나', tab: 'yeoju' },
    namju: { name: '김남주', sub: '밴드 동아리 선배', tab: 'namju' },
    friend: { name: '친구', tab: 'namju' },
    saebom: { name: '새봄', sub: '여주의 친구', tab: 'namju' },
    captain: { name: '응원단장', tab: 'namju' },
  },
  scenes: [
    /* ───────────── 오프닝 ───────────── */
    {
      id: 'opening',
      bg: 'kv-title',
      beats: [
        { t: 'screen', view: 'title', text: '대생시', sub: '대학 생활 시뮬레이션' },
        { t: 'say', who: 'narrator', text: '안녕하세요 여러분!' },
        { t: 'say', who: 'narrator', text: '오늘 여러분은 구경꾼이 아니라,\n주인공이 될겁니다!' },
        { t: 'say', who: 'narrator', text: '룰은 간단합니다.' },
        { t: 'say', who: 'narrator', text: '하나, 지금 앉아 있는 자리의\n순장님, 친구들과 함께 팀입니다.' },
        { t: 'say', who: 'narrator', text: '둘, 화면에 선택지가 뜨면\n15초에서 30초 안에 상의해서' },
        // 대본: '①②③ 중 하나를 팻말로 들어 주세요' → 휴대폰 투표로 바꿈
        { t: 'say', who: 'narrator', text: '휴대폰에서 ①②③ 중 하나를\n눌러 주세요.' },
        { t: 'say', who: 'narrator', text: '셋, 잘못된 선택을 하면…' },
        { t: 'say', who: 'narrator', text: '코믹한 배드 엔딩 후\n체크포인트로 회귀합니다.' },
        { t: 'say', who: 'narrator', text: '마지막 목표는 오직 하나,\n진엔딩입니다!' },
        // 대본: '② 팻말 ①②③ 들기' → 휴대폰 투표로 바꿈
        { t: 'notice', text: '① 팀별로 상의하기\n② 휴대폰에서 ①②③ 누르기\n③ 목표: TRUE ENDING ♡', sub: '게임 규칙', sfx: 'pop' },
        { t: 'say', who: 'narrator', text: '준비되셨나요?\n그럼 우리의 주인공을 소개합니다.' },
        { t: 'say', who: 'narrator', text: '이름은 김여주!\n큰 박수로 맞아 주세요!' },
        { t: 'say', who: 'yeoju', text: '(손 흔들며) 안녕하세요~!\n잘 부탁드려요!' },
      ],
      next: 'prologue',
    },

    /* ───────────── 프롤로그 · 설레는 새내기 입학 ───────────── */
    {
      id: 'prologue',
      stage: { n: '프롤로그', name: '설레는 새내기 입학' },
      bg: 'bg-campus-gate',
      beats: [
        { t: 'splash', title: '설레는 새내기 입학' },
        { t: 'say', who: 'narrator', text: '수능이라는 거대한 산을 넘은 여주.' },
        { t: 'say', who: 'narrator', text: '그녀는 꿈에 그리던\n대학교 정문 앞에 서 있습니다.' },
        { t: 'say', who: 'yeoju', text: '(정문을 올려다보며) 와…\n내가 진짜 여기 다니는 거야?' },
        { t: 'say', who: 'yeoju', text: '캠퍼스 낭만, 동아리, 연애…\n나 대학 생활 완벽하게 할 거야!' },
        { t: 'say', who: 'narrator', text: '하지만 그녀는 아직 모릅니다.' },
        { t: 'say', who: 'narrator', text: '이 캠퍼스에는 수많은 선택의\n갈림길이 기다리고 있다는 것을…' },
        { t: 'say', who: 'friend', text: '여주야! 오늘 학교에서\n행사 엄청 많대. 같이 돌아다니자!' },
        { t: 'say', who: 'yeoju', text: '좋아! 가보자!' },
      ],
      next: 's1',
    },

    /* ───────────── Stage 1 · 대학 생활의 첫 선택 ─────────────
       ① 축제 → 밴드 공연    ② 박람회 → 선배와 첫 대화    ③ 새터 → 밴드 공연
       어느 길이든 '맞팔로우'(s1-follow)에서 다시 만나요. */
    {
      id: 's1',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-campus-gate',
      beats: [
        { t: 'splash', title: '대학 생활의 첫 선택' },
        { t: 'say', who: 'narrator', text: '캠퍼스 라이프의 꽃!' },
        { t: 'say', who: 'narrator', text: '여주가 가장 먼저 도전해보고 싶은\n활동은 무엇일까요?' },
        { t: 'say', who: 'narrator', text: '팀별로 30초 드립니다!' },
      ],
      choice: {
        q: '여주가 가장 먼저 도전해보고 싶은 활동은?',
        seconds: 30,
        options: [
          { label: '축제 공연 구경', go: 's1-festival', verdict: '축제로!' },
          { label: '중앙 동아리 둘러보기', go: 's1-fair', verdict: '박람회로!' },
          { label: '새터(새내기 배움터) 참여', go: 's1-ot', verdict: '새터로!' },
        ],
      },
    },

    /* ① 축제 공연 구경 */
    {
      id: 's1-festival',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-festival-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '여주는 축제 무대 앞으로 갑니다!' },
        { t: 'prop', art: 'pr-cheer-captain', hand: 'print', text: '', size: 820, frame: true, sfx: 'whoosh' }, // 응원단장 컷인 (글자 없음)
        { t: 'say', who: 'captain', text: '여러분!!! 소리 질러!!!!', fx: 'shake' },
        { t: 'say', who: 'yeoju', text: '(넋을 놓고) 저… 저 사람 누구야…\n심장이 왜 이래…' },
        { t: 'notice', text: '여주의 심장 BPM: 180', sub: '응원단장 호감도 주가 +300% 폭등!', tone: 'heart', sfx: 'heart' },
        { t: 'say', who: 'friend', text: '야, 정신 차려. 입 벌어졌어.' },
        { t: 'say', who: 'narrator', text: '그때! 다음 순서로 학교 밴드\n동아리의 공연이 시작됩니다.' },
      ],
      next: 's1-band',
    },

    /* ② 중앙 동아리 둘러보기 */
    {
      id: 's1-fair',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-club-fair',
      beats: [
        { t: 'say', who: 'narrator', text: '동아리 박람회!\n전단지 폭격이 시작됩니다!', fx: 'flyers', sfx: 'whoosh' },
        { t: 'say', who: 'yeoju', text: '(양손 가득 전단지)\n가방이 왜 이렇게 무겁지…' },
        { t: 'say', who: 'narrator', text: '그때! 누군가 웃으며 말을 겁니다.' },
        { t: 'say', who: 'namju', text: '혹시 새내기예요? 반가워요!', face: 'laugh' },
        { t: 'say', who: 'namju', text: '근데 너무 힘들어보이시는데,\n무슨 일 있어요?', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(당황하며) 네, 네?! 저… 저요?' },
      ],
      next: 's1-talk',
    },

    /* ② → 선배와 첫 대화 */
    {
      id: 's1-talk',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-club-fair',
      beats: [
        { t: 'sprite', face: 'smile' },
        { t: 'say', who: 'narrator', text: '선배의 갑작스러운 질문!' },
        { t: 'say', who: 'narrator', text: '여주는 뭐라고 대답해야 할까요?\n20초 드립니다!' },
        { t: 'sprite', face: null }, // 선택지 판이 얼굴을 가려서 내려 둬요
      ],
      choice: {
        q: '여주의 대답은?',
        seconds: 20,
        options: [
          { label: '"가방이 너무 무거워서요…"', go: 's1-talk-bag', verdict: '첫 대화 성공' },
          { label: '"같이 돌아다닐 친구가 없어서요…"', go: 's1-talk-alone', verdict: '첫 대화 성공' },
          {
            label: '"왜요? 저한테 관심 있어요?"',
            bad: {
              title: '남주 선배가\n빠르게 사라졌습니다',
              back: '선배 대답 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'face-flustered',
              beats: [
                { t: 'say', who: 'yeoju', text: '(눈을 가늘게 뜨고) 왜요?\n저한테 관심 있어요?' },
                { t: 'say', who: 'namju', text: '(당황하며) 네…?\n아, 아니, 그게 아니라…', face: 'flustered' },
                { t: 'say', who: 'namju', text: '너무 힘들어 보여서…' },
                { t: 'say', who: 'namju', text: '(뒷걸음질 치며)\n저 부스 정리하러 가볼게요…' },
                { t: 'sprite', face: null },
                { t: 'notify', text: '남주 선배가 빠르게 사라졌습니다.', face: 'flustered', sfx: 'whoosh' },
                { t: 'say', who: 'yeoju', text: '(허공을 보며) 아니…\n그냥 장난으로 한 말인데…' },
              ],
            },
          },
        ],
      },
    },
    {
      id: 's1-talk-bag',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-club-fair',
      beats: [
        { t: 'sprite', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(전단지 더미를 들어 보이며) 아…' },
        { t: 'say', who: 'yeoju', text: '전단지를 받다 보니까\n가방이 너무 무거워져서요…' },
        { t: 'say', who: 'namju', text: '(웃으며) 아~\n동아리 박람회 전단지 폭격,', face: 'laugh' },
        { t: 'say', who: 'namju', text: '새내기라면 누구나 겪는\n신고식이죠.' },
        { t: 'say', who: 'namju', text: '이리 줘요, 내가 들어 줄게요.\n(전단지 절반을 받아 든다)', face: 'smile' },
        { t: 'say', who: 'namju', text: '이왕 만난 김에,\n우리 동아리 인스타 한번 볼래요?' },
        { t: 'say', who: 'namju', text: '활동 사진도 있고,\n신입 단톡방 링크도 거기 있어요.' },
        { t: 'notify', text: '동아리 계정 팔로우 → 남주 선배가 맞팔 요청을 보냈습니다!', face: 'laugh', affinity: 1, sfx: 'heart' },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-talk-alone',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-club-fair',
      beats: [
        { t: 'sprite', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(머뭇거리며) 같이 오기로 한 친구가\n수업 때문에 먼저 가 버려서요…' },
        { t: 'say', who: 'yeoju', text: '혼자 돌아다니려니까\n좀 뻘쭘하더라고요.' },
        { t: 'say', who: 'namju', text: '아, 그럴 수 있죠.', face: 'soft' },
        { t: 'say', who: 'namju', text: '나도 새내기 때 혼자\n박람회 왔다가 한참 헤맸어요.' },
        { t: 'say', who: 'namju', text: '혼자 다니면 어색한 게 당연해요.' },
        { t: 'say', who: 'namju', text: '괜찮으면 우리 동아리 인스타부터\n팔로우해 줄래요?', face: 'smile' },
        { t: 'say', who: 'namju', text: '신입 단톡방 링크도 거기 있어서,\n같이 다닐 사람 금방 생길 거예요.' },
        { t: 'notify', text: '동아리 계정 팔로우 → 남주 선배가 맞팔 요청을 보냈습니다!', face: 'laugh', affinity: 1, sfx: 'heart' },
      ],
      next: 's1-follow',
    },

    /* ③ 새터 참여 */
    {
      id: 's1-ot',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-orientation-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '새터에서 열정 넘치는\n응원단 율동 시간이 시작됩니다!' },
        // 관객 참여 15초. 진행자: T = 타이머 처음부터, 스페이스 = 넘어가기
        { t: 'share', label: '관객 참여', q: '다 같이 율동 따라 하기!', seconds: 15, sfx: 'pop' },
        { t: 'say', who: 'yeoju', text: '(헉헉) 이게 맞나?' },
        { t: 'say', who: 'narrator', text: '새터 마지막 밤, 장기자랑 무대에서\n밴드 공연이 시작됩니다.' },
      ],
      next: 's1-band',
    },

    /* 밴드 공연 (①·③ 공통) */
    {
      id: 's1-band',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'cg-band-spotlight',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '무대 위, 기타를 멘 한 사람이\n눈에 들어옵니다.' },
        { t: 'say', who: 'narrator', text: '바로 밴드 동아리의 기타리스트,\n김남주 선배!' },
        { t: 'say', who: 'namju', text: '(기타 솔로) 지이이잉~♪' },
        { t: 'say', who: 'yeoju', text: '(넋을 놓고) 와…\n기타 치는 손 좀 봐…' },
        { t: 'say', who: 'yeoju', text: '말 걸고 싶은데, 어떻게 하지?' },
        { t: 'say', who: 'narrator', text: '20초 드립니다!\n신중하게 골라 주세요!' },
      ],
      choice: {
        q: '남주 선배에게 다가가려면?',
        seconds: 20,
        options: [
          { label: '맨 앞에서 열광하며 호응한다', go: 's1-band-cheer', verdict: '무대 위로!' },
          { label: '슬그머니 쪽지를 건넨다', go: 's1-band-note', verdict: '쪽지 전달 성공' },
          { label: '그 동아리에 가입한다', go: 's1-band-join', verdict: '동아리 가입!' },
        ],
      },
    },
    {
      id: 's1-band-cheer',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-festival-night',
      night: true,
      beats: [
        { t: 'say', who: 'yeoju', text: '(맨 앞줄에서 휴대폰 플래시를 흔들며)\n꺄아아! 선배 최고!!' },
        { t: 'sprite', face: 'laugh', outfit: 'b' },
        { t: 'say', who: 'namju', text: '거기 맨 앞에 너! 너 나와!!' },
        { t: 'say', who: 'yeoju', text: '(당황하며 자기를 가리키고)\n저요?! 저, 저 말이에요?!' },
        { t: 'notice', text: '스포트라이트 ON!', sub: '여주가 얼떨결에 무대 위로 끌려 올라갑니다', sfx: 'reveal' },
        { t: 'say', who: 'narrator', text: '얼떨결에 무대 위에 올라선 여주!' },
        { t: 'say', who: 'narrator', text: '쏟아지는 환호 속에서\n얼굴이 새빨개집니다.' },
        { t: 'say', who: 'namju', text: '호응 최고였어요!\n공연 끝나고 인스타 알려줄래요?', face: 'laugh' },
        { t: 'notify', text: '남주 선배가 팔로우 요청을 보냈습니다!', face: 'laugh', affinity: 1, sfx: 'heart' },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-band-note',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-festival-night',
      night: true,
      beats: [
        { t: 'say', who: 'yeoju', text: '(냅킨에 쓰며) 이름은 모르니까…\n인스타 아이디라도…' },
        { t: 'prop', art: 'pr-napkin', hand: 'pen', text: '공연 정말 멋졌어요!\n제 인스타는\n@yeoju_0302\n입니다 :)', place: { x: '15%', y: '24%', w: '62%', rot: '-4deg', fs: 64 } },
        { t: 'sprite', face: 'cool', outfit: 'b' },
        { t: 'say', who: 'namju', text: '(쪽지를 발견하고) 어?\n이거 새내기분이 두고 간 거예요?' },
        { t: 'say', who: 'namju', text: '…센스 있다.', face: 'laugh' },
        { t: 'notify', text: '남주 선배가 팔로우 요청을 보냈습니다!', face: 'laugh', affinity: 1, sfx: 'heart' },
      ],
      next: 's1-follow',
    },
    {
      id: 's1-band-join',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-festival-night',
      night: true,
      beats: [
        { t: 'say', who: 'yeoju', text: '(손을 번쩍 들고)\n저 밴드 동아리 가입하고 싶어요!' },
        { t: 'say', who: 'yeoju', text: '탬버린이라도 칠게요!' },
        { t: 'sprite', face: 'laugh', outfit: 'b' },
        { t: 'say', who: 'namju', text: '정말요? 환영이에요!' },
        { t: 'say', who: 'namju', text: '일단 동아리 인스타 계정부터\n팔로우해 주세요.' },
        { t: 'say', who: 'namju', text: '신입 단톡방 링크도 거기 있어요!' },
        { t: 'notify', text: '동아리 계정 팔로우 → 남주 선배가 맞팔 요청을 보냈습니다!', face: 'laugh', affinity: 1, sfx: 'heart' },
      ],
      next: 's1-follow',
    },

    /* 맞팔로우 (모든 경로 공통) */
    {
      id: 's1-follow',
      stage: { n: 'Stage 1', name: '대학 생활의 첫 선택' },
      bg: 'bg-campus-gate',
      beats: [
        { t: 'notify', text: '남주 선배와 맞팔로우가 되었습니다!', face: 'smile', sfx: 'pop' },
        { t: 'say', who: 'narrator', text: '다음 스테이지로!' },
      ],
      next: 's2',
    },

    /* ───────────── Stage 2 · 두근두근 첫 메시지 (DM) ───────────── */
    {
      id: 's2',
      stage: { n: 'Stage 2', name: '두근두근 첫 메시지' },
      bg: 'bg-room-night',
      night: true,
      beats: [
        { t: 'splash', title: '두근두근 첫 메시지', sub: '밤, 여주의 방' },
        { t: 'say', who: 'narrator', text: '맞팔로우가 되었습니다!' },
        { t: 'say', who: 'narrator', text: '여주는 화면을 보면서\n큰 고민에 빠집니다.' },
        { t: 'say', who: 'yeoju', text: '(머리를 싸매며) 먼저 연락해볼까…\n아니야… 해볼까…?' },
        { t: 'say', who: 'yeoju', text: '뭐라고 보내지?!' },
        { t: 'say', who: 'narrator', text: '신중하게 골라 주세요!\n한 번 보내면 취소는 없습니다.' },
        { t: 'say', who: 'narrator', text: '20초!' },
      ],
      choice: {
        q: '남주 선배에게 보낼 첫 메시지는?',
        seconds: 20,
        options: [
          {
            label: '"저랑 사귀어주세요 ♡"',
            bad: {
              title: '선배가 웃음을\n참지 못했습니다',
              back: '문자 보내기 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'rx-namju-lol',
              beats: [
                { t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'laugh', time: '오늘 밤 11:42', read: true, msgs: [{ from: 'me', text: '저랑 사귀어주세요 ♡' }, { from: 'them', text: 'ㅋㅋㅋ 뭐래' }] },
                { t: 'say', who: 'yeoju', text: '(얼굴 감싸 쥐며) 으아아아아악!!', sfx: 'bad' },
              ],
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
              back: '문자 보내기 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'rx-namju-blocked',
              beats: [
                { t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'serious', time: '오늘 밤 11:42', msgs: [{ from: 'me', text: '🤗😍' }] },
                { t: 'notice', text: '남주 선배님이 회원님을 차단했습니다.', sfx: 'bad' },
                { t: 'say', who: 'yeoju', text: '(허공을 보며)\n내 이모지가 어때서ㅠㅠ…' },
              ],
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
          t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'smile', time: '오늘 밤 11:42', sfx: 'dm',
          msgs: [
            { from: 'me', text: '선배, 밥약해주세요!' },
            { from: 'them', text: '오 좋아요ㅎㅎ 이번 주에 시간 돼요? 맛있는 거 사줄게요!' },
          ],
        },
        { t: 'notify', text: '남주 선배 호감도 UP!', face: 'smile', sfx: 'heart' },
        { t: 'say', who: 'yeoju', text: '(폰을 꼭 쥐며) 답장 왔어…\n진짜 왔어…!' },
        { t: 'say', who: 'narrator', text: '이것이 바로 대학생활 필수 스킬,\n밥약입니다!' },
        { t: 'say', who: 'narrator', text: '정답을 맞춘 여러분들에게 박수!' },
      ],
      next: 's3',
    },

    /* ───────────── Stage 3 · 밥약 메뉴 고르기 ───────────── */
    {
      id: 's3',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'splash', title: '밥약 메뉴 고르기' },
        // 대본 수정본에서 '[화면] 오늘의 메뉴판' 줄이 빠져서 메뉴판 소품도 뺐어요 (pr-menu-board는 그대로 남겨 둠)
        // 대본의 (꼬르륵 효과음)은 아직 소리가 없어요 → audio/sfx.ts에 추가하면 여기 sfx로 연결
        { t: 'say', who: 'narrator', text: '드디어 밥약 당일!\n남주 선배가 묻습니다.' },
        { t: 'say', who: 'namju', text: '뭐 먹고 싶어요? 편하게 골라요!', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(속마음) 비싼 거 고르면\n부담스러워할 텐데…' },
        { t: 'say', who: 'yeoju', text: '아무거나 하면\n성의 없어 보일까…?' },
        { t: 'sprite', face: null }, // 선택지 판이 얼굴을 가려서 내려 둬요
      ],
      choice: {
        q: '여주의 메뉴 선택은?',
        seconds: 20,
        options: [
          { label: '학식 (가성비 최고!)', go: 's3-haksik', affinity: 1, verdict: '센스 만점' },
          {
            label: '오마카세',
            bad: {
              title: '선배의 통장이\n텅 비었습니다',
              back: '메뉴 고르기 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'rx-namju-broke',
              beats: [
                { t: 'say', who: 'namju', text: '…그래요. (통장 잔고 확인 중)\n여주 씨, 라면은 좋아해요?', face: 'flustered' },
                { t: 'prop', art: 'pr-bankbook', hand: 'print', text: '잔액 0원', place: { x: '17%', y: '33%', w: '60%', rot: '-7deg', fs: 72 }, sfx: 'bad' },
              ],
            },
          },
          { label: '"선배가 골라주세요!"', go: 's3-pick', affinity: 1, verdict: '리드력 +1' },
        ],
      },
    },
    {
      id: 's3-haksik',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'say', who: 'namju', text: '알뜰하네ㅋㅋ\n근데 오늘은 내가 살게요,', face: 'laugh' },
        { t: 'say', who: 'namju', text: '학식 말고 파스타 어때요?' },
        { t: 'notify', text: '남주 선배 호감도 UP!', face: 'laugh', sfx: 'heart' },
      ],
      next: 's3-end',
    },
    {
      id: 's3-pick',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'say', who: 'namju', text: '메뉴 정하는 게 제일 어려운데…', face: 'smile' },
        { t: 'say', who: 'namju', text: '좋아요, 오늘은 돈가스 갑시다!', face: 'laugh' },
        { t: 'notify', text: '남주 선배 호감도 UP! (리드력 +1)', face: 'laugh', sfx: 'heart' },
      ],
      next: 's3-end',
    },
    {
      id: 's3-end',
      stage: { n: 'Stage 3', name: '밥약 메뉴 고르기' },
      bg: 'bg-restaurant',
      beats: [
        { t: 'say', who: 'narrator', text: '맛있는 식사를 마치고,\n여주는 선배와 한층 가까워졌습니다.' },
      ],
      next: 's4',
    },

    /* ───────────── Stage 4 · 조별과제 위기 (대본의 'Stage 5') ───────────── */
    {
      id: 's4',
      stage: { n: 'Stage 4', name: '조별과제 위기' },
      bg: 'bg-desk-2am',
      night: true,
      beats: [
        { t: 'splash', title: '조별과제 위기', sub: '새벽 2시 14분' },
        { t: 'say', who: 'narrator', text: '행복한 시간도 잠시,\n대학생의 숙명이 찾아옵니다.' },
        { t: 'say', who: 'narrator', text: '바로 조별과제!' },
        {
          t: 'phone', title: '조별과제 4조 단톡방', time: '오전 2:14', msgs: [
            { from: 'me', text: '얘들아 내일 마감인데 자료 어떻게 돼 가?' },
            { from: 'them', name: '팀원A', text: '…' },
            { from: 'note', text: '팀원B, 팀원C 님이 읽었습니다' },
          ],
        },
        { t: 'say', who: 'yeoju', text: '(머리를 쥐어뜯으며) 마감이 내일인데\n아무도 답장이 없어…' },
        { t: 'say', who: 'yeoju', text: '혼자 다 해야 하나?' },
      ],
      choice: {
        q: '여주는 어떻게 해야 할까?',
        seconds: 20,
        options: [
          {
            label: '밤새워 혼자 다 한다',
            bad: {
              title: '번아웃 엔딩',
              back: '조별과제 시작 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'face-serious',
              beats: [
                { t: 'notice', text: '여주는 발표 날\n눈을 반쯤 감고 서 있었다…', sub: '번아웃 엔딩', sfx: 'bad' },
              ],
            },
          },
          {
            label: '팀원들에게 단톡 폭탄을 보낸다',
            bad: {
              title: '팀원B 님이\n채팅방을 나갔습니다',
              back: '조별과제 시작 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'face-flustered',
              beats: [
                {
                  t: 'phone', title: '조별과제 4조 단톡방', time: '오전 2:20', msgs: [
                    { from: 'me', text: '얘들아!!!!!!' },
                    { from: 'me', text: '내일 마감이라고!!!!!!' },
                    { from: 'me', text: '제발 답장 좀ㅠㅠㅠㅠ' },
                  ],
                },
                { t: 'phone', title: '조별과제 4조 단톡방', time: '오전 2:20', continues: true, sfx: 'bad', msgs: [{ from: 'note', text: '팀원B 님이 채팅방을 나갔습니다.' }] },
                { t: 'say', who: 'yeoju', text: '(멍하니) …방금 한 명 더 줄었어.' },
              ],
            },
          },
          { label: '친구 새봄이에게 도움을 요청한다', go: 's4-ok', verdict: '든든한 친구' },
        ],
      },
    },
    {
      id: 's4-ok',
      stage: { n: 'Stage 4', name: '조별과제 위기' },
      bg: 'bg-desk-2am',
      night: true,
      beats: [
        {
          t: 'phone', title: '새봄', time: '오전 2:16', sfx: 'dm', msgs: [
            { from: 'me', text: '새봄아… 자니? 나 조별과제 때문에 진짜 큰일 났어ㅠㅠ' },
            { from: 'them', text: '안 자! 무슨 일인데? 혼자 끙끙 앓지 말고 말해 봐!' },
          ],
        },
        // 휴대폰 화면에 다 안 들어가서 새 화면으로 넘겨요 (같은 대화)
        {
          t: 'phone', title: '새봄', time: '오전 2:19', msgs: [
            { from: 'them', text: '자료 찾는 건 내가 도와줄게.' },
            { from: 'them', text: '그리고 내가 아는 선배들한테 예전에 발표 자료 만들어 본 사람 있나 물어볼게. 잠깐만 기다려!' },
          ],
        },
        { t: 'notice', text: '"선배님, 급한 부탁이 있어요… 🙏"', sub: '새봄이 누군가에게 메시지를 보냅니다', sfx: 'dm' },
        { t: 'say', who: 'narrator', text: '그날 밤, 새봄이는 여주와 함께\n끝까지 과제를 붙잡아 주었습니다.' },
        { t: 'say', who: 'narrator', text: '새벽에는 새봄이 연락한\n선배들의 답장도 도착했습니다.' },
        { t: 'say', who: 'narrator', text: '자료 구성 팁부터 발표 순서까지,\n아낌없는 조언이었죠.' },
        { t: 'say', who: 'narrator', text: '다음 날 아침,\n여주는 선배들의 조언대로' },
        { t: 'say', who: 'narrator', text: '팀원들에게 역할을 하나씩 나눠\n개인 메시지를 보냈고,' },
        { t: 'say', who: 'narrator', text: '그제야 하나둘\n답장이 오기 시작했습니다.' },
        { t: 'say', who: 'narrator', text: '발표는 무사히 끝났습니다.' },
        { t: 'say', who: 'yeoju', text: '(울컥하며) 새봄아… 진짜 고마워.' },
        { t: 'say', who: 'yeoju', text: '대학에서 이렇게 내 편이 되어 주는\n친구가 생길 줄 몰랐어.' },
        { t: 'say', who: 'saebom', text: '에이, 친구끼리 당연하지!', face: 'laugh' },
        { t: 'say', who: 'saebom', text: '근데… 사실 나 혼자 도와준 거 아니야.\n나중에 알려 줄게, 헤헤.', face: 'wink' },
      ],
      next: 's4-end',
    },
    {
      id: 's4-end',
      stage: { n: 'Stage 4', name: '조별과제 위기' },
      bg: 'bg-bench-sunset',
      beats: [
        { t: 'say', who: 'narrator', text: '조별과제까지 무사히 마친 여주.' },
        { t: 'say', who: 'narrator', text: '발표를 끝내고\n한숨 돌리던 그날 저녁,' },
        { t: 'say', who: 'narrator', text: '남주 선배에게서 메시지가 옵니다.' },
        { t: 'phone', title: '김남주', handle: 'namju_guitar', face: 'soft', sfx: 'dm', msgs: [{ from: 'them', text: '여주 씨, 오늘 발표 수고했어요! 잠깐 벤치에서 볼 수 있을까요?' }] },
      ],
      next: 's5',
    },

    /* ───────────── Stage 5 · 선배와의 깊은 대화 + 팀 나눔 (대본의 'Stage 6') ───────────── */
    {
      id: 's5',
      stage: { n: 'Stage 5', name: '선배와의 깊은 대화' },
      bg: 'cg-bench-talk',
      beats: [
        { t: 'splash', title: '선배와의 깊은 대화', sub: '노을 지는 캠퍼스 벤치' },
        { t: 'say', who: 'narrator', text: '벤치에 나란히 앉은\n여주와 남주 선배.' },
        { t: 'say', who: 'narrator', text: '평소와 달리\n선배의 표정이 진지합니다.' },
        { t: 'say', who: 'namju', text: '여주 씨, 대학 와서\n한 달쯤 지났잖아요.' },
        { t: 'say', who: 'namju', text: '요즘 어때요?\n솔직하게 얘기해 줘도 돼요.' },
        { t: 'say', who: 'yeoju', text: '(속마음, 관중에게) 솔직하게…?\n어디서부터 말해야 하지…' },
        { t: 'say', who: 'yeoju', text: '여러분이라면\n어떻게 대답할 것 같아요?' },
        { t: 'say', who: 'narrator', text: '여주가 고민하는 동안,\n우리 팀끼리 먼저 이야기해 봅시다!' },
        { t: 'say', who: 'narrator', text: '옆에 있는 사람과 2-3명씩' },
        { t: 'say', who: 'narrator', text: '원하는 나눔 질문으로\n자유롭게 나눔하겠습니다.' },
        { t: 'say', who: 'narrator', text: '여러분들에게 10분 드릴게요.' },

        /* 팀 나눔 (총 10분) — 질문 5개를 한 판에. 진행자: T = 타이머 처음부터, 스페이스 = 끝내고 넘어가기 */
        {
          t: 'share', label: '팀 나눔 · 총 10분', q: '옆에 있는 사람과 2-3명씩, 원하는 질문으로 자유롭게', seconds: SHARE_SECONDS,
          items: [
            { q: '대학에 가면 꼭 이루고 싶은 것은?', hint: '예시: 취업 / 연애 / 해외. 보기에 없는 답도 OK!' },
            { q: '새로운 환경에서 가장 걱정되는 것은?' }, // 대본 메모: 시간이 부족하면 생략
            { q: '힘들 때 나만의 극복 방법은?' },
            { q: '나한테 하나님은 어떤 분이신가?' },
            { q: 'CCC란 나에게 어떤 공동체인가?', hint: 'C맨들이 나눠주세요' },
          ],
        },
        { t: 'say', who: 'narrator', text: '이야기 잘 나눴나요?' },

        /* 여주의 고백 */
        { t: 'say', who: 'narrator', text: '여러분의 이야기를 들은 여주도\n용기를 내서 말하기 시작합니다.' },
        { t: 'say', who: 'yeoju', text: '(천천히) 사실 저 한 달 지났지만\n아직 대학교가 낯설어요…' },
        { t: 'say', who: 'yeoju', text: '그리고 앞으로\n하고 싶은 게 많아요.' },
        { t: 'say', who: 'yeoju', text: '취업 준비도 해야 하고,\n연애도 해 보고 싶고,' },
        { t: 'say', who: 'yeoju', text: '해외도 나가 보고 싶고요.' },
        { t: 'say', who: 'yeoju', text: '근데 제일 걱정되는 건,\n이 모든 걸 혼자 해야 한다는 거예요.' },
        { t: 'say', who: 'yeoju', text: '이번 조별과제 때도\n새봄이가 없었으면' },
        { t: 'say', who: 'yeoju', text: '정말 막막했을 거예요.' },
        { t: 'say', who: 'yeoju', text: '그리고 선배들까지 도와주셨는데,\n누구신지도 몰라서' },
        { t: 'say', who: 'yeoju', text: '제대로 감사 인사도 못 했어요.' },
        { t: 'say', who: 'namju', text: '(잠시 멈칫, 미소) …그 마음 알아요.\n나도 신입생 때 똑같았거든요.' },
        { t: 'say', who: 'namju', text: '그때 누가 옆에 있어 줬느냐가\n대학 생활을 정말 많이 바꿔 놓더라고요.' },
        // 대본에 없는 호감도 +1 (♥♥♥♥) — TRUE ENDING에서 5칸을 채우려고 넣었어요
        { t: 'notify', text: '남주 선배 호감도 UP!', face: 'soft', affinity: 1, sfx: 'heart' },
      ],
      next: 'epilogue',
    },

    /* ───────────── 에필로그 · 동아리의 정체 ───────────── */
    {
      id: 'epilogue',
      stage: { n: '에필로그', name: '동아리의 정체' },
      bg: 'bg-bench-sunset',
      beats: [
        { t: 'splash', title: '동아리의 정체' },
        { t: 'say', who: 'narrator', text: '바로 그 순간!\n저 멀리서 누군가 걸어옵니다.' },
        { t: 'sprite', face: null }, // 걸어오는 새봄이부터
        { t: 'say', who: 'saebom', text: '(손을 크게 흔들며) 선배~!\n여기 계셨어요?', face: 'wave' },
        { t: 'say', who: 'saebom', text: '아까 말씀하신 거 다 챙겨 왔어요!\n음료도 세 잔이요!', face: 'smile' },
        { t: 'say', who: 'namju', text: '(자연스럽게) 오, 새봄아! 고마워.\n역시 믿음직하다.', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(속마음) 뭐야…\n새봄이가 왜 선배를 알아?' },
        { t: 'say', who: 'yeoju', text: '심지어 선배 부탁을 받아서\n뭘 챙겨 왔다고?' },
        { t: 'say', who: 'yeoju', text: '둘이 언제부터 저렇게 친했지?' },
        { t: 'say', who: 'yeoju', text: '혹시… 둘이 사귀는 사이?!' },
        { t: 'notice', text: '여주의 불안도: MAX', sfx: 'bad' },
        { t: 'say', who: 'narrator', text: '여주의 머릿속이 복잡해집니다.\n마지막 선택입니다! 20초!' },
        { t: 'sprite', face: null }, // 선택지 판이 얼굴을 가려서 내려 둬요
      ],
      choice: {
        q: '여주는 어떻게 할까?',
        seconds: 20,
        options: [
          {
            label: '벤치 뒤에 몰래 숨어서 둘을 지켜본다',
            bad: {
              title: '"개미 관찰…?"',
              back: '말을 걸기 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'face-laugh',
              beats: [
                { t: 'say', who: 'saebom', text: '(벤치 뒤를 들여다보며) …여주야?\n너 거기서 뭐 해?', face: 'surprised' },
                { t: 'say', who: 'yeoju', text: '(얼어붙으며) 아, 아니… 그게…\n개미 관찰…?', sfx: 'bad' },
              ],
            },
          },
          {
            label: '용기를 내서 "둘이… 무슨 사이예요?"라고 묻는다',
            phone: '"둘이… 무슨 사이예요?"라고 묻는다',
            go: 'reveal',
            // 대본에 없는 호감도 +1 (♥♥♥♥♥)
            affinity: 1,
            verdict: '용기 있는 질문',
          },
          {
            label: '아무것도 못 본 척 조용히 집에 간다',
            bad: {
              title: '진실은 영원히\n미스터리로 남았다',
              back: '말을 걸기 전으로 회귀! 15초 안에 다시 고르세요.',
              react: 'face-serious',
              beats: [
                { t: 'notice', text: '여주는 그날 밤\n이불 속에서 생각했다.', sub: '그 둘은 대체 무슨 사이였을까…', sfx: 'bad' },
              ],
            },
          },
        ],
      },
    },
    {
      id: 'reveal',
      stage: { n: '에필로그', name: '동아리의 정체' },
      bg: 'bg-bench-sunset',
      beats: [
        { t: 'sprite', face: 'smile' },
        { t: 'sprite', who: 'saebom', face: 'smile' },
        { t: 'say', who: 'yeoju', text: '(떨리는 목소리로) 저기…\n둘이… 무슨 사이예요?' },
        { t: 'say', who: 'saebom', text: '(눈이 동그래지며) 응? 무슨 사이긴!', face: 'surprised' },
        { t: 'say', who: 'saebom', text: '(빵 터지며) 우리 같은 동아리야!', face: 'laugh' },
        { t: 'say', who: 'namju', text: '(웃으며) 아, 새봄이도\n우리 동아리 새내기예요.', face: 'laugh' },
        { t: 'say', who: 'namju', text: '원래 오늘 여주 씨 발표 끝나면\n둘 다 같이 있을 때 얘기하려고 했어요.', face: 'smile' },
        { t: 'say', who: 'saebom', text: '어젯밤에 내가 연락했던 선배들,\n조별과제 팁 알려 준 분들도', face: 'smile' },
        { t: 'say', who: 'saebom', text: '다 우리 동아리 사람들이야.' },
        { t: 'say', who: 'saebom', text: '사실 처음 만났을 때부터\n말하고 싶었는데,' },
        { t: 'say', who: 'saebom', text: '깜짝 놀라게 해 주고 싶어서\n참았어, 헤헤.', face: 'wink' },
        { t: 'say', who: 'namju', text: '새봄이가 "친구가 혼자\n힘들어하고 있어요"라고 연락했을 때,', face: 'soft' },
        { t: 'say', who: 'namju', text: '다들 바로 자기 일처럼 나섰어요.' },
        { t: 'say', who: 'yeoju', text: '(어리둥절) 같은 동아리…?\n그러니까 그 동아리가 대체 뭔데요?!' },
        // 대본의 (드럼롤)은 아직 소리가 없어요 → audio/sfx.ts에 추가하면 여기 sfx로 연결
        { t: 'notice', text: '두구두구두구…' },
        { t: 'say', who: 'narrator', text: '드디어 밝혀지는\n선배와 새봄이의 진실은?' },
        { t: 'say', who: 'namju', text: '우리는 CCC라는\n대학교 중앙 기독교 동아리예요.', face: 'smile', sfx: 'reveal' },
        { t: 'say', who: 'namju', text: '대학 캠퍼스에서 같이 예배하고,\n같이 공부하고,' },
        { t: 'say', who: 'namju', text: '서로의 삶을 응원하는 동아리예요.' },
        { t: 'say', who: 'saebom', text: '여주가 힘들 때\n내가 옆에 있었던 것처럼,', face: 'smile' },
        { t: 'say', who: 'saebom', text: '우리 동아리 사람들도 서로에게\n그런 친구가 되어 주거든.' },
        { t: 'say', who: 'saebom', text: '(새생시를 건네며) 그리고 이건\n오늘 발표 수고했다고,' },
        { t: 'say', who: 'saebom', text: '동아리 환영 선물이야!' },
        // 새봄이 건네는 「새생활의 시작」(새생시) 책자. 그림은 글자 없는 노란 책자, 제목은 화면에서 얹어요.
        { t: 'prop', art: 'pr-saesaengsi', hand: 'print', text: '새생활의 시작', place: { x: '27%', y: '28%', w: '46%', rot: '-3deg', fs: 62 }, size: 820, sfx: 'pop' },
        { t: 'say', who: 'namju', text: '모든 새내기가\n외롭지 않았으면 좋겠어요.', face: 'soft' },
        { t: 'say', who: 'namju', text: '여주 씨도요.' },
        { t: 'say', who: 'yeoju', text: '(감동하며) 그래서 다들 그렇게\n따뜻했던 거였구나…' },
        { t: 'say', who: 'yeoju', text: '저도 함께하고 싶어요!' },
      ],
      next: 'true-ending',
    },

    /* ───────────── TRUE ENDING ───────────── */
    {
      id: 'true-ending',
      stage: { n: '에필로그', name: '동아리의 정체' },
      bg: 'cg-true-ending',
      beats: [
        { t: 'splash', title: 'TRUE ENDING ♡', sfx: 'reveal' },
        { t: 'say', who: 'narrator', text: '축하합니다!\n여러분들이 진엔딩에 도달했습니다!' },
        { t: 'say', who: 'narrator', text: '큰 박수!' },
      ],
      next: 'closing',
    },

    /* ───────────── 마무리 ───────────── */
    {
      id: 'closing',
      bg: 'bg-epilogue-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '오늘 여주의 이야기는 가상이었지만,' },
        { t: 'say', who: 'narrator', text: '여러분이 곧 맞이할\n대학 생활은 진짜입니다.' },
        { t: 'say', who: 'narrator', text: '새로운 곳에서 설레는 만큼,\n외롭고 막막한 순간도' },
        { t: 'say', who: 'narrator', text: '분명히 찾아올 거예요.' },
        { t: 'say', who: 'narrator', text: '그때 여주처럼\n혼자 고민하지 말고' },
        { t: 'say', who: 'narrator', text: '손을 내밀 수 있는 공동체가 있다면\n큰 힘이 될 겁니다.' },
        { t: 'say', who: 'narrator', text: '여러분의 대학 생활에도\n새봄이와 남주 선배 같은 사람들이' },
        { t: 'say', who: 'narrator', text: '함께하길 바랍니다.' },
      ],
      next: 'end',
    },
    {
      // 마지막 화면. 여기서부터 휴대폰에는 '함께해 줘서 고마워요' + 안내 링크(config.ts → endLink)가 떠요.
      // (대본 3차 수정에서 '대학 생활, 혼자 시작하지 마세요 + 수원 CCC 로고' 화면이 빠졌어요.)
      id: 'end',
      bg: 'bg-epilogue-night',
      night: true,
      beats: [
        { t: 'say', who: 'narrator', text: '오늘 정말 수고하셨고 또 만나요!' },
      ],
      end: true,
    },
  ],
};
