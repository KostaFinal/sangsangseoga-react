import { useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

export function useFairyTaleComplete() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRestart = () => {
    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.SETTING);
  };

  const handleShare = () => {
    alert("공유 기능은 이후 연결하면 됩니다.");
  };

  const handleGoLibrary = () => {
    navigate("/my-library");
  };

  return {
    handleGoHome,
    handleRestart,
    handleShare,
    handleGoLibrary,
  };
}
