import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { useRequireAuth } from "../../../../shared/hooks/useRequireAuth.js";
import { workModes, writerLevels } from "../data/novelStudioOptions";

export function useNovelStudio() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

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
    if (!requireAuth()) return;

    const payload = {
      bookType: "NOVEL",
      writerLevel,
      interactionMode: workMode,
    };

    console.log("소설 만들기 시작:", payload);

    if (workMode === "FREE") {
      navigate(BOOK_CREATION_ROUTES.NOVEL.CHAT, { state: payload });
      return;
    }

    if (workMode === "MIXED") {
      navigate(BOOK_CREATION_ROUTES.NOVEL.BUILDER, { state: payload });
      return;
    }

    if (workMode === "CHOICE") {
      navigate(BOOK_CREATION_ROUTES.NOVEL.QUICK, { state: payload });
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
