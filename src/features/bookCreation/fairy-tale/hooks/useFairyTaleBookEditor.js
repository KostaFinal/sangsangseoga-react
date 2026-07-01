import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getFallbackImage,
  getNowText,
  makeRewriteSuggestion,
  normalizeEditorPages,
} from "../data/fairyTaleBookEditorOptions";

export function useFairyTaleBookEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  const saveTimerRef = useRef(null);
  const imageTimerRef = useRef(null);

  const previousData = location.state || {};

  const normalizedPages = useMemo(
    () => normalizeEditorPages(previousData),
    [location.state]
  );

  const [pages, setPages] = useState(normalizedPages);
  const [currentPageId, setCurrentPageId] = useState(
    normalizedPages[1]?.id || normalizedPages[0]?.id || "cover"
  );

  const [viewMode, setViewMode] = useState("double");
  const [zoom, setZoom] = useState(100);
  const [rightPanelMode, setRightPanelMode] = useState("ai");

  const [saveStatus, setSaveStatus] = useState("saved");
  const [savedAt, setSavedAt] = useState(getNowText());

  const [selectedSentence, setSelectedSentence] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [directRequest, setDirectRequest] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [completionErrors, setCompletionErrors] = useState([]);

  const currentPage = useMemo(
    () => pages.find((page) => page.id === currentPageId) || pages[0],
    [pages, currentPageId]
  );

  const currentIndex = pages.findIndex((page) => page.id === currentPageId);

  const currentPageSetting = {
    pageType:
      currentPage.pageType || (currentPage.id === "cover" ? "cover" : "body"),
    imageFit: currentPage.imageFit || "cover",
    showPageNumber:
      typeof currentPage.showPageNumber === "boolean"
        ? currentPage.showPageNumber
        : currentPage.id !== "cover",
    textAlign:
      currentPage.textAlign || (currentPage.id === "cover" ? "center" : "left"),
    paperPadding: currentPage.paperPadding || "normal",
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
      }
    };
  }, []);

  const scheduleAutoSave = (pageId) => {
    setSaveStatus("saving");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? {
                ...page,
                status: "저장됨",
                statusType: "saved",
              }
            : page
        )
      );

      setSaveStatus("saved");
      setSavedAt(getNowText());
    }, 900);
  };

  const updateCurrentPagePatch = (patch, pageId = currentPageId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              ...patch,
              status: "현재 편집 중",
              statusType: "editing",
            }
          : page
      )
    );

    scheduleAutoSave(pageId);
  };

  const updateCurrentPage = (field, value) => {
    updateCurrentPagePatch({
      [field]: value,
    });
  };

  const updateCurrentPageSettings = (patch) => {
    updateCurrentPagePatch(patch);
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setCurrentPageId(pages[currentIndex - 1].id);
      setSelectedSentence("");
      setAiSuggestion("");
    }
  };

  const handleNextPage = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentPageId(pages[currentIndex + 1].id);
      setSelectedSentence("");
      setAiSuggestion("");
    }
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 10));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(160, prev + 10));
  };

  const handleFitScreen = () => {
    setZoom(100);
  };

  const handleTextSelect = (event) => {
    const target = event.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (start === end) return;

    const selected = target.value.slice(start, end).trim();

    if (selected) {
      setSelectedSentence(selected);
      setAiSuggestion("");
    }
  };

  const handleRewrite = (type) => {
    const baseSentence =
      selectedSentence ||
      currentPage.body.split("\n").find((line) => line.trim().length > 0) ||
      "";

    if (!baseSentence.trim()) {
      alert("먼저 다듬을 문장을 선택하거나 본문을 입력해 주세요.");
      return;
    }

    setSelectedSentence(baseSentence);
    setAiSuggestion(makeRewriteSuggestion(type, baseSentence));
  };

  const handleDirectRequest = () => {
    const request = directRequest.trim();

    if (!request) {
      alert("AI에게 요청할 내용을 입력해 주세요.");
      return;
    }

    const baseSentence =
      selectedSentence ||
      currentPage.body.split("\n").find((line) => line.trim().length > 0) ||
      "";

    if (!baseSentence.trim()) {
      alert("먼저 다듬을 문장을 선택하거나 본문을 입력해 주세요.");
      return;
    }

    setSelectedSentence(baseSentence);
    setAiSuggestion(`${baseSentence}\n\n요청 반영: ${request}`);
    setDirectRequest("");
  };

  const handleApplySuggestion = () => {
    if (!selectedSentence || !aiSuggestion) return;

    const nextBody = currentPage.body.includes(selectedSentence)
      ? currentPage.body.replace(selectedSentence, aiSuggestion)
      : `${currentPage.body}\n\n${aiSuggestion}`;

    updateCurrentPage("body", nextBody);
    setSelectedSentence(aiSuggestion);
    setAiSuggestion("");
  };

  const handleRegenerateCurrentImage = () => {
    if (currentPage.imageStatus === "GENERATING") return;

    const pageId = currentPageId;
    const currentImage = currentPage.image;

    updateCurrentPagePatch(
      {
        previousImage: currentImage,
        imageStatus: "GENERATING",
      },
      pageId
    );

    imageTimerRef.current = setTimeout(() => {
      const nextImage = getFallbackImage(currentIndex + 2);

      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? {
                ...page,
                image: nextImage,
                imageStatus: "READY",
                status: "현재 편집 중",
                statusType: "editing",
              }
            : page
        )
      );

      scheduleAutoSave(pageId);
    }, 1300);
  };

  const handleUploadCurrentImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    updateCurrentPagePatch({
      previousImage: currentPage.image,
      image: imageUrl,
      imageStatus: "READY",
    });

    event.target.value = "";
  };

  const handleRestorePreviousImage = () => {
    if (!currentPage.previousImage) {
      alert("되돌릴 이전 이미지가 없어요.");
      return;
    }

    updateCurrentPagePatch({
      image: currentPage.previousImage,
      previousImage: null,
      imageStatus: "READY",
    });
  };

  const handleOpenPreview = () => {
    const index = pages.findIndex((page) => page.id === currentPageId);
    setPreviewIndex(index >= 0 ? index : 0);
    setIsPreviewOpen(true);
  };

  const handleComplete = () => {
    const errors = [];

    pages.forEach((page) => {
      if (!page.title.trim()) {
        errors.push(`${page.label} 제목이 비어 있어요.`);
      }

      if (page.id !== "cover" && !page.body.trim()) {
        errors.push(`${page.label} 본문이 비어 있어요.`);
      }

      if (!page.image) {
        errors.push(`${page.label} 이미지가 없습니다.`);
      }

      if (page.imageStatus === "GENERATING") {
        errors.push(`${page.label} 이미지가 아직 다시 생성 중이에요.`);
      }
    });

    if (saveStatus === "saving") {
      errors.push("아직 자동 저장 중입니다. 잠시 후 다시 눌러 주세요.");
    }

    if (errors.length > 0) {
      setCompletionErrors(errors);
      return;
    }

    const payload = {
      ...previousData,
      pages,
      completedAt: new Date().toISOString(),
    };

    console.log("완성된 동화책:", payload);

    navigate("/fairy-tale/complete", {
      state: payload,
    });
  };

  const saveStatusText =
    saveStatus === "saving"
      ? "저장 중..."
      : saveStatus === "error"
      ? "저장 실패"
      : "자동 저장됨";

  const previewPage = pages[previewIndex] || pages[0];

  return {
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    viewMode,
    setViewMode,
    zoom,
    rightPanelMode,
    setRightPanelMode,
    saveStatus,
    savedAt,
    selectedSentence,
    setSelectedSentence,
    aiSuggestion,
    setAiSuggestion,
    directRequest,
    setDirectRequest,
    isPreviewOpen,
    setIsPreviewOpen,
    previewIndex,
    setPreviewIndex,
    completionErrors,
    setCompletionErrors,
    currentPage,
    currentIndex,
    currentPageSetting,
    handlePrevPage,
    handleNextPage,
    handleZoomOut,
    handleZoomIn,
    handleFitScreen,
    handleTextSelect,
    handleRewrite,
    handleDirectRequest,
    handleApplySuggestion,
    handleRegenerateCurrentImage,
    handleUploadCurrentImage,
    handleRestorePreviousImage,
    handleOpenPreview,
    handleComplete,
    saveStatusText,
    previewPage,
    updateCurrentPage,
    updateCurrentPageSettings,
  };
}
