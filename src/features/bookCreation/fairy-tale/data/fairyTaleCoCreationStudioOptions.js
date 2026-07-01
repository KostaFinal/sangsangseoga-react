export const outlineData = [
  {
    phase: "기",
    icon: "☁️",
    items: [
      { page: 1, text: "구름 성 소개", done: true },
      { page: 2, text: "마법사 양 루미 등장", done: true },
      { page: 3, text: "별빛이 사라짐", done: true },
    ],
  },
  {
    phase: "승",
    icon: "⭐",
    items: [
      { page: 4, text: "첫 친구를 만남", current: true },
      { page: 5, text: "단서 찾기" },
      { page: 6, text: "작은 실패" },
    ],
  },
  {
    phase: "전",
    icon: "⛰️",
    items: [
      { page: 7, text: "가장 큰 위기" },
      { page: 8, text: "용기를 내는 선택" },
    ],
  },
  {
    phase: "결",
    icon: "💗",
    items: [
      { page: 9, text: "별빛 되찾기" },
      { page: 10, text: "따뜻한 마무리" },
    ],
  },
];

export const friendOptions = [
  {
    id: "RABBIT",
    title: "길을 알려주는 토끼",
    desc: "숲길에 밝고 친절해서 루미에게 방향을 알려줘요.",
    img: "🐰",
    color: "green",
  },
  {
    id: "SQUIRREL",
    title: "별빛을 모으는 다람쥐",
    desc: "별빛을 모으는 걸 좋아해서 루미에게 특별한 도움을 줘요.",
    img: "🐿️",
    color: "yellow",
  },
  {
    id: "DRAGON",
    title: "겁 많은 작은 용",
    desc: "겁이 많지만 마음이 착해서 루미와 함께 용기를 내요.",
    img: "🐉",
    color: "purple",
  },
];

export const fallbackStudioSetup = {
  bookType: "FAIRY_TALE",
  writerLevel: "CHILD",
  interactionMode: "MIXED",
  seed: "마법 물건 이야기",
};
