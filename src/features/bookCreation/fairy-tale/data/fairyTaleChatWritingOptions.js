export const DEFAULT_SETTING = {
  storySeed: "마법 양이 잃어버린 별을 찾는 이야기",
  protagonist: "루루, 호기심 많은 마법 양",
  backgroundPlace: "별빛 숲",
  problem: "사라진 별 조각을 찾아 밤하늘을 다시 밝히기",
  pageCount: 16,
  mood: "따뜻하고 신비로운 분위기",
  importantObject: "별빛 수정구슬",
  title: "루루와 사라진 별빛",
};

export const makeInitialPages = (pageCount) => {
  return Array.from({ length: pageCount }, (_, index) => {
    const pageNo = index + 1;

    return {
      pageNo,
      status: pageNo === 1 ? "WRITING" : "WAITING",
      sceneTitle:
        pageNo === 1
          ? "이야기가 시작되는 순간"
          : pageNo === 2
          ? "사라진 별 조각"
          : pageNo === 3
          ? "별빛 숲으로 들어간 루루"
          : `${pageNo}페이지 장면`,
      role:
        pageNo === 1
          ? "주인공과 배경을 보여주는 시작 장면"
          : pageNo === 2
          ? "문제가 처음 드러나는 장면"
          : pageNo === 3
          ? "주인공이 문제를 해결하기 위해 움직이는 장면"
          : "이야기가 이어지는 장면",
      body: "",
      teacherNote:
        pageNo === 1
          ? "첫 페이지는 주인공과 동화의 분위기를 부드럽게 보여주면 좋아요."
          : "이번 페이지에서는 앞 장면과 자연스럽게 이어지는 사건을 쓰면 좋아요.",
    };
  });
};

export const makePageText = ({ page, setting, tone = "기본" }) => {
  const protagonistName = setting.protagonist?.split(",")[0] || "루루";
  const place = setting.backgroundPlace || "별빛 숲";
  const object = setting.importantObject || "작은 빛";
  const mood = setting.mood || "따뜻한 분위기";

  const toneSentence =
    tone === "쉽게"
      ? "문장은 짧고 쉽게 이어졌어요."
      : tone === "따뜻하게"
      ? "장면은 포근하고 다정한 느낌으로 이어졌어요."
      : tone === "신비롭게"
      ? "장면은 반짝이고 신비로운 느낌으로 이어졌어요."
      : tone === "짧게"
      ? "장면은 짧고 또렷하게 정리되었어요."
      : "장면은 자연스럽게 이어졌어요.";

  if (page.pageNo === 1) {
    return `${protagonistName}는 ${place}에서 조용히 아침을 맞았어요.
나뭇잎 사이로 작은 별빛들이 반짝였고, 바람은 살며시 노래하듯 지나갔어요.
${protagonistName}는 품 안에 있던 ${object}을(를) 꼭 안고 하늘을 바라보았어요.

그런데 그때, 평소보다 별빛이 조금 희미해진 것을 발견했어요.
${protagonistName}는 고개를 갸웃하며 작은 목소리로 말했어요.

“어라? 별들이 왜 이렇게 힘이 없어 보이지?”

${mood} 속에서 ${protagonistName}의 모험이 조용히 시작되었어요.
${toneSentence}`;
  }

  return `${protagonistName}는 조심조심 ${place} 안쪽으로 걸어갔어요.
발밑에서는 작은 빛들이 톡톡 피어났고, 멀리서는 반짝이는 소리가 들려왔어요.
${protagonistName}는 조금 두근거렸지만, 멈추지 않았어요.

“괜찮아. 천천히 가면 할 수 있어.”

그때 ${object}이(가) 살짝 빛나기 시작했어요.
마치 ${protagonistName}에게 이쪽으로 오라고 알려주는 것 같았어요.

${protagonistName}는 숨을 고르고 한 걸음 더 앞으로 나아갔어요.
${toneSentence}`;
};

export const QUICK_ACTIONS = [
  {
    id: "easy",
    label: "문장 더 쉽게",
    tone: "쉽게",
    teacherText: "좋아요. 아이가 더 쉽게 읽을 수 있도록 문장을 짧고 분명하게 바꿔볼게요.",
  },
  {
    id: "warm",
    label: "더 따뜻하게",
    tone: "따뜻하게",
    teacherText: "좋아요. 인물의 마음이 더 잘 느껴지도록 따뜻한 표현을 넣어볼게요.",
  },
  {
    id: "mystic",
    label: "더 신비롭게",
    tone: "신비롭게",
    teacherText: "좋아요. 별빛과 마법 느낌이 더 살아나도록 신비롭게 써볼게요.",
  },
  {
    id: "short",
    label: "짧게 다듬기",
    tone: "짧게",
    teacherText: "좋아요. 핵심 장면은 유지하면서 더 짧고 읽기 쉽게 정리해볼게요.",
  },
];

export const CHAT_HELP_ACTIONS = [
  {
    id: "direction",
    label: "이번 페이지 방향 추천",
  },
  {
    id: "continue",
    label: "문장 이어쓰기",
  },
  {
    id: "explain",
    label: "더 쉽게 설명",
  },
  {
    id: "emotion",
    label: "감정 더 넣기",
  },
  {
    id: "nextScene",
    label: "다음 장면 추천",
  },
];


