export const scenarios = [
  {
    id: "A",
    title: "황혼의 도서관에서 사라진 편지",
    genre: "판타지 미스터리",
    mood: "몽환적 · 따뜻함",
    seed: "낡은 도서관에서 발견된 이름 없는 편지",
    protagonist: "기억을 잃은 견습 기록관",
    conflict: "편지를 읽을수록 현실의 기억이 바뀐다",
  },
  {
    id: "B",
    title: "별빛 계약을 맺은 작가",
    genre: "성장 판타지",
    mood: "감성적 · 희망적",
    seed: "소설 속 인물이 현실의 작가에게 말을 건다",
    protagonist: "글쓰기를 포기하려던 청소년 작가",
    conflict: "완성되지 않은 이야기가 사라지기 시작한다",
  },
  {
    id: "C",
    title: "마지막 장면을 훔친 마법사",
    genre: "추리 판타지",
    mood: "긴장감 · 신비로움",
    seed: "모든 소설의 결말만 사라지는 사건",
    protagonist: "결말을 읽지 못하는 편집자",
    conflict: "범인을 찾지 못하면 모든 이야기가 미완성으로 남는다",
  },
];

export const filters = {
  genre: ["판타지", "미스터리", "성장물", "로맨스", "모험"],
  mood: ["몽환적", "따뜻함", "긴장감", "잔잔함", "어두움"],
  protagonist: ["작가", "기록관", "학생", "마법사", "편집자"],
  background: ["도서관", "마법 학교", "폐허 도시", "작은 마을", "왕국"],
  ending: ["희망적", "여운 있음", "반전", "따뜻한 결말"],
};

export const initialSelectedFilters = {
  genre: "판타지",
  mood: "몽환적",
  protagonist: "작가",
  background: "도서관",
  ending: "희망적",
};
