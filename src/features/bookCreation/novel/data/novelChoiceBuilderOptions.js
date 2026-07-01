export const steps = [
  { key: "genre", label: "장르", options: ["판타지", "미스터리", "성장물"] },
  { key: "mood", label: "분위기", options: ["몽환적", "긴장감", "따뜻함"] },
  {
    key: "protagonist",
    label: "주인공",
    options: ["기억을 잃은 학생", "비밀을 가진 작가", "마법을 숨긴 사서"],
  },
  { key: "background", label: "배경", options: ["비밀 도서관", "마법 학교", "안개 낀 도시"] },
  { key: "ending", label: "결말", options: ["희망적 결말", "여운 있는 결말", "반전 결말"] },
];

export const seedMap = {
  판타지: "현실과 마법 세계의 경계가 흔들리는 사건",
  미스터리: "사라진 기록을 추적하는 사건",
  성장물: "글쓰기를 포기하려던 인물이 다시 이야기를 완성하는 과정",
};
