import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  interactionModes,
  readerAges,
  writerLevels,
} from "../data/fairyTaleSetupOptions";

export function useFairyTaleSetup() {
  const navigate = useNavigate();

  const [writerLevel, setWriterLevel] = useState(null);
  const [interactionMode, setInteractionMode] = useState(null);
  const [readerAge, setReaderAge] = useState(null);

  const isReady = writerLevel && interactionMode;

  const handleStart = () => {
    if (!isReady) return;

    const setupData = {
      bookType: "FAIRY_TALE",
      writerLevel,
      interactionMode,
      readerAge,
    };

    console.log("동화 만들기 시작 데이터:", setupData);

    if (interactionMode === "FREE") {
      navigate("/fairy-tale/free-setting", { state: setupData });
    } else if (interactionMode === "MIXED") {
      navigate("/fairy-tale/setting", { state: setupData });
    } else if (interactionMode === "CHOICE") {
      navigate("/fairy-tale/builder", { state: setupData });
    }
  };

  const getWriterLevelLabel = (id) =>
    writerLevels.find((level) => level.id === id)?.label;

  const getInteractionModeLabel = (id) =>
    interactionModes.find((mode) => mode.id === id)?.label;

  const getReaderAgeLabel = (id) =>
    readerAges.find((reader) => reader.id === id)?.label;

  return {
    writerLevels,
    interactionModes,
    readerAges,
    writerLevel,
    setWriterLevel,
    interactionMode,
    setInteractionMode,
    readerAge,
    setReaderAge,
    isReady,
    handleStart,
    getWriterLevelLabel,
    getInteractionModeLabel,
    getReaderAgeLabel,
  };
}
