import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fallbackStudioSetup,
  friendOptions,
  outlineData,
} from "../data/fairyTaleCoCreationStudioOptions";

export function useFairyTaleCoCreationStudio() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialSetup = location.state || fallbackStudioSetup;

  const [selectedFriend, setSelectedFriend] = useState("RABBIT");
  const [customFriend, setCustomFriend] = useState("");
  const [currentPage, setCurrentPage] = useState(4);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(4);

  const selectedOption = friendOptions.find(
    (option) => option.id === selectedFriend
  );

  const pageButtons = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  const handlePrev = () => {
    navigate(-1);
  };

  const handleNextScene = () => {
    const payload = {
      ...initialSetup,
      currentPage,
      selectedFriend,
      customFriend,
      selectedFriendTitle: selectedOption?.title || customFriend,
    };

    console.log("공동창작실 데이터:", payload);
    alert("다음 장면으로 이동합니다! 콘솔을 확인하세요.");

    navigate("/fairy-tale/confirm", {
      state: payload,
    });
  };

  return {
    outlineData,
    friendOptions,
    selectedFriend,
    setSelectedFriend,
    customFriend,
    setCustomFriend,
    currentPage,
    setCurrentPage,
    isPreviewOpen,
    setIsPreviewOpen,
    previewPage,
    setPreviewPage,
    selectedOption,
    pageButtons,
    handlePrev,
    handleNextScene,
  };
}
