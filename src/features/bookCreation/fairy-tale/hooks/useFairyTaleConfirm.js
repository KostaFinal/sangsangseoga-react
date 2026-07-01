import { useLocation, useNavigate } from "react-router-dom";

import {
  fallbackConfirmData,
  modeLabel,
  rows,
} from "../data/fairyTaleConfirmOptions";

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
    navigate("/fairy-tale/images", { state: data });
  };

  return {
    rows,
    getValue,
    handlePrev,
    handleGoImages,
  };
}
