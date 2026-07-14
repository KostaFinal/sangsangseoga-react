import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createSettingOptions, normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  defaultMinutes,
  directingSteps,
  initialDirecting,
} from "../data/novelSettingConfirmOptions";
import {
  getChoiceOptions,
  isValidNovelOptionsResponse,
  normalizeChoiceOptions,
} from "../../fairy-tale/utils/aiSettingOptions";

// 한글 단어 마지막 글자에 받침이 있으면 "은", 없으면 "는"을 반환한다.
// (예: "분위기"→는, "문체"→는, "시점"→은, "분량"→은 — 받침 유무로 결정되고 고정값이 아니다)
const getTopicParticle = (word) => {
  const lastChar = String(word || "").trim().slice(-1);
  const code = lastChar.charCodeAt(0);
  const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3;
  const hasBatchim = isHangulSyllable && (code - 0xac00) % 28 !== 0;

  return hasBatchim ? "은" : "는";
};

// AI 옵션 응답(title/desc/value)을 이 화면의 옵션 버튼이 쓰는 순수 문자열 배열로 맞춘다.
const toOptionTexts = (options) =>
  options
    .map((option) =>
      typeof option.value === "string" && option.value.trim()
        ? option.value
        : option.desc || option.title
    )
    .filter(Boolean);

