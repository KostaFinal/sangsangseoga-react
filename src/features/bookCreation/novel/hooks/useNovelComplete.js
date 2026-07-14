import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { fallbackData } from "../data/novelCompleteOptions";

export function useNovelComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state || fallbackData;
  const setting = data.setting || fallbackData.setting;
  const scenes = data.scenes || fallbackData.scenes;
  const cover = data.cover || fallbackData.cover;
  const coverImageUrl = data.coverImageUrl || null;

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
    navigate("/library");
  };

  const handleShare = () => {
    alert("공유 기능은 이후 구현하면 됩니다.");
  };

  const handleNewNovel = () => {
    navigate(BOOK_CREATION_ROUTES.NOVEL.CHAT);
  };

  return {
    setting,
    scenes,
    cover,
    coverImageUrl,
    title,
    protagonist,
    genre,
    pointOfView,
    mood,
    style,
    volume,
    totalCharacters,
    handleGoLibrary,
    handleShare,
    handleNewNovel,
  };
}
