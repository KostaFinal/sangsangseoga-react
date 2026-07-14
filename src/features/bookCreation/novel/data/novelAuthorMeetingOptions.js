export const requiredAgenda = [
  "이야기 씨앗",
  "장르",
  "주인공",
  "배경",
  "갈등 / 문제",
  "결말 방향",
];

// 분위기/시점/분량/문체/전개 속도/금지 요소는 confirm 화면의 "연출(directing)" 6개 항목과 같다.
// 자유형(FREE)은 별도 확정 화면(CONFIRM) 없이 이 채팅 안에서 전부 물어보고 바로 집필로 넘어간다.
export const optionalAgenda = [
  "분위기",
  "문제",
  "시점",
  "분량",
  "문체",
  "전개 속도",
  "금지 요소",
];

export const initialMinutes = {
  storySeed: "미정",
  genre: "미정",
  protagonist: "미정",
  background: "미정",
  conflict: "미정",
  ending: "미정",
  mood: "미정",
  problem: "미정",
  pointOfView: "미정",
  volume: "미정",
  style: "미정",
  pace: "미정",
  avoid: "미정",
};

export const agendaKeyMap = {
  "이야기 씨앗": "storySeed",
  장르: "genre",
  주인공: "protagonist",
  배경: "background",
  "갈등 / 문제": "conflict",
  "결말 방향": "ending",
  분위기: "mood",
  문제: "problem",
  시점: "pointOfView",
  분량: "volume",
  문체: "style",
  "전개 속도": "pace",
  "금지 요소": "avoid",
};