export function useNovelSettingConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {};
  const minutes = setupData.minutes || defaultMinutes;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [directing, setDirecting] = useState(initialDirecting);
  const [customInput, setCustomInput] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "기본 설정은 잘 정리되었어요. 이제 소설의 분위기, 문체, 시점 같은 세부 연출을 정해볼게요.",
    },
    {
      id: 2,
      type: "ai",
      text: "이 소설은 어떤 분위기로 진행하면 좋을까요?",
    },
  ]);

  const [optionsByKey, setOptionsByKey] = useState({});
  const [recommendationVersionByKey, setRecommendationVersionByKey] = useState({});
  const [fallbackNoticeByKey, setFallbackNoticeByKey] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const fetchedKeysRef = useRef(new Set());
  const requestGuardRef = useRef(false);
  const initialFetchRef = useRef(false);

  const currentStep = directingSteps[currentStepIndex];

  // 화면에 보여줄 선택지: AI가 이미 채워준 게 있으면 그걸, 아니면(로딩 전/실패 시) 정적 기본값을 쓴다.
  const currentOptions =
    (currentStep && optionsByKey[currentStep.key]) || currentStep?.options || [];
  const showFallbackNotice = Boolean(currentStep && fallbackNoticeByKey[currentStep.key]);

  const completedCount = useMemo(() => {
    return directingSteps.filter((step) => directing[step.key] !== "미정")
      .length;
  }, [directing]);

  const isAllComplete = completedCount === directingSteps.length;

  const getStepStatus = (index, key) => {
    if (directing[key] !== "미정") return "completed";
    if (index === currentStepIndex) return "active";
    return "pending";
  };

  const addChat = (newMessages) => {
    setMessages((prev) => [
      ...prev,
      ...newMessages.map((message, index) => ({
        id: prev.length + index + 1,
        ...message,
      })),
    ]);
  };

  const buildDraftInput = (fromDirecting) => ({
    ...setupData,
    bookType: "NOVEL",
    interactionMode: setupData.interactionMode || "MIXED",
    writerLevel: setupData.writerLevel || "TEEN",
    storySeed: minutes.storySeed || "",
    genre: minutes.genre || "",
    protagonist: minutes.protagonist || "",
    background: minutes.background || "",
    conflict: minutes.conflict || "",
    ending: minutes.ending || "",
    mood: fromDirecting.mood !== "미정" ? fromDirecting.mood : "",
    style: fromDirecting.style !== "미정" ? fromDirecting.style : "",
    pointOfView: fromDirecting.pointOfView !== "미정" ? fromDirecting.pointOfView : "",
    volume: fromDirecting.volume !== "미정" ? fromDirecting.volume : "",
    pace: fromDirecting.pace !== "미정" ? fromDirecting.pace : "",
    avoid: fromDirecting.avoid !== "미정" ? fromDirecting.avoid : "",
  });

  const buildPreviousAnswers = (fromDirecting) =>
    directingSteps
      .filter((step) => fromDirecting[step.key] !== "미정")
      .map((step) => ({
        stepKey: step.key,
        label: step.label,
        answer: fromDirecting[step.key],
      }));

  // 새 단계 진입("다음 단계")과 재추천("다시 추천")이 공유하는 요청 함수.
  const requestStepOptions = async (key, version) => {
    const step = directingSteps.find((item) => item.key === key);
    const draftInput = buildDraftInput(directing);
    const extra = {
      purpose: "CREATE_NOVEL_DIRECTING_STEP",
      currentStepKey: key,
      currentStepLabel: step?.label,
      previousAnswers: buildPreviousAnswers(directing),
      interactionMode: setupData.interactionMode || "MIXED",
      recommendationVersion: version,
    };

    const response = await createSettingOptions(draftInput, extra);

    if (!response.ok || !isValidNovelOptionsResponse(response.data, key)) {
      console.warn("AI 연출 선택지 생성 실패. 기본 선택지를 사용합니다.", response.message);
      return { options: null, usedFallback: true };
    }

    const options = toOptionTexts(normalizeChoiceOptions(getChoiceOptions(response.data), key));

    return {
      options: options.length ? options : null,
      usedFallback: options.length === 0,
    };
  };

  const ensureStepOptions = async (key) => {
    if (fetchedKeysRef.current.has(key)) return;
    fetchedKeysRef.current.add(key);

    setIsLoadingOptions(true);

    const { options, usedFallback } = await requestStepOptions(key, 0);

    if (options) {
      setOptionsByKey((prev) => ({ ...prev, [key]: options }));
    }
    setFallbackNoticeByKey((prev) => ({ ...prev, [key]: usedFallback }));
    setIsLoadingOptions(false);
  };

  // 마운트 시 1회: 첫 연출 단계(mood)의 선택지를 AI로 받아온다.
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    ensureStepOptions(directingSteps[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecommendAgain = async () => {
    if (requestGuardRef.current || !currentStep) return;

    requestGuardRef.current = true;
    setIsLoadingOptions(true);

    const key = currentStep.key;
    const nextVersion = (recommendationVersionByKey[key] || 0) + 1;
    const { options, usedFallback } = await requestStepOptions(key, nextVersion);

    if (options) {
      setOptionsByKey((prev) => ({ ...prev, [key]: options }));
    }
    setFallbackNoticeByKey((prev) => ({ ...prev, [key]: usedFallback }));
    setRecommendationVersionByKey((prev) => ({ ...prev, [key]: nextVersion }));

    setIsLoadingOptions(false);
    requestGuardRef.current = false;
  };

  const moveToNextStep = (nextDirecting) => {
    const nextIndex = currentStepIndex + 1;
    const nextStep = directingSteps[nextIndex];

    if (nextStep) {
      setCurrentStepIndex(nextIndex);
      ensureStepOptions(nextStep.key);

      addChat([
        {
          type: "ai",
          text: `좋아요. "${currentStep.label}"${getTopicParticle(currentStep.label)} "${
            nextDirecting[currentStep.key]
          }" 방향으로 정리할게요.`,
        },
        {
          type: "ai",
          text: nextStep.question,
        },
      ]);
    } else {
      addChat([
        {
          type: "ai",
          text: `좋아요. "${currentStep.label}"까지 모두 정리되었어요.`,
        },
        {
          type: "ai",
          text: "이제 왼쪽 연출 회의 현황을 확인한 뒤, 설정을 확정하고 에디터로 이동할 수 있어요.",
        },
      ]);
    }
  };

  const handleSelectOption = (option) => {
    const nextDirecting = {
      ...directing,
      [currentStep.key]: option,
    };

    setDirecting(nextDirecting);

    addChat([
      {
        type: "user",
        text: option,
      },
    ]);

    moveToNextStep(nextDirecting);
  };

  const handleSendCustom = () => {
    const value = customInput.trim();

    if (!value) {
      alert("직접 입력할 내용을 적어주세요.");
      return;
    }

    const nextDirecting = {
      ...directing,
      [currentStep.key]: value,
    };

    setDirecting(nextDirecting);
    setCustomInput("");

    addChat([
      {
        type: "user",
        text: value,
      },
    ]);

    moveToNextStep(nextDirecting);
  };

  const handleAiRecommend = () => {
    if (!currentStep) return;

    const recommended = currentOptions[0];
    if (recommended) setCustomInput(recommended);
  };

  const handleStartEditor = () => {
    if (!isAllComplete) {
      alert("AI 연출 회의를 모두 완료한 뒤 에디터로 이동할 수 있어요.");
      return;
    }

    const payload = {
      ...setupData,
      ...minutes,
      minutes,
      directing,
    };

    console.log("소설 집필 에디터 이동 데이터:", payload);

    normalizeSetting(payload, {
      source: "novelSettingConfirm",
    });

    navigate(BOOK_CREATION_ROUTES.NOVEL.EDITOR, {
      state: payload,
    });
  };

  return {
    minutes,
    directingSteps,
    directing,
    customInput,
    setCustomInput,
    messages,
    currentStepIndex,
    currentStep,
    currentOptions,
    completedCount,
    isAllComplete,
    isLoadingOptions,
    showFallbackNotice,
    getStepStatus,
    handleSelectOption,
    handleSendCustom,
    handleAiRecommend,
    handleRecommendAgain,
    handleStartEditor,
  };
}
