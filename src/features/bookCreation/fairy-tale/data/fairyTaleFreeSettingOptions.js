export const REQUIRED_FIELDS = [
  "storySeed",
  "protagonistName",
  "protagonistDesc",
  "backgroundPlace",
  "problem",
  "pageCount",
];

export const STEPS = [
  {
    key: "storySeed",
    title: "이야기 씨앗",
    question: "어떤 동화를 만들고 싶나요?",
    guide: "동화의 시작이 되는 생각을 자유롭게 적어주세요.",
    placeholder: "예: 마법 양이 잃어버린 별을 찾는 이야기",
    examples: [
      "마법 양이 잃어버린 별을 찾는 이야기",
      "친구와 화해하는 따뜻한 이야기",
      "구름 왕국을 여행하는 모험 이야기",
      "작은 용이 용기를 배우는 이야기",
    ],
  },
  {
    key: "protagonistName",
    title: "주인공 이름",
    question: "주인공의 이름은 무엇인가요?",
    guide: "동화 속 주인공을 부를 이름을 적어주세요.",
    placeholder: "예: 루루",
    examples: ["루루", "모모", "초코", "별이"],
  },
  {
    key: "protagonistDesc",
    title: "주인공 설명",
    question: "주인공은 어떤 성격이나 특징을 가졌나요?",
    guide: "성격, 습관, 특징을 자유롭게 적어주면 좋아요.",
    placeholder: "예: 호기심 많고 겁은 조금 있지만 친구를 잘 도와주는 성격",
    examples: [
      "호기심 많고 겁은 조금 있지만 친구를 잘 도와주는 성격",
      "실수는 많지만 마음이 따뜻한 성격",
      "겁이 많지만 친구를 지키고 싶어하는 성격",
      "밤하늘을 좋아하는 조용한 성격",
    ],
  },
  {
    key: "backgroundPlace",
    title: "배경 장소",
    question: "이야기는 어디에서 펼쳐지나요?",
    guide: "숲, 성, 학교, 바닷속, 우주처럼 장소를 정해보세요.",
    placeholder: "예: 구름 위에 있는 작은 별빛 마을",
    examples: [
      "구름 위에 있는 별빛 마을",
      "반짝이는 마법 숲",
      "바닷속 조개 왕국",
      "달빛이 비치는 오래된 도서관",
    ],
  },
  {
    key: "problem",
    title: "문제 또는 목표",
    question: "주인공이 해결해야 할 문제나 목표는 무엇인가요?",
    guide: "동화의 중심 사건이 되는 부분이에요.",
    placeholder: "예: 사라진 별 조각을 찾아 밤하늘을 다시 밝히기",
    examples: [
      "사라진 별 조각을 찾아 밤하늘을 다시 밝히기",
      "친구와 오해를 풀고 다시 사이좋게 지내기",
      "마법 숲의 시든 꽃들을 다시 피우기",
      "잃어버린 용기를 되찾기",
    ],
  },
  {
    key: "pageCount",
    title: "페이지 수",
    question: "동화를 몇 페이지 정도로 만들까요?",
    guide: "처음 만들 때는 12페이지나 16페이지를 추천해요.",
    placeholder: "예: 12",
    examples: ["12", "16", "20"],
  },
  {
    key: "mood",
    title: "분위기",
    question: "동화의 분위기는 어떤 느낌이면 좋을까요?",
    guide: "선택사항이에요. 정하지 않아도 바로 시작할 수 있어요.",
    placeholder: "예: 따뜻하고 몽글몽글한 분위기",
    optional: true,
    examples: [
      "따뜻하고 몽글몽글한 분위기",
      "신비롭고 반짝이는 분위기",
      "유쾌하고 귀여운 분위기",
      "잔잔하고 감동적인 분위기",
      "모험적이고 활기찬 분위기",
    ],
  },
  {
    key: "importantObject",
    title: "중요한 물건",
    question: "이야기에 중요한 물건이 등장하면 좋을까요?",
    guide: "선택사항이에요. 마법 지팡이, 편지, 열쇠 같은 물건을 넣을 수 있어요.",
    placeholder: "예: 별빛이 담긴 작은 수정구슬",
    optional: true,
    examples: [
      "별빛이 담긴 작은 수정구슬",
      "소원을 들어주는 낡은 열쇠",
      "친구의 마음이 담긴 편지",
      "길을 알려주는 마법 지도",
      "반짝이는 별 모양 지팡이",
    ],
  },
  {
    key: "title",
    title: "제목",
    question: "제목을 미리 정해볼까요?",
    guide: "선택사항이에요. 정하지 않으면 나중에 AI가 제목을 추천할 수 있어요.",
    placeholder: "예: 루루와 사라진 별빛",
    optional: true,
    examples: [
      "루루와 사라진 별빛",
      "구름 마을의 작은 약속",
      "별을 찾아 떠난 마법 양",
      "반짝이는 숲의 비밀",
    ],
  },
];

export const EMPTY_SETTINGS = {
  storySeed: "",
  protagonistName: "",
  protagonistDesc: "",
  backgroundPlace: "",
  problem: "",
  pageCount: "",
  mood: "",
  importantObject: "",
  title: "",
};

export const SUMMARY_ITEMS = [
  {
    key: "storySeed",
    label: "이야기 씨앗",
    required: true,
  },
  {
    key: "protagonistName",
    label: "주인공 이름",
    required: true,
  },
  {
    key: "protagonistDesc",
    label: "주인공 설명",
    required: true,
  },
  {
    key: "backgroundPlace",
    label: "배경 장소",
    required: true,
  },
  {
    key: "problem",
    label: "문제 또는 목표",
    required: true,
  },
  {
    key: "pageCount",
    label: "페이지 수",
    required: true,
  },
  {
    key: "mood",
    label: "분위기",
    required: false,
  },
  {
    key: "importantObject",
    label: "중요한 물건",
    required: false,
  },
  {
    key: "title",
    label: "제목",
    required: false,
  },
];


