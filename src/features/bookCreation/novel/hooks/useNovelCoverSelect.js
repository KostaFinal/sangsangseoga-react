import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { coverOptions, fallbackData } from "../data/novelCoverSelectOptions";

export function useNovelCoverSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state || fallbackData;
  const setting = data.setting || fallbackData.setting;
  const scenes = data.scenes || [];

  const [selectedCoverId, setSelectedCoverId] = useState(1);

  const selectedCover = useMemo(() => {
    return (
      coverOptions.find((cover) => cover.id === selectedCoverId) ||
      coverOptions[0]
    );
  }, [selectedCoverId]);

  const title = setting.storySeed || "제목 없는 소설";

  const handleConfirmCover = () => {
    const payload = {
      setting,
      scenes,
      cover: selectedCover,
    };

    console.log("표지 확정 데이터:", payload);

    navigate("/bookmaker/novel/complete", {
      state: payload,
    });
  };

  const handleRegenerate = () => {
    alert("표지 다시 추천 기능은 이후 AI 이미지 생성 API와 연결하면 됩니다.");
  };

  return {
    coverOptions,
    data,
    navigate,
    setting,
    selectedCoverId,
    setSelectedCoverId,
    selectedCover,
    title,
    handleConfirmCover,
    handleRegenerate,
  };
}
