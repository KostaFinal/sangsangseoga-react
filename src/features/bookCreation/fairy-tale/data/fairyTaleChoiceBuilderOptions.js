export const stepList = [
  {
    key: "storySeed",
    label: "이야기 씨앗",
    question: "어떤 이야기로 시작할까요?",
    guide: "동화의 중심이 되는 첫 아이디어를 골라주세요.",
  },
  {
    key: "protagonist",
    label: "주인공",
    question: "주인공은 어떤 친구일까요?",
    guide: "동화 속에서 모험을 이끌어 갈 주인공을 골라주세요.",
  },
  {
    key: "backgroundPlace",
    label: "배경",
    question: "이야기는 어디에서 시작될까요?",
    guide: "주인공이 처음 모험을 시작하는 장소예요.",
  },
  {
    key: "problem",
    label: "문제/목표",
    question: "주인공에게 어떤 일이 생길까요?",
    guide: "동화에서 해결해야 할 문제나 목표를 골라주세요.",
  },
  {
    key: "mood",
    label: "분위기",
    question: "어떤 느낌의 동화로 만들까요?",
    guide: "전체 동화의 감정과 색감을 정하는 단계예요.",
  },
  {
    key: "pageCount",
    label: "페이지 수",
    question: "몇 페이지 동화로 만들까요?",
    guide: "표지를 제외한 본문 페이지 수를 골라주세요.",
  },
];

