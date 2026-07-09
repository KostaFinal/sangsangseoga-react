import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .trim();

export function useFairyTaleComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const pages = Array.isArray(state.pages) ? state.pages : [];
  const coverPage = pages.find((page) => page.type === "cover") || pages[0];

  const title =
    stripHtml(coverPage?.text?.html) ||
    stripHtml(state.title) ||
    "나의 동화책";

  const coverImageSrc = coverPage?.cover?.src || null;

  const protagonistName =
    state.protagonistName ||
    state.fairyTaleSetting?.protagonistName ||
    state.setting?.protagonistName ||
    "";

  const subtitle = protagonistName
    ? `${protagonistName}의 모험이 한 권의 책이 되었어요`
    : "멋진 모험이 한 권의 책이 되었어요";

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRestart = () => {
    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.SETTING);
  };

  const handleGoLibrary = () => {
    navigate("/library");
  };

  return {
    title,
    subtitle,
    coverImageSrc,
    handleGoHome,
    handleRestart,
    handleGoLibrary,
  };
}
