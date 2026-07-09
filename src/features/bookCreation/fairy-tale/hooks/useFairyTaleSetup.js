import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { useRequireAuth } from "../../../../shared/hooks/useRequireAuth.js";
import {
  interactionModes,
  writerLevels,
} from "../data/fairyTaleSetupOptions";

export function useFairyTaleSetup() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

  const [writerLevel, setWriterLevel] = useState(null);
  const [interactionMode, setInteractionMode] = useState(null);

  const isReady = writerLevel && interactionMode;

  const handleStart = () => {
    if (!isReady) return;
    if (!requireAuth()) return;

    const setupData = {
      bookType: "FAIRY_TALE",
      writerLevel,
      interactionMode,
    };

    console.log("동화 만들기 시작 데이터:", setupData);

    if (interactionMode === "FREE") {
      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.FREE_SETTING, { state: setupData });
    } else if (interactionMode === "MIXED") {
      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.SETTING, { state: setupData });
    } else if (interactionMode === "CHOICE") {
      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.BUILDER, { state: setupData });
    }
  };

  const getWriterLevelLabel = (id) =>
    writerLevels.find((level) => level.id === id)?.label;

  const getInteractionModeLabel = (id) =>
    interactionModes.find((mode) => mode.id === id)?.label;

  return {
    writerLevels,
    interactionModes,
    writerLevel,
    setWriterLevel,
    interactionMode,
    setInteractionMode,
    isReady,
    handleStart,
    getWriterLevelLabel,
    getInteractionModeLabel,
  };
}