export const optionSets = {
  storySeed: [
    [
      {
        id: "LOST_STARLIGHT",
        icon: "✨",
        title: "사라진 별빛 찾기",
        desc: "하늘에서 사라진 별빛을 주인공이 찾아 떠나요.",
        value: "사라진 별빛을 찾는 이야기",
      },
      {
        id: "MAGIC_FOREST_FRIEND",
        icon: "🌳",
        title: "마법 숲의 친구",
        desc: "신비로운 숲에서 새로운 친구를 만나는 이야기예요.",
        value: "마법 숲에서 친구를 만나는 이야기",
      },
      {
        id: "CLOUD_CASTLE_SECRET",
        icon: "🏰",
        title: "구름 성의 비밀",
        desc: "구름 위 성에 숨겨진 비밀을 찾아가는 이야기예요.",
        value: "구름 성의 비밀을 찾는 이야기",
      },
      {
        id: "SMALL_COURAGE",
        icon: "🌱",
        title: "작은 용기 배우기",
        desc: "작은 실수를 통해 용기와 책임감을 배우는 이야기예요.",
        value: "작은 용기를 배우는 이야기",
      },
    ],
    [
      {
        id: "RAINBOW_BRIDGE",
        icon: "🌈",
        title: "무지개 다리 모험",
        desc: "사라진 무지개 다리를 다시 이어가는 이야기예요.",
        value: "무지개 다리를 되찾는 이야기",
      },
      {
        id: "SLEEPING_MOON",
        icon: "🌙",
        title: "잠든 달 깨우기",
        desc: "깊이 잠든 달을 깨우기 위해 떠나는 이야기예요.",
        value: "잠든 달을 깨우는 이야기",
      },
      {
        id: "TINY_DRAGON",
        icon: "🐉",
        title: "작은 용의 부탁",
        desc: "길 잃은 작은 용을 도와주는 따뜻한 이야기예요.",
        value: "작은 용을 도와주는 이야기",
      },
      {
        id: "MAGIC_BOOK",
        icon: "📖",
        title: "말하는 마법책",
        desc: "책 속에서 들려오는 목소리를 따라 모험이 시작돼요.",
        value: "말하는 마법책과 함께하는 이야기",
      },
    ],
  ],

  protagonist: [
    [
      {
        id: "SHEEP_LUMI",
        icon: "🐑",
        title: "마법사 양 루미",
        desc: "겁은 조금 많지만 마음이 따뜻한 작은 마법사예요.",
        value: {
          protagonistName: "루미",
          protagonistDesc: "겁은 조금 많지만 마음이 따뜻한 마법사 양",
        },
      },
      {
        id: "RABBIT_NABI",
        icon: "🐰",
        title: "호기심 많은 토끼 나비",
        desc: "궁금한 것은 꼭 알아내야 하는 밝은 친구예요.",
        value: {
          protagonistName: "나비",
          protagonistDesc: "호기심이 많고 밝은 성격의 토끼",
        },
      },
      {
        id: "TURTLE_TOTO",
        icon: "🐢",
        title: "성실한 거북이 토토",
        desc: "느리지만 끝까지 포기하지 않는 친구예요.",
        value: {
          protagonistName: "토토",
          protagonistDesc: "느리지만 성실하고 끈기 있는 거북이",
        },
      },
      {
        id: "DRAGON_PIPI",
        icon: "🐲",
        title: "장난꾸러기 작은 용 피피",
        desc: "장난을 좋아하지만 친구를 아끼는 작은 용이에요.",
        value: {
          protagonistName: "피피",
          protagonistDesc: "장난을 좋아하지만 친구를 아끼는 작은 용",
        },
      },
    ],
    [
      {
        id: "FOX_RORO",
        icon: "🦊",
        title: "똑똑한 여우 로로",
        desc: "문제를 차분히 생각하고 해결하는 친구예요.",
        value: {
          protagonistName: "로로",
          protagonistDesc: "똑똑하고 차분하게 문제를 해결하는 여우",
        },
      },
      {
        id: "BEAR_BOM",
        icon: "🐻",
        title: "다정한 곰 봄이",
        desc: "친구들을 따뜻하게 챙기는 든든한 친구예요.",
        value: {
          protagonistName: "봄이",
          protagonistDesc: "다정하고 친구들을 잘 챙기는 곰",
        },
      },
      {
        id: "CAT_MIRO",
        icon: "🐱",
        title: "용감한 고양이 미로",
        desc: "무서워도 한 걸음씩 나아가는 친구예요.",
        value: {
          protagonistName: "미로",
          protagonistDesc: "용감하고 새로운 길을 두려워하지 않는 고양이",
        },
      },
      {
        id: "BIRD_RIRI",
        icon: "🐦",
        title: "노래하는 새 리리",
        desc: "노래로 친구들에게 용기를 주는 친구예요.",
        value: {
          protagonistName: "리리",
          protagonistDesc: "노래로 친구들에게 용기를 주는 작은 새",
        },
      },
    ],
  ],

  backgroundPlace: [
    [
      {
        id: "STAR_FOREST",
        icon: "🌲",
        title: "별빛 숲",
        desc: "밤마다 작은 별들이 나무 사이에서 반짝이는 숲이에요.",
        value: "별빛 숲",
      },
      {
        id: "CLOUD_CASTLE",
        icon: "🏰",
        title: "구름 위의 성",
        desc: "하늘 높이 떠 있는 하얀 구름 성에서 이야기가 시작돼요.",
        value: "구름 위의 성",
      },
      {
        id: "MAGIC_LIBRARY",
        icon: "📚",
        title: "작은 마법 도서관",
        desc: "책장 사이마다 비밀 통로가 숨어 있는 도서관이에요.",
        value: "작은 마법 도서관",
      },
      {
        id: "RAINBOW_TOWN",
        icon: "🌈",
        title: "무지개 다리 마을",
        desc: "무지개 다리 아래에 있는 알록달록한 마을이에요.",
        value: "무지개 다리 마을",
      },
    ],
    [
      {
        id: "MOON_LAKE",
        icon: "🌙",
        title: "달빛 호수",
        desc: "달빛이 물결처럼 반짝이는 조용한 호수예요.",
        value: "달빛 호수",
      },
      {
        id: "CANDY_HILL",
        icon: "🍬",
        title: "사탕 언덕",
        desc: "달콤한 향기가 나는 알록달록한 언덕이에요.",
        value: "사탕 언덕",
      },
      {
        id: "WIND_VALLEY",
        icon: "🍃",
        title: "바람 골짜기",
        desc: "바람이 노래처럼 지나가는 신비로운 골짜기예요.",
        value: "바람 골짜기",
      },
      {
        id: "SUNFLOWER_FIELD",
        icon: "🌻",
        title: "해바라기 들판",
        desc: "해바라기가 햇빛을 따라 웃는 넓은 들판이에요.",
        value: "해바라기 들판",
      },
    ],
  ],

  problem: [
    [
      {
        id: "STARLIGHT_GONE",
        icon: "🌟",
        title: "별빛이 사라졌어요",
        desc: "하늘의 별빛이 하나씩 사라져 모두가 걱정해요.",
        value: "별빛이 갑자기 사라진다",
      },
      {
        id: "FRIEND_LOST",
        icon: "🧭",
        title: "친구가 길을 잃었어요",
        desc: "주인공은 길 잃은 친구를 찾아야 해요.",
        value: "친구가 길을 잃는다",
      },
      {
        id: "LOST_OBJECT",
        icon: "🔑",
        title: "중요한 물건을 잃어버렸어요",
        desc: "마법에 꼭 필요한 물건이 사라져요.",
        value: "중요한 물건을 잃어버린다",
      },
      {
        id: "NO_LAUGHTER",
        icon: "😢",
        title: "마을에 웃음이 사라졌어요",
        desc: "마을 친구들이 더 이상 웃지 않게 되었어요.",
        value: "마을에 웃음이 사라진다",
      },
    ],
    [
      {
        id: "BROKEN_BRIDGE",
        icon: "🌉",
        title: "다리가 끊어졌어요",
        desc: "친구들을 만나러 가는 길이 사라졌어요.",
        value: "친구들을 만나러 가는 다리가 끊어진다",
      },
      {
        id: "MAGIC_WEAK",
        icon: "🪄",
        title: "마법이 약해졌어요",
        desc: "주인공의 마법이 갑자기 잘 되지 않아요.",
        value: "주인공의 마법이 약해진다",
      },
      {
        id: "RAIN_DOES_NOT_STOP",
        icon: "☔",
        title: "비가 멈추지 않아요",
        desc: "계속 내리는 비 때문에 마을이 힘들어져요.",
        value: "비가 멈추지 않아 마을이 어려워진다",
      },
      {
        id: "DREAM_DOOR_CLOSED",
        icon: "🚪",
        title: "꿈의 문이 닫혔어요",
        desc: "꿈나라로 가는 문이 닫혀 버렸어요.",
        value: "꿈나라로 가는 문이 닫힌다",
      },
    ],
  ],

  mood: [
    [
      {
        id: "WARM",
        icon: "☀️",
        title: "따뜻하고 포근하게",
        desc: "읽고 나면 마음이 편안해지는 동화예요.",
        value: "따뜻하고 포근한 분위기",
      },
      {
        id: "MYSTIC",
        icon: "🌙",
        title: "신비롭고 몽환적으로",
        desc: "마법 같은 느낌이 가득한 동화예요.",
        value: "신비롭고 몽환적인 분위기",
      },
      {
        id: "CUTE",
        icon: "🍭",
        title: "밝고 귀엽게",
        desc: "귀여운 장면과 재미있는 표현이 많은 동화예요.",
        value: "밝고 귀여운 분위기",
      },
      {
        id: "TOUCHING",
        icon: "💛",
        title: "잔잔하고 감동적으로",
        desc: "작은 깨달음과 따뜻한 여운이 남는 동화예요.",
        value: "잔잔하고 감동적인 분위기",
      },
    ],
    [
      {
        id: "ADVENTURE",
        icon: "🧭",
        title: "모험스럽게",
        desc: "새로운 장소를 찾아가는 느낌이 강한 동화예요.",
        value: "모험스럽고 생동감 있는 분위기",
      },
      {
        id: "CALM",
        icon: "🍃",
        title: "차분하고 조용하게",
        desc: "느리지만 깊이 있는 장면으로 이어지는 동화예요.",
        value: "차분하고 조용한 분위기",
      },
      {
        id: "FUNNY",
        icon: "🎈",
        title: "유쾌하고 재미있게",
        desc: "웃음이 나는 사건이 들어가는 동화예요.",
        value: "유쾌하고 재미있는 분위기",
      },
      {
        id: "BRAVE",
        icon: "🔥",
        title: "용기 있게",
        desc: "주인공이 두려움을 이겨내는 느낌이 강한 동화예요.",
        value: "용기 있고 희망적인 분위기",
      },
    ],
  ],

  pageCount: [
    [
      {
        id: "PAGE_12",
        icon: "12",
        title: "12페이지",
        desc: "기승전결이 적당히 들어가는 기본 구성",
        value: 12,
      },
      {
        id: "PAGE_16",
        icon: "16",
        title: "16페이지",
        desc: "사건과 감정을 조금 더 자세히 담는 구성",
        value: 16,
      },
      {
        id: "PAGE_20",
        icon: "20",
        title: "20페이지",
        desc: "긴 모험과 장면 전환을 충분히 담는 구성",
        value: 20,
      },
    ],
  ],
};

export const summaryLabels = [
  ["storySeed", "이야기 씨앗"],
  ["protagonist", "주인공"],
  ["backgroundPlace", "배경"],
  ["problem", "문제/목표"],
  ["mood", "분위기"],
  ["pageCount", "페이지 수"],
];

export const modeLabel = {
  FREE: "자유형",
  MIXED: "선택 + 입력형",
  CHOICE: "선택형",
};

export const writerLevelLabel = {
  PRESCHOOL: "미취학아동",
  LOWER_ELEMENTARY: "초등 저학년",
  UPPER_ELEMENTARY: "초등 고학년",
  TEEN: "청소년",
  ADULT: "성인",
};

