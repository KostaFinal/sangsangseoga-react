import fairysheep from "../../assets/fairysheep.png";
import pastel from "../../assets/pastel.png";
import painting from "../../assets/painting.png";
import cute3D from "../../assets/3d.png";
import illustration from "../../assets/illustration.png";

export const fallbackImages = [pastel, painting, cute3D, illustration, fairysheep];

export const fallbackPages = [
  {
    id: "cover",
    label: "표지",
    title: "별빛을 찾아 떠난 루미",
    subtitle: "마법사 양 루미의 별빛 모험",
    status: "저장됨",
    statusType: "saved",
    image: pastel,
    previousImage: null,
    imageStatus: "READY",
    body: "",
    pageType: "cover",
    imageFit: "cover",
    showPageNumber: false,
    textAlign: "center",
    paperPadding: "normal",
  },
  {
    id: "1",
    label: "1p",
    title: "구름 성의 아침",
    subtitle: "",
    status: "저장됨",
    statusType: "saved",
    image: painting,
    previousImage: null,
    imageStatus: "READY",
    body:
      "구름 성의 아침은 언제나 반짝였어요.\n마법사 양 루미는 창가에 앉아 조용히 책을 읽고 있었지요.",
    pageType: "body",
    imageFit: "cover",
    showPageNumber: true,
    textAlign: "left",
    paperPadding: "normal",
  },
  {
    id: "2",
    label: "2p",
    title: "마법사 양 루미 등장",
    subtitle: "",
    status: "저장됨",
    statusType: "saved",
    image: cute3D,
    previousImage: null,
    imageStatus: "READY",
    body:
      "루미는 별 지팡이를 가장 아끼는 작은 마법사였어요.\n루미의 지팡이는 어두운 길도 환하게 밝혀 주었답니다.",
    pageType: "body",
    imageFit: "cover",
    showPageNumber: true,
    textAlign: "left",
    paperPadding: "normal",
  },
  {
    id: "3",
    label: "3p",
    title: "별빛이 사라짐",
    subtitle: "",
    status: "수정 필요",
    statusType: "warning",
    image: illustration,
    previousImage: null,
    imageStatus: "READY",
    body:
      "어느 날 밤, 하늘의 별빛이 하나둘 사라지기 시작했어요.\n루미는 깜짝 놀라 별빛을 찾아 나서기로 했지요.",
    pageType: "body",
    imageFit: "cover",
    showPageNumber: true,
    textAlign: "left",
    paperPadding: "normal",
  },
  {
    id: "4",
    label: "4p",
    title: "숲에서 만난 친구",
    subtitle: "",
    status: "현재 편집 중",
    statusType: "editing",
    image: painting,
    previousImage: null,
    imageStatus: "READY",
    body:
      "마법사 양 루미는\n반짝이는 숲길을 조심조심 걸었어요.\n그때, 나뭇잎 사이에서\n작은 울음소리가 들려왔지요.\n\n나뭇잎 뒤에는\n겁 많고 외로운 작은 용이 숨어 있었어요.",
    pageType: "body",
    imageFit: "cover",
    showPageNumber: true,
    textAlign: "left",
    paperPadding: "normal",
  },
];

export const getFallbackImage = (index) => {
  return fallbackImages[index % fallbackImages.length];
};

export const getNowText = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour % 12 || 12;

  return `${period} ${displayHour}:${minute}`;
};

export const normalizeEditorPages = (state) => {
  if (!state || Object.keys(state).length === 0) {
    return fallbackPages;
  }

  if (Array.isArray(state.pages) && state.pages.length > 0) {
    return state.pages.map((page, index) => {
      const isCover = page.id === "cover" || page.label === "표지";

      return {
        id: page.id || (isCover ? "cover" : String(index)),
        label: page.label || page.page || `${index}p`,
        title: page.title || page.sceneTitle || "제목 없음",
        subtitle: page.subtitle || "",
        status: page.status || "저장됨",
        statusType: page.statusType || "saved",
        image: page.image || getFallbackImage(index),
        previousImage: page.previousImage || null,
        imageStatus: page.imageStatus || "READY",
        body: page.body || page.bodyText || "",
        pageType: page.pageType || (isCover ? "cover" : "body"),
        imageFit: page.imageFit || "cover",
        showPageNumber:
          typeof page.showPageNumber === "boolean"
            ? page.showPageNumber
            : !isCover,
        textAlign: page.textAlign || (isCover ? "center" : "left"),
        paperPadding: page.paperPadding || "normal",
      };
    });
  }

  const setting = state.fairyTaleSetting || {};
  const textPages = state.fairyTalePages || state.pageTexts || [];
  const imagePages = state.pageImages || [];
  const pageCount =
    Number(setting.pageCount) ||
    Number(state.pageCount) ||
    Math.max(textPages.length, imagePages.length - 1, 4);

  const coverImage =
    imagePages.find((image) => image.page === "표지")?.image || pastel;

  const coverPage = {
    id: "cover",
    label: "표지",
    title: setting.title || state.title || "나만의 동화책",
    subtitle: setting.storySeed || "",
    status: "저장됨",
    statusType: "saved",
    image: coverImage,
    previousImage: null,
    imageStatus: "READY",
    body: "",
    pageType: "cover",
    imageFit: "cover",
    showPageNumber: false,
    textAlign: "center",
    paperPadding: "normal",
  };

  const bodyPages = Array.from({ length: pageCount }, (_, index) => {
    const pageNo = index + 1;
    const label = `${pageNo}p`;

    const textPage =
      textPages.find(
        (page) =>
          page.pageNo === pageNo ||
          page.page === label ||
          page.label === label ||
          page.id === String(pageNo)
      ) || {};

    const imagePage =
      imagePages.find(
        (page) =>
          page.page === label ||
          page.pageNo === pageNo ||
          page.label === label ||
          page.id === String(pageNo)
      ) || {};

    const title =
      textPage.sceneTitle ||
      imagePage.sceneTitle ||
      textPage.title ||
      `${pageNo}페이지`;

    const body =
      textPage.body ||
      textPage.bodyText ||
      textPage.text ||
      imagePage.body ||
      "";

    return {
      id: String(pageNo),
      label,
      title,
      subtitle: "",
      status: body ? "저장됨" : "수정 필요",
      statusType: body ? "saved" : "warning",
      image: imagePage.image || getFallbackImage(index),
      previousImage: null,
      imageStatus: "READY",
      body,
      pageType: "body",
      imageFit: "cover",
      showPageNumber: true,
      textAlign: "left",
      paperPadding: "normal",
    };
  });

  return [coverPage, ...bodyPages];
};

export const makeRewriteSuggestion = (type, sentence) => {
  const clean = sentence.trim();

  if (!clean) {
    return "";
  }

  if (type === "easy") {
    return clean
      .replaceAll("조심조심", "천천히")
      .replaceAll("반짝이는", "작게 빛나는");
  }

  if (type === "warm") {
    return `${clean} 루미는 조금 떨렸지만, 마음속에는 따뜻한 용기가 피어났어요.`;
  }

  if (type === "short") {
    const firstSentence = clean.split(/[.!?。！？]/)[0];
    return `${firstSentence.trim()}어요.`;
  }

  if (type === "dialogue") {
    return `${clean}\n\n“괜찮아, 천천히 해보자.” 루미가 작은 목소리로 말했어요.`;
  }

  return clean;
};
