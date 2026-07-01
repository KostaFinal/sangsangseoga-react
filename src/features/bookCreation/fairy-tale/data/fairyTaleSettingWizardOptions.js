export const steps = [
  { key: "seed", label: "이야기 씨앗" },
  { key: "character", label: "주인공" },
  { key: "setting", label: "배경" },
  { key: "event", label: "사건" },
  { key: "mood", label: "분위기" },
  { key: "lesson", label: "교훈" },
];

export const seedOptions = [
  {
    id: "MAGIC_OBJECT",
    icon: "🪄",
    title: "마법 물건 이야기",
  },
  {
    id: "FRIENDSHIP",
    icon: "🐰🧸",
    title: "친구와 화해하는 이야기",
  },
  {
    id: "COURAGE",
    icon: "🦸‍♂️",
    title: "작은 용기를 내는 이야기",
  },
  {
    id: "FOREST",
    icon: "🌳",
    title: "신비한 숲 모험",
  },
  {
    id: "CUSTOM",
    icon: "📝",
    title: "직접 입력하기",
  },
];

export const initialSettings = {
  seed: "마법 물건 이야기",
  character: "",
  setting: "",
  event: "",
  mood: "",
  lesson: "",
};
