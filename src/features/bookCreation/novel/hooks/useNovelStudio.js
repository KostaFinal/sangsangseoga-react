import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { workModes, writerLevels } from "../data/novelStudioOptions";

export function useNovelStudio() {
  const navigate = useNavigate();

  const [writerLevel, setWriterLevel] = useState(null);
  const [workMode, setWorkMode] = useState(null);

  const canStart = writerLevel !== null && workMode !== null;

  const activeScene = useMemo(() => {
    if (!writerLevel) return 1;
    if (!workMode) return 2;
    return 3;
  }, [writerLevel, workMode]);

  const handleStart = () => {
    if (!canStart) {
      alert("작가 수준과 작업 방식을 모두 선택해 주세요.");
      return;
    }

    const payload = {
      bookType: "NOVEL",
      writerLevel,
      interactionMode: workMode,
    };

    console.log("소설 만들기 시작:", payload);

    if (workMode === "FREE") {
      navigate("/bookmaker/novel/chat", { state: payload });
      return;
    }

    if (workMode === "MIXED") {
      navigate("/bookmaker/novel/builder", { state: payload });
      return;
    }

    if (workMode === "CHOICE") {
      navigate("/bookmaker/novel/quick", { state: payload });
    }
  };

  return {
    writerLevels,
    workModes,
    writerLevel,
    setWriterLevel,
    workMode,
    setWorkMode,
    canStart,
    activeScene,
    handleStart,
  };
}
