export const steps = [
  { key: "seed", label: "이야기 씨앗" },
  { key: "pageCount", label: "페이지 수" },
  { key: "character", label: "주인공" },
  { key: "setting", label: "배경" },
  { key: "event", label: "사건" },
  { key: "mood", label: "분위기" },
  { key: "lesson", label: "교훈" },
];

export const seedOptions = [
  {
    id: "MAGIC_OBJECT",
    icon: "1",
    title: "마법 물건 이야기",
  },
  {
    id: "FRIENDSHIP",
    icon: "2",
    title: "친구와 함께하는 이야기",
  },
  {
    id: "COURAGE",
    icon: "3",
    title: "작은 용기를 내는 이야기",
  },
  {
    id: "FOREST",
    icon: "4",
    title: "신비한 숲 모험",
  },
  {
    id: "CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];

export const pageCountOptions = [
  {
    id: "PAGE_12",
    value: 12,
    icon: "1",
    title: "12쪽",
    description: "기승전결이 간단히 들어가는 기본 동화",
  },
  {
    id: "PAGE_16",
    value: 16,
    icon: "2",
    title: "16쪽",
    description: "사건과 감정 변화를 조금 더 자세히 담는 동화",
  },
  {
    id: "PAGE_20",
    value: 20,
    icon: "3",
    title: "20쪽",
    description: "가장 풍성하게 만드는 긴 동화",
  },
];

export const initialSettings = {
  seed: "마법 물건 이야기",
  pageCount: null,
  character: "",
  setting: "",
  event: "",
  mood: "",
  lesson: "",
};

export const characterOptions = [
  {
    id: "CHARACTER_1",
    icon: "1",
    title: "호기심 많은 어린 마법사",
  },
  {
    id: "CHARACTER_2",
    icon: "2",
    title: "용감한 숲속 친구",
  },
  {
    id: "CHARACTER_3",
    icon: "3",
    title: "길을 잃은 작은 용",
  },
  {
    id: "CHARACTER_4",
    icon: "4",
    title: "마법을 배우는 아이",
  },
  {
    id: "CHARACTER_CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];

export const settingOptions = [
  {
    id: "SETTING_1",
    icon: "1",
    title: "신비한 마법 숲",
  },
  {
    id: "SETTING_2",
    icon: "2",
    title: "구름 위의 성",
  },
  {
    id: "SETTING_3",
    icon: "3",
    title: "별빛 도서관",
  },
  {
    id: "SETTING_4",
    icon: "4",
    title: "무지개 마을",
  },
  {
    id: "SETTING_CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];

export const eventOptions = [
  {
    id: "EVENT_1",
    icon: "1",
    title: "사라진 마법 물건 찾기",
  },
  {
    id: "EVENT_2",
    icon: "2",
    title: "친구를 구하러 떠나기",
  },
  {
    id: "EVENT_3",
    icon: "3",
    title: "비밀 문을 발견하기",
  },
  {
    id: "EVENT_4",
    icon: "4",
    title: "마법 축제에서 생긴 문제",
  },
  {
    id: "EVENT_CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];

export const moodOptions = [
  {
    id: "MOOD_1",
    icon: "1",
    title: "따뜻하고 포근한 분위기",
  },
  {
    id: "MOOD_2",
    icon: "2",
    title: "신비롭고 몽환적인 분위기",
  },
  {
    id: "MOOD_3",
    icon: "3",
    title: "밝고 유쾌한 분위기",
  },
  {
    id: "MOOD_4",
    icon: "4",
    title: "잔잔하고 감동적인 분위기",
  },
  {
    id: "MOOD_CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];

export const lessonOptions = [
  {
    id: "LESSON_1",
    icon: "1",
    title: "친구를 배려하는 마음",
  },
  {
    id: "LESSON_2",
    icon: "2",
    title: "용기 있게 도전하기",
  },
  {
    id: "LESSON_3",
    icon: "3",
    title: "정직하게 말하기",
  },
  {
    id: "LESSON_4",
    icon: "4",
    title: "힘을 합치면 해결할 수 있음",
  },
  {
    id: "LESSON_CUSTOM",
    icon: "+",
    title: "직접 입력하기",
  },
];
export const stepOptionMap = {
  seed: seedOptions,
  pageCount: pageCountOptions,
  character: characterOptions,
  setting: settingOptions,
  event: eventOptions,
  mood: moodOptions,
  lesson: lessonOptions,
};