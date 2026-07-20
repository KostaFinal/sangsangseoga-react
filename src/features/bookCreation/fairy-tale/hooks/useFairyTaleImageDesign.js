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
import { createImagePrompt } from "../../services/aiGenerateService";
import {
  requestGenerateImage,
  extractImageUrl,
  extractAiStatus,
  extractAiMessage,
  extractCoverPrompt,
  extractPagePrompts,
} from "../../services/imageGenerateService";

// 표지 생성 후 페이지들은 모두 표지 하나만 레퍼런스로 참고하고 서로 의존하지 않으므로 병렬로
// 처리해도 안전하다. 한 번에 너무 많이 보내면 Gemini rate limit(429)에 걸리기 쉬워서, 이 개수만큼
// 씩 묶어서(batch) 처리한다.
const PAGE_GENERATION_CONCURRENCY = 4;

export function useFairyTaleImageDesign() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationTimerRef = useRef(null);
  const trickleIntervalRef = useRef(null);
  const cancelledRef = useRef(false);

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
  const [generationError, setGenerationError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({}); // { [row.page]: imageUrl }

  const selectedStyleInfo =
    styles.find((style) => style.id === selectedStyle) || styles[2];

  const totalImageCount = pageCount + 1;
  const lockedSceneCount = pageRows.filter((row) => row.isLocked).length;

  useEffect(() => {
    // 개발 모드 StrictMode는 마운트 직후 "마운트→언마운트→재마운트"를 한 번 시뮬레이션하는데,
    // 이때 useRef 값은 초기화되지 않고 그대로 유지된다. 그래서 cleanup에서 true로 바뀐
    // cancelledRef가 재마운트 후에도 계속 true로 남아, 이후 모든 비동기 흐름이 즉시 중단되는
    // 버그가 있었다 — 마운트될 때마다 명시적으로 false로 되돌려서 방지한다.
    cancelledRef.current = false;

    return () => {
      cancelledRef.current = true;
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
      if (trickleIntervalRef.current) {
        clearInterval(trickleIntervalRef.current);
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

  // CREATE_IMAGE_PROMPT 응답(coverPrompt + pagePrompts)을 pageRows 순서에 맞춰
  // "표지 + 전체 페이지" 생성 대상 목록으로 변환한다. prompt가 없으면 나중에 스킵 처리한다.
  const buildGenerationTargets = (coverPrompt, pagePrompts) => {
    return pageRows.map((row) => {
      const isCover = row.page === "표지" || row.page === "cover";

      if (isCover) {
        return { id: row.page, imageType: "COVER", pageNo: null, prompt: coverPrompt || "" };
      }

      const pageNo = Number(String(row.page).replace("p", ""));
      const matched = pagePrompts.find((item) => Number(item.pageNo) === pageNo);

      return {
        id: row.page,
        imageType: "PAGE",
        pageNo,
        prompt: matched?.imagePrompt || "",
      };
    });
  };

  // 화면에서 "장면 수정"으로 고친(또는 buildRealPageRows가 실제 데이터로 채운) editText를
  // pageNo/표지 여부 기준으로 정리한다. 이게 없으면 이 화면에서 뭘 고치든 실제 이미지 생성
  // 프롬프트(Python CREATE_IMAGE_PROMPT)에는 전혀 반영되지 않는다.
  const buildUserSceneEdits = () =>
    pageRows
      .filter((row) => String(row.editText || "").trim())
      .map((row) => {
        const isCover = row.page === "표지" || row.page === "cover";
        return {
          isCover,
          pageNo: isCover ? null : Number(String(row.page).replace("p", "")),
          editText: row.editText.trim(),
        };
      });

  // createImagePrompt로 coverPrompt/pagePrompts를 받아오는 공통 단계.
  // 실패 시 generationError를 설정하고 null을 반환한다.
  const fetchImagePrompts = async () => {
    const promptState = {
      ...previousData,
      images: { ...(previousData.images || {}), style: selectedStyle },
    };

    const promptResponse = await createImagePrompt(promptState, {
      userSceneEdits: buildUserSceneEdits(),
    });

    if (cancelledRef.current) return null;

    if (!promptResponse.ok) {
      setGenerationError(promptResponse.message || "이미지 프롬프트 생성에 실패했습니다.");
      return null;
    }

    const status = extractAiStatus(promptResponse.data);
    const coverPrompt = extractCoverPrompt(promptResponse.data);
    const pagePrompts = extractPagePrompts(promptResponse.data);

    if (status !== "SUCCESS" || !coverPrompt) {
      setGenerationError(
        extractAiMessage(promptResponse.data) ||
          "이미지 프롬프트를 생성하지 못했습니다. 이전 단계 설정값을 확인해 주세요."
      );
      return null;
    }

    return { coverPrompt, pagePrompts };
  };

  // 대상 목록(표지 + 전체 페이지)을 처리한다. 표지는 이후 모든 페이지의 레퍼런스가 되므로 반드시
  // 먼저 단독으로 생성하고, 그 뒤 페이지들은 서로 독립적(모두 표지만 참고)이라
  // PAGE_GENERATION_CONCURRENCY개씩 묶어 병렬로 처리한다.
  // 호출 결과는 setGeneratedImages(화면 표시용)뿐 아니라 반환값(collectedImages)으로도
  // 넘겨서, 호출 직후 최신 상태를 곧바로 쓸 수 있게 한다(setState는 비동기라 같은 함수
  // 실행 안에서는 바로 최신값을 못 읽기 때문).
  const runSequentialGeneration = async (targets) => {
    setGenerationCards(targets.map((item) => ({ id: item.id, status: "WAITING" })));
    setGenerationProgress(0);
    setGeneratedImages({});

    const collectedImages = {};
    let completedCount = 0;
    let messageIndex = 0;

    // 실제 진행률과 별개로, 여러 장이 동시에 진행되는 동안 "뭔가 되고 있다"는 느낌을 주기 위해
    // 문구만 주기적으로 돌려 보여준다(개별 요청 완료 시점과는 무관하게 도는 별도 타이머).
    trickleIntervalRef.current = setInterval(() => {
      messageIndex += 1;
      setCurrentTeacherMessage(LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]);
    }, 2500);

    const generateOne = async (target) => {
      if (cancelledRef.current) return;

      if (!target.prompt) {
        setGenerationCards((prev) =>
          prev.map((item) => (item.id === target.id ? { ...item, status: "SKIPPED_NO_PROMPT" } : item))
        );
      } else {
        setGenerationCards((prev) =>
          prev.map((item) => (item.id === target.id ? { ...item, status: "GENERATING" } : item))
        );

        // style은 CREATE_IMAGE_PROMPT 단계에서 이미 prompt 문구에 반영되어 있으므로 여기서 다시 넘기지 않는다.
        // 표지는 항상 targets[0]이라 페이지 생성 시점엔 이미 collectedImages["표지"]가 채워져 있다.
        // 캐릭터 통일성을 위해 표지 이미지를 레퍼런스로 함께 보낸다(표지 자신은 레퍼런스 없이 생성).
        const imageResponse = await requestGenerateImage({
          promptText: target.prompt,
          imageType: target.imageType,
          pageNo: target.pageNo,
          aspectRatio: "3:4",
          bookType: "FAIRY_TALE",
          referenceImageUrl: target.imageType === "COVER" ? null : collectedImages["표지"] || null,
        });

        if (cancelledRef.current) return;

        const imageUrl = imageResponse.ok ? extractImageUrl(imageResponse.data) : null;

        if (imageUrl) {
          collectedImages[target.id] = imageUrl;
          setGeneratedImages((prev) => ({ ...prev, [target.id]: imageUrl }));
          setGenerationCards((prev) =>
            prev.map((item) => (item.id === target.id ? { ...item, status: "DONE" } : item))
          );
        } else {
          setGenerationError(
            (prev) => prev || `${target.id} 이미지 생성 실패: ${imageResponse.message || "이미지 URL을 받지 못했습니다."}`
          );
          setGenerationCards((prev) =>
            prev.map((item) => (item.id === target.id ? { ...item, status: "FAILED" } : item))
          );
        }
      }

      completedCount += 1;
      setGenerationProgress(Math.round((completedCount / targets.length) * 100));
    };

    try {
      const [coverTarget, ...pageTargets] = targets;

      if (coverTarget) {
        setCurrentGenerationLabel(coverTarget.id);
        await generateOne(coverTarget);
      }

      for (let i = 0; i < pageTargets.length && !cancelledRef.current; i += PAGE_GENERATION_CONCURRENCY) {
        const batch = pageTargets.slice(i, i + PAGE_GENERATION_CONCURRENCY);
        setCurrentGenerationLabel(batch.map((item) => item.id).join(", "));
        await Promise.all(batch.map((target) => generateOne(target)));
      }
    } finally {
      if (trickleIntervalRef.current) {
        clearInterval(trickleIntervalRef.current);
        trickleIntervalRef.current = null;
      }
    }

    return collectedImages;
  };

  const buildPayload = (imagesOverride = generatedImages) => ({
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
        image: imagesOverride[row.page] || row.image,
        sceneTitle: row.sceneTitle,
        editText: row.editText,
        isLocked: row.isLocked,
      };
    }),
  });

  // 실제 서비스 흐름: CREATE_IMAGE_PROMPT로 coverPrompt/pagePrompts를 받은 뒤, 표지+전체
  // 페이지를 1장씩 순차적으로 실제 Replicate 호출(runSequentialGeneration)로 생성하고,
  // 완료되면 생성된 이미지 URL과 함께 에디터로 이동한다.
  const startGenerationFlow = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setCurrentGenerationLabel(pageRows[0]?.page || "표지");
    setCurrentTeacherMessage("이미지 프롬프트를 준비하고 있어요.");

    const prompts = await fetchImagePrompts();

    if (cancelledRef.current) return;

    if (!prompts) {
      setIsGenerating(false);
      return;
    }

    const targets = buildGenerationTargets(prompts.coverPrompt, prompts.pagePrompts);
    const collectedImages = await runSequentialGeneration(targets);

    if (cancelledRef.current) return;

    // 순차 생성 도중 하나라도 실패(또는 프롬프트 없음으로 스킵)하면 collectedImages에 빠져 있다.
    // 이 경우 "완료" 처리하고 조용히 placeholder 이미지로 저장/이동하지 않고, 여기서 멈춰서
    // 사용자가 generationError 안내를 보고 "전체 이미지 생성"을 다시 눌러 재시도할 수 있게 한다.
    const hasFailedImage = Object.keys(collectedImages).length < targets.length;
    if (hasFailedImage) {
      setCurrentTeacherMessage("일부 이미지 생성에 실패했어요. 아래 안내를 확인하고 다시 시도해 주세요.");
      setIsGenerating(false);
      return;
    }

    setCurrentGenerationLabel("완료");
    setCurrentTeacherMessage("삽화 생성이 완료되었어요. 이제 에디터로 이동할게요.");

    const payload = buildPayload(collectedImages);

    navigationTimerRef.current = setTimeout(() => {
      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.EDITOR, {
        state: {
          ...payload,
          coverPrompt: prompts.coverPrompt,
          pagePrompts: prompts.pagePrompts,
        },
      });
    }, 1200);
  };

  const handleGenerateImages = () => {
    const hasEditingRow = pageRows.some((row) => row.isEditing);

    if (hasEditingRow) {
      alert("수정 중인 장면이 있어요. 완료 버튼을 먼저 눌러 주세요.");
      return;
    }

    startGenerationFlow();
  };

  const getCardStatusText = (status) => {
    if (status === "DONE") return "완료";
    if (status === "GENERATING") return "생성 중";
    if (status === "FAILED") return "실패";
    if (status === "SKIPPED_NO_PROMPT") return "프롬프트 없음";
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
    generationError,
    generatedImages,
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
