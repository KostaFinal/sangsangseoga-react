import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createSettingOptions, requestAiGenerateStream } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  initialSettings,
  seedOptions,
  stepOptionMap,
  steps,
} from "../data/fairyTaleSettingWizardOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";
import {
  extractPartialQuestion,
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

    // 스트리밍은 로딩 텍스트 갱신용 보조 수단일 뿐, 정답 소스는 아래의 non-stream 호출이다.
    let streamedText = "";
    requestAiGenerateStream({
      taskType: "CREATE_SETTING_OPTIONS",
      draft: toBookDraft(draftInput),
      extra,
      onDelta: (text) => {
        streamedText += text;
        const partial = extractPartialQuestion(streamedText);
        if (partial) setLoadingHint(partial);
      },
    });

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
    isSeedStep,
    isChoiceStep,
    isLoadingChoiceStep,
    showFallbackNotice,
    loadingHint,
  };
}
