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

// 실제 진행률을 알 수 없는 단일 요청-응답이라, 가만히 멈춰 있는 것보다 "뭔가 되고 있다"는
// 느낌을 주기 위해 몇 초 간격으로 문구만 돌려 보여준다(loadingHint).
const LOADING_HINT_MESSAGES = [
  "당신에게 어울리는 선택지를 고르고 있어요...",
  "잘 맞는 선택지를 찾고 있어요...",
  "거의 다 됐어요...",
];

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
  // "다음 질문"으로 다음 단계에 처음 들어와서 그 단계의 AI 선택지를 처음 기다리는 중인지.
  // "다시 추천"(같은 단계 재요청)일 때는 true가 되지 않는다 - 그땐 기존 선택지를 그대로 보여주다가
  // 갱신하는 게 자연스럽지만, 다음 단계로 넘어갈 땐 아직 아무 선택지도 없으니 스켈레톤을 보여준다.
  const [isAdvancingToNextStep, setIsAdvancingToNextStep] = useState(false);
  const [fallbackNoticeByStep, setFallbackNoticeByStep] = useState({});
  const [loadingHint, setLoadingHint] = useState("");
  const [recommendationVersion, setRecommendationVersion] = useState({});

  useEffect(() => {
    if (!isLoadingChoiceStep) {
      setLoadingHint("");
      return;
    }

    let index = 0;
    setLoadingHint(LOADING_HINT_MESSAGES[0]);

    const timer = setInterval(() => {
      index = (index + 1) % LOADING_HINT_MESSAGES.length;
      setLoadingHint(LOADING_HINT_MESSAGES[index]);
    }, 2200);

    return () => clearInterval(timer);
  }, [isLoadingChoiceStep]);

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

      const nextIndex = currentStep + 1;

      // 응답을 기다렸다가 한 번에 다음 단계로 넘기지 않는다 - 버튼을 누른 즉시 단계 번호/질문을
      // 먼저 넘겨서 "눌렀는데 멈춰있다"는 느낌을 없앤다. 선택지는 아직 없으니 isAdvancingToNextStep을
      // 보고 화면에서 스켈레톤으로 채워 보여준다(FairyTaleSettingWizardPage 참고).
      setPreviousAnswers(nextPreviousAnswers);
      setCurrentStep(nextIndex);
      setIsAdvancingToNextStep(true);
      setIsLoadingChoiceStep(true);

      const { step: nextStep, usedFallback } = await requestChoiceStep(
        nextIndex,
        nextPreviousAnswers
      );

      setAiSteps((prev) =>
        prev.map((step, index) => (index === nextIndex ? nextStep : step))
      );
      setFallbackNoticeByStep((prev) => ({ ...prev, [nextStep.key]: usedFallback }));
      setIsAdvancingToNextStep(false);
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
    isAdvancingToNextStep,
    showFallbackNotice,
    loadingHint,
  };
}
