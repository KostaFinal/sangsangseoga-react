import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createSettingOptions } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  initialSettings,
  seedOptions,
  stepOptionMap,
  steps,
} from "../data/fairyTaleSettingWizardOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";
import {
  getChoiceGuide,
  getChoiceOptions,
  getChoiceQuestion,
  isValidOptionsResponse,
  normalizeChoiceOptions,
} from "../utils/aiSettingOptions";

const makeFallbackStep = (step, index) => ({
  ...step,
  question:
    index === 0
      ? "어떤 동화를 만들고 싶나요?"
      : `${step.label}에 대해 정해볼까요?`,
  options: stepOptionMap[step.key] || [],
});

export function useFairyTaleSettingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSetup = location.state || {};
  const setupData = {
    ...initialSetup,
    bookType: "FAIRY_TALE",
  };
  const requestGuardRef = useRef(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState("MAGIC_OBJECT");
  const [customSeed, setCustomSeed] = useState("");
  const [settings, setSettings] = useState(initialSettings);
  const [aiSteps, setAiSteps] = useState(() =>
    steps.map((step, index) => makeFallbackStep(step, index))
  );
  const [previousAnswers, setPreviousAnswers] = useState([]);
  const [isLoadingChoiceStep, setIsLoadingChoiceStep] = useState(false);
  const [fallbackNoticeByStep, setFallbackNoticeByStep] = useState({});
  const [loadingHint, setLoadingHint] = useState("");
  const [recommendationVersion, setRecommendationVersion] = useState({});

  const currentStepInfo =
    aiSteps[currentStep] || makeFallbackStep(steps[currentStep], currentStep);
  const currentStepOptions = currentStepInfo.options || [];

  const completedCount = useMemo(() => {
    return Object.values(settings).filter((value) => String(value || "").trim() !== "")
      .length;
  }, [settings]);

  const progressPercent = (completedCount / steps.length) * 100;

  const handleSeedSelect = (option) => {
    setSelectedSeed(option.id);

    if (option.id !== "CUSTOM") {
      setSettings((prev) => ({
        ...prev,
        seed: option.title,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        seed: customSeed,
      }));
    }
  };

  const isCustomOption = (option) => {
    return option.id === "CUSTOM" || String(option.id).includes("CUSTOM");
  };

  const handleOptionSelect = (option) => {
    if (currentStepInfo.key === "seed") {
      handleSeedSelect(option);
      return;
    }

    if (isCustomOption(option)) {
      setSettings((prev) => ({
        ...prev,
        [currentStepInfo.key]: "",
      }));
      return;
    }

    setSettings((prev) => ({
      ...prev,
      [currentStepInfo.key]:
        currentStepInfo.key === "pageCount" ? option.value : option.title,
    }));
  };

  const handleCustomSeedChange = (e) => {
    const value = e.target.value;
    setCustomSeed(value);

    if (selectedSeed === "CUSTOM") {
      setSettings((prev) => ({
        ...prev,
        seed: value,
      }));
    }
  };

  const getCurrentAnswer = () => {
    if (currentStepInfo.key === "seed" && selectedSeed === "CUSTOM") {
      return customSeed.trim();
    }

    return String(settings[currentStepInfo.key] || "").trim();
  };

  const makeAnswerRecord = () => {
    const answer = getCurrentAnswer();
    const selectedOption = currentStepOptions.find(
      (option) =>
        String(option.value || option.title) === answer || option.id === selectedSeed
    );

    return {
      step: currentStep + 1,
      question: currentStepInfo.question || currentStepInfo.label,
      answer,
      option: selectedOption || null,
    };
  };

  const requestChoiceStep = async (nextStepIndex, nextPreviousAnswers, version = 0) => {
    const stepDef = steps[nextStepIndex];
    const fallbackStep = makeFallbackStep(stepDef, nextStepIndex);

    // pageCount는 정책상 항상 고정 선택지를 사용한다(AI 실패 fallback이 아니라 구조적 제약).
    if (fallbackStep.key === "pageCount") {
      return { step: fallbackStep, usedFallback: false };
    }

    const draftInput = {
      ...setupData,
      ...settings,
    };
    const extra = {
      purpose: "CREATE_FAIRY_TALE_CHOICE_STEP",
      currentStepKey: stepDef.key,
      currentStepLabel: stepDef.label,
      currentStepIndex: nextStepIndex,
      previousAnswers: nextPreviousAnswers,
      fallbackQuestion: fallbackStep.question,
      interactionMode: "MIXED",
      recommendationVersion: version,
    };

    console.log("[CHOICE STEP REQUEST]", { extra, draftInput });

    const response = await createSettingOptions(draftInput, extra);

    console.log("[CHOICE STEP RESPONSE]", response);

    if (!response.ok || !isValidOptionsResponse(response.data, fallbackStep.key)) {
      console.warn("AI 선택지 생성 실패. fallback 선택지를 사용합니다.", response.message);
      return { step: fallbackStep, usedFallback: true };
    }

    return {
      step: {
        ...fallbackStep,
        question: getChoiceQuestion(response.data) || fallbackStep.question,
        guide: getChoiceGuide(response.data) || fallbackStep.guide,
        options: normalizeChoiceOptions(getChoiceOptions(response.data), fallbackStep.key),
      },
      usedFallback: false,
    };
  };

  // 첫 단계(인덱스 0, seed)는 aiSteps 초기값이 fallback이라, 마운트 시 1회 AI를 호출해 채운다.
  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;

    (async () => {
      setIsLoadingChoiceStep(true);
      setLoadingHint("");

      const { step: firstStep, usedFallback } = await requestChoiceStep(0, [], 0);

      setAiSteps((prev) => prev.map((step, index) => (index === 0 ? firstStep : step)));
      setFallbackNoticeByStep((prev) => ({ ...prev, [firstStep.key]: usedFallback }));
      setIsLoadingChoiceStep(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canRecommendAgain = currentStepInfo.key !== "pageCount";

  const handleRecommendAgain = async () => {
    if (requestGuardRef.current || !canRecommendAgain) return;

    requestGuardRef.current = true;
    setIsLoadingChoiceStep(true);
    setLoadingHint("");

    const nextVersion = (recommendationVersion[currentStepInfo.key] || 0) + 1;
    const { step: newStep, usedFallback } = await requestChoiceStep(
      currentStep,
      previousAnswers,
      nextVersion
    );

    setAiSteps((prev) =>
      prev.map((step, index) => (index === currentStep ? newStep : step))
    );
    setFallbackNoticeByStep((prev) => ({ ...prev, [newStep.key]: usedFallback }));
    setRecommendationVersion((prev) => ({ ...prev, [currentStepInfo.key]: nextVersion }));

    // 새로 추천받았으니 이 단계에서 이전에 고르거나 입력한 값은 비운다.
    if (currentStepInfo.key === "seed") {
      setSelectedSeed("MAGIC_OBJECT");
      setCustomSeed("");
    }
    setSettings((prev) => ({ ...prev, [currentStepInfo.key]: "" }));

    setIsLoadingChoiceStep(false);
    requestGuardRef.current = false;
  };

  const handleNext = async () => {
    if (requestGuardRef.current) return;

    const currentAnswer = getCurrentAnswer();
    const nextPreviousAnswers = currentAnswer
      ? [
        ...previousAnswers.filter((answer) => answer.step !== currentStep + 1),
        makeAnswerRecord(),
      ]
      : previousAnswers;

    if (currentStep < steps.length - 1) {
      requestGuardRef.current = true;
      setIsLoadingChoiceStep(true);
      setLoadingHint("");

      const nextIndex = currentStep + 1;
      const { step: nextStep, usedFallback } = await requestChoiceStep(
        nextIndex,
        nextPreviousAnswers
      );

      setAiSteps((prev) =>
        prev.map((step, index) => (index === nextIndex ? nextStep : step))
      );
      setFallbackNoticeByStep((prev) => ({ ...prev, [nextStep.key]: usedFallback }));
      setPreviousAnswers(nextPreviousAnswers);
      setCurrentStep(nextIndex);
      setIsLoadingChoiceStep(false);
      requestGuardRef.current = false;
      return;
    }

    const finalData = normalizeFairyTaleDraftState(
      {
        ...setupData,
        ...settings,
        previousAnswers: nextPreviousAnswers,
      },
      {
        creationMode: "MIXED",
        interactionMode: "MIXED",
      }
    );

    console.log("동화 기본 설정:", finalData);
    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.STUDIO, {
      state: finalData,
    });
  };

  const isSeedStep = currentStepInfo.key === "seed";
  const isChoiceStep = currentStepOptions.length > 0;
  const showFallbackNotice = Boolean(fallbackNoticeByStep[currentStepInfo.key]);

  return {
    steps,
    seedOptions,
    currentStep,
    setCurrentStep,
    selectedSeed,
    customSeed,
    settings,
    setSettings,
    currentStepInfo,
    currentStepOptions,
    completedCount,
    progressPercent,
    handleSeedSelect,
    handleOptionSelect,
    handleCustomSeedChange,
    handleNext,
    handleRecommendAgain,
    canRecommendAgain,
    isSeedStep,
    isChoiceStep,
    isLoadingChoiceStep,
    showFallbackNotice,
    loadingHint,
  };
}
