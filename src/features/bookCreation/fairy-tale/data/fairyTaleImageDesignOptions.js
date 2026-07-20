import fairysheep from "../../assets/fairysheep.png";
import pastel from "../../assets/pastel.png";
import painting from "../../assets/painting.png";
import cute_3D from "../../assets/3d.png";
import illustration from "../../assets/illustration.png";

export const uploadedImages = [
  { id: 1, src: pastel, alt: "마법사 양 참고 이미지" },
  { id: 2, src: painting, alt: "성 배경 참고 이미지" },
  { id: 3, src: cute_3D, alt: "귀여운 3D 참고 이미지" },
  { id: 4, src: illustration, alt: "그림책 참고 이미지" },
];

export const styles = [
  {
    id: "PASTEL",
    label: "파스텔 동화풍",
    desc: "부드럽고 포근한 색감",
    image: pastel,
  },
  {
    id: "WATERCOLOR",
    label: "수채화",
    desc: "맑고 따뜻한 그림책 느낌",
    image: painting,
  },
  {
    id: "CUTE_3D",
    label: "귀여운 3D",
    desc: "입체적이고 사랑스러운 느낌",
    image: cute_3D,
  },
  {
    id: "PICTURE_BOOK",
    label: "그림책 일러스트",
    desc: "동화책다운 손그림 분위기",
    image: illustration,
  },
];

export const fixedPagePlans = [
  {
    page: "1p",
    color: "blue",
    image: fairysheep,
    sceneTitle: "구름 위의 아침, 창가에 앉아 책을 읽는 루미",
    editText: "아침 햇살이 비치는 창가에 앉아 책을 읽는 루미의 모습이에요.",
  },
  {
    page: "2p",
    color: "mint",
    image: fairysheep,
    sceneTitle: "반짝이는 사라진 지팡이를 보고 놀라는 루미",
    editText: "지팡이가 사라진 걸 보고 깜짝 놀라 고개를 든 루미의 모습이에요.",
  },
  {
    page: "3p",
    color: "orange",
    image: fairysheep,
    sceneTitle: "반짝이는 숲에서 작은 요정을 처음 만나는 루미",
    editText: "숲속에서 작은 요정 친구를 처음 만나 인사하는 장면이에요.",
  },
  {
    page: "4p",
    color: "pink",
    image: fairysheep,
    sceneTitle: "루미와 작은 요정이 별빛 길을 함께 걷는 장면",
    editText: "별빛이 반짝이는 길을 함께 걸으며 모험을 시작하는 장면이에요.",
  },
];

export const getPageColor = (pageNumber) => {
  if (pageNumber % 5 === 1) return "blue";
  if (pageNumber % 5 === 2) return "mint";
  if (pageNumber % 5 === 3) return "orange";
  if (pageNumber % 5 === 4) return "pink";
  return "cover";
};

export const createPagePlans = (pageCount) => {
  const cover = {
    page: "표지",
    color: "cover",
    image: fairysheep,
    sceneTitle: "루미가 마법 성 앞에서 별 지팡이를 들고 있는 장면",
    editText: "루미가 마법 성 앞에서 환하게 웃으며 별 지팡이를 들고 있어요.",
    isEditing: false,
    isLocked: false,
  };

  const pages = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;

    const fixedPage = fixedPagePlans.find(
      (plan) => plan.page === `${pageNumber}p`
    );

    if (fixedPage) {
      return {
        ...fixedPage,
        isEditing: false,
        isLocked: false,
      };
    }

    return {
      page: `${pageNumber}p`,
      color: getPageColor(pageNumber),
      image: fairysheep,
      sceneTitle: `${pageNumber}페이지 장면을 입력해 주세요`,
      editText: `${pageNumber}페이지에 들어갈 삽화 장면을 입력해 주세요.`,
      isEditing: false,
      isLocked: false,
    };
  });

  return [cover, ...pages];
};

// 실제 이야기 설정(주인공/배경/중요한 물건)으로 표지 장면 설명 문장을 만든다. 최소 하나라도
// 있어야 의미 있는 문장이 되므로, 아무것도 없으면 null을 반환해 기존 placeholder를 유지한다.
const buildCoverEditText = (setting) => {
  if (!setting) return null;

  const protagonistName =
    setting.protagonist?.split(",")[0]?.trim() || setting.protagonistName || "";
  const place = setting.backgroundPlace || "";
  const object = setting.importantObject || "";

  if (!protagonistName && !place && !object) return null;

  const placePart = place ? `${place}에서 ` : "";
  const objectPart = object ? `${object}와 함께 ` : "";
  const subject = protagonistName || "주인공";

  return `${subject}이(가) ${placePart}${objectPart}있는 표지 장면이에요.`.replace(/\s+/g, " ").trim();
};

// 이전 화면(공동창작실/채팅형 글쓰기)에서 만든 실제 pagePlan(sceneTitle/imagePromptBase)이 있으면
// 하드코딩 placeholder 대신 그 값으로 장면 수정 칸(sceneTitle/editText)을 채운다.
// 실제 데이터가 없는 페이지는 기존 placeholder를 그대로 fallback으로 유지한다.
export const buildRealPageRows = (previousData, pageCount) => {
  const realPages =
    (Array.isArray(previousData?.pagePlans) && previousData.pagePlans.length && previousData.pagePlans) ||
    (Array.isArray(previousData?.storyPages) && previousData.storyPages.length && previousData.storyPages) ||
    (Array.isArray(previousData?.fairyTalePages) && previousData.fairyTalePages.length && previousData.fairyTalePages) ||
    [];

  if (!realPages.length) return null;

  const byPageNo = new Map(realPages.map((page) => [Number(page.pageNo), page]));
  const bookTitle = previousData?.fairyTaleSetting?.title || previousData?.title;

  return createPagePlans(pageCount).map((row) => {
    if (row.page === "표지") {
      // 표지는 다른 페이지처럼 매칭할 pagePlan이 없으니(표지는 outline.pages에 안 들어있음),
      // 이야기 설정(주인공/배경/중요한 물건)으로 대신 채운다 - 예전엔 이 자리만 하드코딩된
      // 예시 문구("루미가 마법 성 앞에서...")가 그대로 남아있었다.
      const coverEditText = buildCoverEditText(previousData?.fairyTaleSetting);
      return {
        ...row,
        sceneTitle: bookTitle || row.sceneTitle,
        editText: coverEditText || row.editText,
      };
    }

    const pageNo = Number(String(row.page).replace("p", ""));
    const realPage = byPageNo.get(pageNo);
    if (!realPage) return row;

    return {
      ...row,
      sceneTitle: realPage.sceneTitle || realPage.title || row.sceneTitle,
      editText: realPage.imagePromptBase || realPage.summary || realPage.body || row.editText,
    };
  });
};

export const LOADING_MESSAGES = [
  "루미의 얼굴이 페이지마다 비슷하게 보이도록 맞추고 있어요.",
  "표지에는 동화의 분위기가 잘 드러나도록 색감을 정리하고 있어요.",
  "장면 문구에 맞춰 표정과 배경이 자연스럽게 이어지도록 그리고 있어요.",
  "텍스트와 말풍선이 들어가지 않도록 확인하고 있어요.",
  "각 페이지의 분위기가 끊기지 않도록 전체 흐름을 정리하고 있어요.",
  "완성된 삽화를 에디터에서 바로 볼 수 있게 준비하고 있어요.",
];
