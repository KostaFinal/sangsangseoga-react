import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
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
    return data[key] || data.seed || data.character || "미정";
  };

  const handlePrev = () => {
    navigate(-1);
  };

  const handleGoImages = () => {
    const finalData = normalizeFairyTaleDraftState(data, {
      creationMode: data.creationMode || data.interactionMode,
      interactionMode: data.interactionMode || data.creationMode,
    });

    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.IMAGES, { state: finalData });
  };

  return {
    rows,
    getValue,
    handlePrev,
    handleGoImages,
  };
}
