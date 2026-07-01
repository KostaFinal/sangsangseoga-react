// src/features/book-editor/data/editorTemplates.js

export const PAGE_WIDTH = 480;
export const PAGE_HEIGHT = 620;

export const BOOK_TYPES = {
  POEM: "POEM",
  INFO: "INFO",
};

export const PAGE_TYPES = {
  COVER: "COVER",
  POEM: "POEM",
  INFO: "INFO",
};

export const ELEMENT_TYPES = {
  TEXT: "text",
  IMAGE: "image",
};

export const LAYOUT_TYPES = {
  COVER_BASIC: "COVER_BASIC",

  POEM_IMAGE_OVERLAY: "POEM_IMAGE_OVERLAY",
  POEM_TOP_IMAGE_BOTTOM_TEXT: "POEM_TOP_IMAGE_BOTTOM_TEXT",

  INFO_PRODUCT_OVERVIEW: "INFO_PRODUCT_OVERVIEW",
  INFO_IMAGE_LEFT_TEXT_RIGHT: "INFO_IMAGE_LEFT_TEXT_RIGHT",
};

export const cloneData = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export const createElementId = (prefix = "element") => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * 공통 표지 템플릿
 * 시/정보책 모두 표지는 같은 구조를 쓸 수 있음
 */
