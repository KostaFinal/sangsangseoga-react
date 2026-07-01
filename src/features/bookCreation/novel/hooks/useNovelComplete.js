import { useLocation, useNavigate } from "react-router-dom";

import { fallbackData } from "../data/novelCompleteOptions";

export function useNovelComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state || fallbackData;
  const setting = data.setting || fallbackData.setting;
  const scenes = data.scenes || fallbackData.scenes;
  const cover = data.cover || fallbackData.cover;

  const title = setting.storySeed || "제목 없는 소설";
  const protagonist = setting.protagonist || "미정";
  const genre = setting.genre || "미정";
  const pointOfView = setting.directing?.pointOfView || "미정";
  const mood = setting.directing?.mood || "미정";
  const style = setting.directing?.style || "미정";
  const volume = setting.directing?.volume || "미정";

  const totalCharacters = scenes.reduce((sum, scene) => {
    return sum + (scene.content?.length || 0);
  }, 0);

  const handleGoLibrary = () => {
    alert("내 서재 페이지는 이후 연결하면 됩니다.");
  };

  const handleSavePdf = () => {
    alert("PDF 저장 기능은 이후 백엔드 또는 jsPDF와 연결하면 됩니다.");
  };

  const handleShare = () => {
    alert("공유 기능은 이후 구현하면 됩니다.");
  };

  const handleNewNovel = () => {
    navigate("/bookmaker/novel/chat");
  };

  return {
    setting,
    scenes,
    cover,
    title,
    protagonist,
    genre,
    pointOfView,
    mood,
    style,
    volume,
    totalCharacters,
    handleGoLibrary,
    handleSavePdf,
    handleShare,
    handleNewNovel,
  };
}
