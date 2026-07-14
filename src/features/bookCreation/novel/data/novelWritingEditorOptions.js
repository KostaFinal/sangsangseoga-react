// 미취학/초등 저학년/초등 고학년: AI가 장면 전체를 적극적으로 써주는 기존 방식 유지.
export const GUIDED_WRITER_LEVELS = [
  "PRESCHOOL",
  "LOWER_ELEMENTARY",
  "UPPER_ELEMENTARY",
];

// 청소년/성인: 사용자가 직접 쓰고, AI는 문장/문단/선택 영역 단위로만 보조.
export const INDEPENDENT_WRITER_LEVELS = ["TEEN", "ADULT"];

// 본문이 비어 있을 때와 이미 있을 때 같은 버튼 자리에 다른 라벨/actionType을 쓴다.
export const independentPrimaryAction = {
  empty: {
    actionType: "SUGGEST_OPENING_SENTENCE",
    label: "시작 문장 제안",
    insertionMode: "insertEmpty",
  },
  filled: {
    actionType: "SUGGEST_NEXT_PARAGRAPH",
    label: "다음 문단 제안",
    insertionMode: "append",
  },
};

// 창작 보조 모드 기본 노출 버튼 (더보기 아님).
export const independentBasicActions = [
  {
    actionType: "SUGGEST_NEXT_SENTENCE",
    label: "다음 문장 제안",
    requiresSelection: false,
    insertionMode: "append",
  },
  {
    actionType: "REFINE_SELECTED_TEXT",
    label: "선택 문장 다듬기",
    requiresSelection: true,
    insertionMode: "replaceSelection",
  },
];

// 창작 보조 모드 "더보기" 영역 버튼.
export const independentMoreActions = [
  {
    actionType: "STYLE_SELECTED_TEXT",
    label: "선택 문장 문체 수정",
    requiresSelection: true,
    insertionMode: "replaceSelection",
  },
  {
    actionType: "INCREASE_PARAGRAPH_TENSION",
    label: "현재 문단 긴장감 높이기",
    requiresSelection: false,
    insertionMode: "replaceParagraphOrSelection",
  },
  {
    actionType: "ENHANCE_PARAGRAPH_DESCRIPTION",
    label: "현재 문단 묘사 보강",
    requiresSelection: false,
    insertionMode: "replaceParagraphOrSelection",
  },
  {
    actionType: "ADD_DIALOGUE_TO_PARAGRAPH",
    label: "현재 문단 대사 추가",
    requiresSelection: false,
    insertionMode: "replaceParagraphOrSelection",
  },
  {
    actionType: "REWRITE_SELECTED_TEXT",
    label: "선택 영역 다시쓰기",
    requiresSelection: true,
    insertionMode: "replaceSelection",
  },
  {
    actionType: "CHECK_SCENE_COHERENCE",
    label: "현재 장면 개연성 검사",
    requiresSelection: false,
    insertionMode: "reportOnly",
  },
];

export const fallbackSetting = {
  storySeed: "별을 삼킨 소년",
  genre: "다크 판타지",
  protagonist: "카엘, 17세 남자",
  background: "제국 달리아, 북부 변경지대",
  conflict: "제국의 음모와 주인공의 진실 추적",
  ending: "진실을 밝히는 열린 결말",
  directing: {
    mood: "몽환적이고 신비롭게",
    style: "차분하고 문학적인 문체",
    pointOfView: "1인칭 주인공 시점",
    volume: "중편",
    pace: "감정선을 천천히 쌓기",
    avoid: "잔혹한 장면 제외",
  },
};

export const createInitialScenes = (setting) => {
  const protagonistName = setting.protagonist?.split(",")[0] || "주인공";

  return [
    {
      id: 1,
      phase: "도입",
      title: "별이 사라진 밤",
      goal: `${protagonistName}이 북부 변경지대에서 별이 사라지는 이상 현상을 처음 목격한다.`,
      status: "초안",
      content: `${protagonistName}은 북부 변경지대의 낡은 감시탑 위에 서 있었다.

밤하늘은 언제나처럼 검푸른 장막처럼 펼쳐져 있었지만, 그날의 별들은 이상할 만큼 조용했다.

나는 손끝에 닿는 차가운 바람을 느끼며 고개를 들었다. 그리고 그 순간, 가장 밝게 빛나던 북쪽 별 하나가 누군가에게 삼켜지듯 천천히 사라졌다.

처음에는 구름 때문이라고 생각했다. 하지만 하늘에는 구름 한 점 없었다.

감시탑 아래에서 종이 울렸다. 제국의 밤을 알리는 종소리였다.

그 소리를 들으며 나는 알 수 없는 불길함을 느꼈다. 오늘 밤 이후로, 내가 알던 세계는 더 이상 같은 모습이 아닐지도 몰랐다.`,
    },
    {
      id: 2,
      phase: "사건 발생",
      title: "북부 변경지대의 소문",
      goal: "별이 사라진 현상이 마을의 오래된 소문과 연결되어 있음을 보여준다.",
      status: "초안",
      content: "북부 변경지대의 사람들은 별이 사라지는 밤마다 오래된 이름을 낮게 속삭였다.",
    },
    {
      id: 3,
      phase: "첫 단서",
      title: "황궁에서 온 밀서",
      goal: "제국 중심부에서 온 밀서가 사건의 실마리가 된다.",
      status: "미작성",
      content: "",
    },
    {
      id: 4,
      phase: "갈등 심화",
      title: "카엘의 기억 조각",
      goal: "주인공의 잊힌 기억이 제국의 비밀과 연결되어 있음을 암시한다.",
      status: "미작성",
      content: "",
    },
    {
      id: 5,
      phase: "반전",
      title: "첫 번째 진실",
      goal: "별이 사라지는 현상의 진짜 이유 일부가 드러난다.",
      status: "미작성",
      content: "",
    },
    {
      id: 6,
      phase: "위기",
      title: "제국의 그림자",
      goal: "주인공이 제국의 감시와 음모에 직접 휘말린다.",
      status: "미작성",
      content: "",
    },
    {
      id: 7,
      phase: "클라이맥스",
      title: "선택의 밤",
      goal: "주인공이 진실을 밝힐지, 누군가를 지킬지 선택해야 한다.",
      status: "미작성",
      content: "",
    },
    {
      id: 8,
      phase: "결말",
      title: "별을 되찾는 길",
      goal: "진실을 밝히되 모든 것이 완전히 닫히지 않는 열린 결말로 마무리한다.",
      status: "미작성",
      content: "",
    },
  ];
};


