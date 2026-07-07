export const rows = [
  ["책 형식", "bookType"],
  ["작가 수준", "writerLevel"],
  ["이야기 씨앗", "storySeed"],
  ["페이지 수", "pageCount"],
  ["주인공 이름", "protagonistName"],
  ["주인공 설명", "protagonistDesc"],
  ["배경", "backgroundPlace"],
  ["문제/목표", "problem"],
  ["분위기", "mood"],
  ["교훈", "lesson"],
  ["제목", "title"],
];

export const modeLabel = {
  FREE: "자유형",
  MIXED: "선택 + 입력형",
  CHOICE: "선택형",
};

export const bookTypeLabel = {
  FAIRY_TALE: "동화",
  NOVEL: "소설",
};

export const fallbackConfirmData = {
  bookType: "FAIRY_TALE",
  interactionMode: "MIXED",
  writerLevel: "LOWER_ELEMENTARY",
};