export const createCoverPage = () => ({
  id: "cover",
  pageType: PAGE_TYPES.COVER,
  layoutType: LAYOUT_TYPES.COVER_BASIC,
  title: "표지",
  backgroundColor: "#ffffff",
  elements: [
    {
      id: "cover-image",
      type: ELEMENT_TYPES.IMAGE,
      role: "coverImage",
      src: "https://picsum.photos/seed/layout-cover/900/1200",
      x: 0,
      y: 0,
      w: PAGE_WIDTH,
      h: PAGE_HEIGHT,
      radius: 0,
      opacity: 1,
      objectFit: "cover",
      zIndex: 1,
      locked: false,
    },
    {
      id: "cover-title",
      type: ELEMENT_TYPES.TEXT,
      role: "coverTitle",
      html: "<p>책 제목을 입력하세요</p>",
      x: 50,
      y: 395,
      w: 380,
      h: 90,
      fontSize: 34,
      lineHeight: 1.25,
      color: "#ffffff",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: "cover-subtitle",
      type: ELEMENT_TYPES.TEXT,
      role: "coverSubtitle",
      html: "<p>부제목 또는 작가명을 입력하세요</p>",
      x: 70,
      y: 500,
      w: 340,
      h: 45,
      fontSize: 15,
      lineHeight: 1.4,
      color: "#ffffff",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
  ],
});

/**
 * 시 페이지 템플릿 1
 * 이미지 위에 시 제목/본문/작가명이 올라가는 구조
 */
export const createPoemOverlayPage = (pageNumber = 1) => ({
  id: `poem-${pageNumber}`,
  pageType: PAGE_TYPES.POEM,
  layoutType: LAYOUT_TYPES.POEM_IMAGE_OVERLAY,
  title: `${pageNumber} 페이지`,
  backgroundColor: "#ffffff",
  elements: [
    {
      id: `poem-bg-${pageNumber}`,
      type: ELEMENT_TYPES.IMAGE,
      role: "backgroundImage",
      src: `https://picsum.photos/seed/poem-bg-${pageNumber}/900/1200`,
      x: 0,
      y: 0,
      w: PAGE_WIDTH,
      h: PAGE_HEIGHT,
      radius: 0,
      opacity: 1,
      objectFit: "cover",
      zIndex: 1,
      locked: false,
    },
    {
      id: `poem-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "poemTitle",
      html: "<p>달빛이 머무는 밤</p>",
      x: 55,
      y: 110,
      w: 370,
      h: 60,
      fontSize: 30,
      lineHeight: 1.3,
      color: "#ffffff",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `poem-body-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "poemBody",
      html: "<p>조용한 밤하늘 아래<br>작은 마음 하나가<br>별빛처럼 흔들립니다.</p>",
      x: 70,
      y: 225,
      w: 340,
      h: 210,
      fontSize: 22,
      lineHeight: 1.9,
      color: "#ffffff",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
    {
      id: `poem-author-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "author",
      html: "<p>- 작가명</p>",
      x: 260,
      y: 505,
      w: 170,
      h: 40,
      fontSize: 15,
      lineHeight: 1.4,
      color: "#ffffff",
      backgroundColor: "transparent",
      align: "right",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
  ],
});

/**
 * 시 페이지 템플릿 2
 * 상단 이미지 + 하단 시 본문 구조
 */
export const createPoemTopImagePage = (pageNumber = 1) => ({
  id: `poem-simple-${pageNumber}`,
  pageType: PAGE_TYPES.POEM,
  layoutType: LAYOUT_TYPES.POEM_TOP_IMAGE_BOTTOM_TEXT,
  title: `${pageNumber} 페이지`,
  backgroundColor: "#ffffff",
  elements: [
    {
      id: `poem-top-image-${pageNumber}`,
      type: ELEMENT_TYPES.IMAGE,
      role: "mainImage",
      src: `https://picsum.photos/seed/poem-simple-${pageNumber}/900/700`,
      x: 35,
      y: 35,
      w: 410,
      h: 255,
      radius: 24,
      opacity: 1,
      objectFit: "cover",
      zIndex: 1,
      locked: false,
    },
    {
      id: `poem-simple-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "poemTitle",
      html: "<p>시 제목을 입력하세요</p>",
      x: 45,
      y: 325,
      w: 390,
      h: 50,
      fontSize: 28,
      lineHeight: 1.3,
      color: "#222222",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `poem-simple-body-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "poemBody",
      html: "<p>여기에 시를 입력하세요.<br>짧은 문장과 여백을 활용하면<br>시집 같은 느낌을 만들 수 있어요.</p>",
      x: 60,
      y: 400,
      w: 360,
      h: 150,
      fontSize: 20,
      lineHeight: 1.9,
      color: "#555555",
      backgroundColor: "transparent",
      align: "center",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
  ],
});

/**
 * 정보책 페이지 템플릿 1
 * 참고 이미지와 비슷한 구조:
 * 상단 제목/개요 + 왼쪽 이미지 + 오른쪽 설명 섹션
 */
export const createInfoProductOverviewPage = (pageNumber = 1) => ({
  id: `info-${pageNumber}`,
  pageType: PAGE_TYPES.INFO,
  layoutType: LAYOUT_TYPES.INFO_PRODUCT_OVERVIEW,
  title: `${pageNumber} 페이지`,
  backgroundColor: "#ffffff",
  elements: [
    {
      id: `info-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "title",
      html: "<p>제품 개요</p>",
      x: 35,
      y: 35,
      w: 410,
      h: 60,
      fontSize: 34,
      lineHeight: 1.2,
      color: "#111111",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-summary-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "summary",
      html: "<p>여기에 텍스트를 입력하세요. 제품의 핵심 특징과 사용 목적을 간단하게 설명합니다.</p>",
      x: 35,
      y: 105,
      w: 410,
      h: 105,
      fontSize: 17,
      lineHeight: 1.7,
      color: "#666666",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-main-image-${pageNumber}`,
      type: ELEMENT_TYPES.IMAGE,
      role: "mainImage",
      src: `https://picsum.photos/seed/info-main-${pageNumber}/600/700`,
      x: 35,
      y: 255,
      w: 210,
      h: 270,
      radius: 22,
      opacity: 1,
      objectFit: "cover",
      zIndex: 5,
      locked: false,
    },
    {
      id: `info-section-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "sectionTitle",
      html: "<p>주요 특징</p>",
      x: 270,
      y: 260,
      w: 180,
      h: 50,
      fontSize: 25,
      lineHeight: 1.3,
      color: "#111111",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-section-body-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "sectionBody",
      html: "<p>여기에 텍스트를 입력하세요. 이미지 옆에 들어갈 설명을 작성합니다.</p>",
      x: 270,
      y: 320,
      w: 180,
      h: 120,
      fontSize: 16,
      lineHeight: 1.7,
      color: "#666666",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-highlight-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "highlightTitle",
      html: "<p>강조 문구</p>",
      x: 270,
      y: 465,
      w: 180,
      h: 40,
      fontSize: 21,
      lineHeight: 1.3,
      color: "#e5298a",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-highlight-body-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "highlightBody",
      html: "<p>중요한 정보나 사용자가 기억해야 할 내용을 짧게 정리합니다.</p>",
      x: 270,
      y: 515,
      w: 180,
      h: 70,
      fontSize: 15,
      lineHeight: 1.6,
      color: "#666666",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
  ],
});

/**
 * 정보책 페이지 템플릿 2
 * 왼쪽 이미지 + 오른쪽 텍스트 중심 구조
 */
export const createInfoImageLeftPage = (pageNumber = 1) => ({
  id: `info-left-${pageNumber}`,
  pageType: PAGE_TYPES.INFO,
  layoutType: LAYOUT_TYPES.INFO_IMAGE_LEFT_TEXT_RIGHT,
  title: `${pageNumber} 페이지`,
  backgroundColor: "#ffffff",
  elements: [
    {
      id: `info-left-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "title",
      html: "<p>정보 제목</p>",
      x: 35,
      y: 35,
      w: 410,
      h: 60,
      fontSize: 34,
      lineHeight: 1.2,
      color: "#111111",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-left-image-${pageNumber}`,
      type: ELEMENT_TYPES.IMAGE,
      role: "mainImage",
      src: `https://picsum.photos/seed/info-left-${pageNumber}/600/800`,
      x: 35,
      y: 135,
      w: 190,
      h: 390,
      radius: 24,
      opacity: 1,
      objectFit: "cover",
      zIndex: 5,
      locked: false,
    },
    {
      id: `info-left-section-title-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "sectionTitle",
      html: "<p>핵심 설명</p>",
      x: 250,
      y: 145,
      w: 195,
      h: 50,
      fontSize: 25,
      lineHeight: 1.3,
      color: "#111111",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 800,
      zIndex: 10,
      locked: false,
    },
    {
      id: `info-left-section-body-${pageNumber}`,
      type: ELEMENT_TYPES.TEXT,
      role: "sectionBody",
      html: "<p>이미지 오른쪽에 들어갈 설명을 작성합니다. 정보책은 이미지와 설명의 균형이 중요합니다.</p>",
      x: 250,
      y: 215,
      w: 195,
      h: 210,
      fontSize: 16,
      lineHeight: 1.7,
      color: "#666666",
      backgroundColor: "transparent",
      align: "left",
      fontWeight: 500,
      zIndex: 10,
      locked: false,
    },
  ],
});

/**
 * 초기 페이지 생성
 * LayoutBookEditor에서 bookType에 따라 호출
 */
export const createInitialPages = (bookType = BOOK_TYPES.INFO) => {
  if (bookType === BOOK_TYPES.POEM) {
    return [
      createCoverPage(),
      createPoemOverlayPage(1),
      createPoemTopImagePage(2),
    ];
  }

  return [
    createCoverPage(),
    createInfoProductOverviewPage(1),
    createInfoImageLeftPage(2),
  ];
};

/**
 * 새 페이지 추가용 기본 템플릿
 */
export const createNewPageByBookType = (bookType = BOOK_TYPES.INFO, pageNumber = 1) => {
  if (bookType === BOOK_TYPES.POEM) {
    return createPoemOverlayPage(pageNumber);
  }

  return createInfoProductOverviewPage(pageNumber);
};

/**
 * 빈 텍스트 요소 추가용
 */
export const createTextElement = () => ({
  id: createElementId("text"),
  type: ELEMENT_TYPES.TEXT,
  role: "customText",
  html: "<p>텍스트를 입력하세요</p>",
  x: 60,
  y: 80,
  w: 360,
  h: 100,
  fontSize: 20,
  lineHeight: 1.6,
  color: "#2f2d59",
  backgroundColor: "transparent",
  align: "left",
  fontWeight: 500,
  zIndex: 20,
  locked: false,
});

/**
 * 빈 이미지 요소 추가용
 */
export const createImageElement = () => ({
  id: createElementId("image"),
  type: ELEMENT_TYPES.IMAGE,
  role: "customImage",
  src: "https://picsum.photos/seed/new-image/600/800",
  x: 80,
  y: 150,
  w: 260,
  h: 260,
  radius: 18,
  opacity: 1,
  objectFit: "cover",
  zIndex: 5,
  locked: false,
});
