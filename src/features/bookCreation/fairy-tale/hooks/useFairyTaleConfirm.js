import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  bookTypeLabel,
  fallbackConfirmData,
  modeLabel,
  rows,
} from "../data/fairyTaleConfirmOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";

export function useFairyTaleConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || fallbackConfirmData;

  const getValue = (key) => {
    if (key === "interactionMode") return modeLabel[data[key]] || data[key] || "미정";
    if (key === "bookType") return bookTypeLabel[data[key]] || data[key] || "미정";
    if (key === "pageCount") return data[key] ? `${data[key]}쪽` : "미정";
    return data[key] || data.seed || data.character || "미정";
  };

  const isFreeMode = (data.interactionMode || data.creationMode) === "FREE";

  const handlePrev = () => {
    navigate(-1);
  };

  // FREE(자유형)는 설정 확인 후 채팅형 글쓰기 화면(CHAT)으로, CHOICE(그리고 Confirm을 거치는 다른 방식)는
  // MIXED와 동일하게 공동창작실(STUDIO)로 이동한다 — 거기서 pagePlan을 생성/캐싱하고 페이지별로 완성한 뒤
  // 마지막 페이지에서 Studio 자신이 이미지 설계실(IMAGES)로 넘어간다.
  const handleGoImages = () => {
    const finalData = normalizeFairyTaleDraftState(data, {
      creationMode: data.creationMode || data.interactionMode,
      interactionMode: data.interactionMode || data.creationMode,
    });

    const nextRoute = isFreeMode
      ? BOOK_CREATION_ROUTES.FAIRY_TALE.CHAT
      : BOOK_CREATION_ROUTES.FAIRY_TALE.STUDIO;

    navigate(nextRoute, { state: finalData });
  };

  return {
    rows,
    getValue,
    isFreeMode,
    handlePrev,
    handleGoImages,
  };
}
