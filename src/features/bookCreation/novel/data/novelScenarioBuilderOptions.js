export const agendaItems = [
  {
    key: "storySeed",
    number: "01",
    label: "이야기 씨앗",
    question: "어떤 이야기로 시작하고 싶나요?",
    description: "소설의 출발점이 되는 핵심 아이디어를 정합니다.",
    maxLength: 100,
    placeholder: "예: 낡은 도서관에서 이름 없는 편지를 발견한다.",
    recommendations: [
      {
        title: "황혼의 도서관에서 사라진 편지",
        text: "낡은 도서관에서 발견된 이름 없는 편지 때문에 현실의 기억이 바뀌기 시작한다.",
        tags: ["도서관", "기억", "미스터리"],
      },
      {
        title: "별빛 계약을 맺은 작가",
        text: "소설 속 인물이 현실의 작가에게 말을 걸고, 완성되지 않은 이야기가 사라지기 시작한다.",
        tags: ["작가", "성장", "판타지"],
      },
      {
        title: "마지막 장면을 훔친 마법사",
        text: "모든 소설의 결말만 사라지고, 주인공은 사라진 결말을 훔친 존재를 추적한다.",
        tags: ["추리", "마법", "반전"],
      },
    ],
  },
  {
    key: "genre",
    number: "02",
    label: "장르",
    question: "이 소설의 장르는 무엇으로 할까요?",
    description: "독자가 기대할 이야기의 방향을 정합니다.",
    maxLength: 40,
    placeholder: "예: 판타지 미스터리, 성장 판타지, 추리 판타지",
    recommendations: [
      {
        title: "판타지 미스터리",
        text: "현실과 환상이 섞이고, 숨겨진 진실을 추적하는 장르",
        tags: ["환상", "비밀", "추적"],
      },
      {
        title: "성장 판타지",
        text: "주인공이 실패와 선택을 겪으며 내면적으로 성장하는 장르",
        tags: ["성장", "선택", "희망"],
      },
      {
        title: "추리 판타지",
        text: "비현실적인 사건을 단서와 추리로 풀어가는 장르",
        tags: ["단서", "사건", "반전"],
      },
    ],
  },
  {
    key: "protagonist",
    number: "03",
    label: "주인공",
    question: "주인공은 어떤 인물인가요?",
    description: "이야기를 끌고 갈 중심 인물을 정합니다.",
    maxLength: 80,
    placeholder: "예: 기억을 잃은 견습 기록관",
    recommendations: [
      {
        title: "기억을 잃은 견습 기록관",
        text: "도서관의 기록을 관리하지만 정작 자신의 과거는 기억하지 못하는 인물",
        tags: ["기억상실", "기록관", "불안"],
      },
      {
        title: "글쓰기를 포기한 청소년 작가",
        text: "한때는 이야기를 좋아했지만 실패 이후 글쓰기를 멈춘 인물",
        tags: ["작가", "상처", "성장"],
      },
      {
        title: "결말을 읽지 못하는 편집자",
        text: "모든 원고를 검토하지만 이상하게도 결말만은 읽을 수 없는 인물",
        tags: ["편집자", "비밀", "추적"],
      },
    ],
  },
  {
    key: "background",
    number: "04",
    label: "배경",
    question: "이야기는 어디에서 벌어지나요?",
    description: "사건이 일어나는 공간과 분위기를 정합니다.",
    maxLength: 80,
    placeholder: "예: 황혼마다 문이 열리는 오래된 도서관",
    recommendations: [
      {
        title: "황혼의 오래된 도서관",
        text: "해가 지면 책장 사이에 존재하지 않던 문이 열리는 오래된 도서관",
        tags: ["도서관", "황혼", "비밀공간"],
      },
      {
        title: "비가 멈추지 않는 마을",
        text: "오래전 사라진 사건 이후 계속 비가 내리는 외딴 마을",
        tags: ["마을", "비", "저주"],
      },
      {
        title: "비밀 편집국",
        text: "작가들의 원고가 모이고, 사라진 결말을 추적하는 비밀스러운 편집국",
        tags: ["원고", "편집국", "추리"],
      },
    ],
  },
  {
    key: "conflict",
    number: "05",
    label: "갈등",
    question: "주인공이 마주할 핵심 문제는 무엇인가요?",
    description: "이야기의 긴장감을 만드는 중심 충돌을 정합니다.",
    maxLength: 100,
    placeholder: "예: 편지를 읽을수록 현실의 기억이 바뀐다.",
    recommendations: [
      {
        title: "기억이 바뀌는 편지",
        text: "편지를 읽을 때마다 주변 사람들의 기억과 현실의 기록이 달라진다.",
        tags: ["기억", "현실변화", "혼란"],
      },
      {
        title: "사라지는 결말",
        text: "소설의 결말이 사라질수록 현실에서도 사람들이 하나씩 사라진다.",
        tags: ["실종", "결말", "위기"],
      },
      {
        title: "진실을 숨기는 조력자",
        text: "주인공을 돕는 인물이 사실 가장 중요한 진실을 숨기고 있다.",
        tags: ["배신", "비밀", "의심"],
      },
    ],
  },
  {
    key: "ending",
    number: "06",
    label: "결말 방향",
    question: "결말은 어떤 방향이면 좋을까요?",
    description: "이야기가 마지막에 남길 감정과 메시지를 정합니다.",
    maxLength: 80,
    placeholder: "예: 진실을 선택하지만 모든 기억을 잃는다.",
    recommendations: [
      {
        title: "희망적인 결말",
        text: "주인공이 진실을 밝히고 잃어버린 관계를 회복한다.",
        tags: ["회복", "희망", "성장"],
      },
      {
        title: "여운 있는 결말",
        text: "문제는 해결되지만 주인공에게 지울 수 없는 선택의 흔적이 남는다.",
        tags: ["여운", "선택", "상실"],
      },
      {
        title: "반전 결말",
        text: "주인공이 찾던 진실이 사실 자신과 직접 연결되어 있음이 드러난다.",
        tags: ["반전", "진실", "충격"],
      },
    ],
  },
];

export const initialSettings = {
  storySeed: "",
  genre: "",
  protagonist: "",
  background: "",
  conflict: "",
  ending: "",
};


