import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  initialSettings,
  seedOptions,
  stepOptionMap,
  steps,
} from "../data/fairyTaleSettingWizardOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";

const getResult = (data) => data?.result ?? data?.data?.result ?? data;

const getChoiceQuestion = (data) => {
  const result = getResult(data);
  return (
    result?.question ||
    result?.nextQuestion ||
    result?.message ||
    result?.prompt ||
    ""
  );
};

const getChoiceOptions = (data) => {
  const result = getResult(data);
  const options =
    result?.options ||
    result?.selectedOptions ||
    result?.choices ||
    result?.recommendations ||
    [];

  if (Array.isArray(options)) return options;
  if (options && typeof options === "object") return Object.values(options);
  return [];
};

const normalizeChoiceOptions = (options, stepKey) =>
  options
    .map((option, index) => {
      const raw = option && typeof option === "object" ? option : { title: option };
      const title = raw.title || raw.label || raw.value || raw.text || "";

      if (!title) return null;

      return {
        ...raw,
        id: raw.id || `${stepKey}_${index}`,
        title,
        description: raw.description || raw.reason || raw.summary || "",
        icon: raw.icon || raw.emoji || "?",
      };
    })
    .filter(Boolean);

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

  const requestChoiceStep = async (nextStepIndex, nextPreviousAnswers) => {
    const fallbackStep = makeFallbackStep(steps[nextStepIndex], nextStepIndex);

    if (fallbackStep.key === "pageCount") {
      return fallbackStep;
    }

    const draftInput = {
      ...setupData,
      ...settings,
    };
    const draft = toBookDraft(draftInput);
    const extra = {
      purpose: "CREATE_FAIRY_TALE_CHOICE_STEP",
      currentStep: nextStepIndex + 1,
      previousAnswers: nextPreviousAnswers,
      currentPageNo: nextStepIndex + 1,
      fallbackQuestion: fallbackStep.question,
    };

    console.log("[CHOICE STEP REQUEST]", {
      currentStep: nextStepIndex + 1,
      previousAnswers: nextPreviousAnswers,
      draft,
    });

    const response = await normalizeSetting(draftInput, extra);

    console.log("[CHOICE STEP RESPONSE]", response);

    const aiQuestion = response.ok ? getChoiceQuestion(response.data) : "";
    const aiOptions = response.ok
      ? normalizeChoiceOptions(getChoiceOptions(response.data), fallbackStep.key)
      : [];

    if (!response.ok || !aiQuestion || aiOptions.length === 0) {
      console.warn("[CHOICE STEP FALLBACK]", response.message);
      return fallbackStep;
    }

    return {
      ...fallbackStep,
      question: aiQuestion,
      options: aiOptions,
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

      const nextIndex = currentStep + 1;
      const nextStep = await requestChoiceStep(nextIndex, nextPreviousAnswers);

      setAiSteps((prev) =>
        prev.map((step, index) => (index === nextIndex ? nextStep : step))
      );
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
  };
}
