import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  buildRealPageRows,
  createPagePlans,
  LOADING_MESSAGES,
  styles,
  uploadedImages,
} from "../data/fairyTaleImageDesignOptions";

export function useFairyTaleImageDesign() {
  const navigate = useNavigate();
  const location = useLocation();

  const generationTimerRef = useRef(null);
  const navigationTimerRef = useRef(null);

  const previousData = location.state || {};

  const pageCount =
    Number(previousData?.fairyTaleSetting?.pageCount) ||
    Number(previousData?.pageCount) ||
    12;

  const [selectedStyle, setSelectedStyle] = useState("CUTE_3D");
  const [pageRows, setPageRows] = useState(
    () => buildRealPageRows(previousData, pageCount) || createPagePlans(pageCount)
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationCards, setGenerationCards] = useState([]);
  const [currentGenerationLabel, setCurrentGenerationLabel] = useState("표지");
  const [currentTeacherMessage, setCurrentTeacherMessage] = useState(
    "삽화 생성을 준비하고 있어요."
  );

  const selectedStyleInfo =
    styles.find((style) => style.id === selectedStyle) || styles[2];

  const totalImageCount = pageCount + 1;
  const lockedSceneCount = pageRows.filter((row) => row.isLocked).length;

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
      }
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const handleSceneTextChange = (index, value) => {
    setPageRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (row.isLocked) return row;

        return {
          ...row,
          editText: value,
        };
      })
    );
  };

  const handleStartSceneEdit = (index) => {
    setPageRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (row.isLocked) return row;

        return {
          ...row,
          isEditing: true,
        };
      })
    );
  };

  const handleConfirmSceneEdit = (index) => {
    setPageRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const trimmedText = row.editText.trim();

        if (!trimmedText) {
          alert("장면 수정 내용을 입력해 주세요.");
          return row;
        }

        return {
          ...row,
          editText: trimmedText,
          isEditing: false,
          isLocked: true,
        };
      })
    );
  };

  const handleSceneEditButtonClick = (index) => {
    const targetRow = pageRows[index];

    if (!targetRow) return;
    if (targetRow.isLocked) return;

    if (targetRow.isEditing) {
      handleConfirmSceneEdit(index);
      return;
    }

    handleStartSceneEdit(index);
  };

  const startGenerationFlow = (payload) => {
    const items = pageRows.map((row) => ({
      id: row.page,
      status: "WAITING",
    }));

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentGenerationLabel(items[0]?.id || "표지");
    setCurrentTeacherMessage(LOADING_MESSAGES[0]);
    setGenerationCards(
      items.map((item, index) => ({
        ...item,
        status: index === 0 ? "GENERATING" : "WAITING",
      }))
    );

    const runStep = (stepIndex) => {
      if (stepIndex >= items.length) {
        setGenerationCards((prev) =>
          prev.map((item) => ({
            ...item,
            status: "DONE",
          }))
        );
        setGenerationProgress(100);
        setCurrentGenerationLabel("완료");
        setCurrentTeacherMessage(
          "삽화 생성이 완료되었어요. 이제 에디터로 이동할게요."
        );

        navigationTimerRef.current = setTimeout(() => {
          navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.EDITOR, {
            state: payload,
          });
        }, 1200);

        return;
      }

      const currentItem = items[stepIndex];

      setCurrentGenerationLabel(currentItem.id);
      setCurrentTeacherMessage(
        LOADING_MESSAGES[stepIndex % LOADING_MESSAGES.length]
      );

      setGenerationCards((prev) =>
        prev.map((item, index) => ({
          ...item,
          status:
            index < stepIndex
              ? "DONE"
              : index === stepIndex
              ? "GENERATING"
              : "WAITING",
        }))
      );

      setGenerationProgress(
        Math.min(95, Math.round((stepIndex / items.length) * 100) + 5)
      );

      generationTimerRef.current = setTimeout(() => {
        setGenerationCards((prev) =>
          prev.map((item, index) => ({
            ...item,
            status: index <= stepIndex ? "DONE" : "WAITING",
          }))
        );

        setGenerationProgress(
          Math.round(((stepIndex + 1) / items.length) * 100)
        );

        generationTimerRef.current = setTimeout(() => {
          runStep(stepIndex + 1);
        }, 220);
      }, 900);
    };

    runStep(0);
  };

  const handleGenerateImages = () => {
    const hasEditingRow = pageRows.some((row) => row.isEditing);

    if (hasEditingRow) {
      alert("수정 중인 장면이 있어요. 완료 버튼을 먼저 눌러 주세요.");
      return;
    }

    const payload = {
      ...previousData,
      imageStyle: selectedStyle,
      imageStyleLabel: selectedStyleInfo.label,
      pageCount,
      totalImageCount,
      pageImages: pageRows.map((row) => {
        const isCover = row.page === "표지" || row.page === "cover";
        const matchedPageNo = String(row.page || "").match(/\d+/);

        return {
          imageType: isCover ? "COVER" : "PAGE",
          pageNo: isCover ? null : matchedPageNo ? Number(matchedPageNo[0]) : null,
          imageStyle: selectedStyle,
          page: row.page,
          color: row.color,
          image: row.image,
          sceneTitle: row.sceneTitle,
          editText: row.editText,
          isLocked: row.isLocked,
        };
      }),
    };

    console.log("이미지 생성 요청 데이터:", payload);
    startGenerationFlow(payload);
  };

  const getCardStatusText = (status) => {
    if (status === "DONE") return "완료";
    if (status === "GENERATING") return "생성 중";
    return "대기";
  };

  return {
    uploadedImages,
    styles,
    selectedStyle,
    setSelectedStyle,
    pageRows,
    isGenerating,
    generationProgress,
    generationCards,
    currentGenerationLabel,
    currentTeacherMessage,
    selectedStyleInfo,
    pageCount,
    totalImageCount,
    lockedSceneCount,
    handleSceneTextChange,
    handleSceneEditButtonClick,
    handleGenerateImages,
    getCardStatusText,
  };
}
