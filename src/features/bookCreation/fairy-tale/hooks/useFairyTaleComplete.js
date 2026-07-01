import { useNavigate } from "react-router-dom";

export function useFairyTaleComplete() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRestart = () => {
    navigate("/fairy-tale/setting");
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
