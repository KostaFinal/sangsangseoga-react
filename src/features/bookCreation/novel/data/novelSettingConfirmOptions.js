export const defaultMinutes = {
  storySeed: "별을 삼킨 소년",
  genre: "다크 판타지",
  protagonist: "카엘, 17세 남자",
  background: "제국 달리아, 북부 변경지대",
  conflict: "제국의 음모와 주인공의 진실 추적",
  ending: "진실을 밝히는 열린 결말",
};

export const directingSteps = [
  {
    key: "mood",
    label: "분위기",
    icon: "🌙",
    question: "이 소설은 어떤 분위기로 진행하면 좋을까요?",
    guide: "전체 독자가 느낄 감정과 장면의 공기를 정하는 단계예요.",
    options: [
      "긴장감 있지만 무섭지 않게",
      "감성적이고 잔잔하게",
      "몽환적이고 신비롭게",
      "빠르게 몰입되는 웹소설 느낌",
    ],
  },
  {
    key: "style",
    label: "문체",
    icon: "🪶",
    question: "문체는 어떤 느낌이면 좋을까요?",
    guide: "문장 길이, 표현 방식, 서술의 밀도를 정해요.",
    options: [
      "차분하고 문학적인 문체",
      "쉽고 술술 읽히는 문체",
      "감각적인 묘사가 많은 문체",
      "대사가 많은 빠른 문체",
    ],
  },
  {
    key: "pointOfView",
    label: "시점",
    icon: "👁",
    question: "어떤 시점으로 이야기를 보여줄까요?",
    guide: "독자가 주인공과 얼마나 가까이 붙어서 읽을지 정하는 단계예요.",
    options: [
      "1인칭 주인공 시점",
      "3인칭 제한적 시점",
      "전지적 작가 시점",
      "장면마다 시점 전환",
    ],
  },
  {
    key: "volume",
    label: "분량",
    icon: "📄",
    question: "소설의 분량은 어느 정도가 좋을까요?",
    guide: "짧은 단편인지, 여러 장면이 있는 중편인지 정해요.",
    options: ["짧은 단편", "중편", "긴 단편", "웹소설 1화 분량"],
  },
  {
    key: "pace",
    label: "전개 속도",
    icon: "⏳",
    question: "전개 속도는 어떻게 가져가면 좋을까요?",
    guide: "사건을 빠르게 진행할지, 감정선을 천천히 쌓을지 정해요.",
    options: [
      "초반부터 빠르게 사건 발생",
      "감정선을 천천히 쌓기",
      "중반부터 긴장감 상승",
      "반전 중심으로 전개",
    ],
  },
  {
    key: "avoid",
    label: "금지 요소",
    icon: "🚫",
    question: "피하고 싶은 요소가 있을까요?",
    guide: "원하지 않는 표현, 전개, 분위기를 미리 제외해요.",
    options: [
      "잔혹한 장면 제외",
      "너무 어두운 결말 제외",
      "복잡한 설정 설명 줄이기",
      "로맨스 비중 줄이기",
    ],
  },
];

export const initialDirecting = {
  mood: "미정",
  style: "미정",
  pointOfView: "미정",
  volume: "미정",
  pace: "미정",
  avoid: "미정",
};


