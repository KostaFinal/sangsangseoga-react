import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createSettingOptions,
  normalizeSetting,
  requestAiGenerateStream,
} from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  optionSets,
  stepList,
} from "../data/fairyTaleChoiceBuilderOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";
import {
  extractPartialQuestion,
  getChoiceGuide,
  getChoiceOptions,
  getChoiceQuestion,
  getTaskResult,
  isValidOptionsResponse,
  normalizeChoiceOptions,
} from "../utils/aiSettingOptions";

// pageCount는 정책상 항상 고정 선택지를 사용한다(AI 실패 fallback이 아니라 구조적 제약).
const AI_SKIPPED_STEP_KEYS = new Set(["pageCount"]);

const makeFallbackStep = (step) => ({
  ...step,
  options: (optionSets[step.key] && optionSets[step.key][0]) || [],
});

export function useFairyTaleChoiceBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousData = location.state || {};
  const requestGuardRef = useRef(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [aiSteps, setAiSteps] = useState(() => stepList.map((step) => makeFallbackStep(step)));
  const [recommendationVersion, setRecommendationVersion] = useState({});
  const [previousAnswers, setPreviousAnswers] = useState([]);
  const [fallbackNoticeByStep, setFallbackNoticeByStep] = useState({});
  const [isLoadingChoiceStep, setIsLoadingChoiceStep] = useState(false);
  const [loadingHint, setLoadingHint] = useState("");

  const currentStep =
    aiSteps[currentStepIndex] || makeFallbackStep(stepList[currentStepIndex]);
  const isLastStep = currentStepIndex === stepList.length - 1;
  const currentOptions = currentStep.options || [];
  const canRecommendAgain = !AI_SKIPPED_STEP_KEYS.has(currentStep.key);
  const showFallbackNotice = Boolean(fallbackNoticeByStep[currentStep.key]);

  const selectedOption = selectedOptions[currentStep.key];

  const progressPercent = Math.round(
    ((currentStepIndex + 1) / stepList.length) * 100
  );

  const getSummaryValue = (key) => {
    const selected = selectedOptions[key];

    if (!selected) return "미정";

    if (key === "protagonist") {
      return `${selected.value.protagonistName} · ${selected.value.protagonistDesc}`;
    }

    if (key === "pageCount") {
      return `${selected.value}페이지`;
    }

    return selected.value;
  };

  const handleSelectOption = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentStep.key]: option,
    }));
  };

  const buildDraftInputFromSelections = (selections) => {
    const protagonistValue = selections.protagonist?.value || {};

    return {
      ...previousData,
      bookType: "FAIRY_TALE",
      interactionMode: "CHOICE",
      writerLevel: previousData.writerLevel || "LOWER_ELEMENTARY",
      storySeed: selections.storySeed?.value || "",
      protagonistName: protagonistValue.protagonistName || "",
      protagonistDesc: protagonistValue.protagonistDesc || "",
      backgroundPlace: selections.backgroundPlace?.value || "",
      problem: selections.problem?.value || "",
      mood: selections.mood?.value || "",
      pageCount: selections.pageCount?.value || 12,
    };
  };

  const makeAnswerRecord = (step, option) => ({
    stepKey: step.key,
    label: step.label,
    answer:
      option.value && typeof option.value === "object"
        ? option.value.protagonistName || option.title
        : option.value,
  });

  // 새 단계 진입("다음 단계")과 재추천("다시 추천")이 공유하는 요청 함수.
  // version=0이면 최초 추천, version>0이면 다른 방향의 재추천을 요청한다.
  const requestStepOptions = async (stepIndex, version, answersSoFar, selectionsSoFar) => {
    const stepDef = stepList[stepIndex];
    const fallbackStep = makeFallbackStep(stepDef);

    if (AI_SKIPPED_STEP_KEYS.has(stepDef.key)) {
      return { step: fallbackStep, usedFallback: false };
    }

    const draftInput = buildDraftInputFromSelections(selectionsSoFar);
    const extra = {
      purpose: "CREATE_FAIRY_TALE_CHOICE_STEP",
      currentStepKey: stepDef.key,
      currentStepLabel: stepDef.label,
      currentStepIndex: stepIndex,
      previousAnswers: answersSoFar,
      fallbackQuestion: stepDef.question,
      interactionMode: "CHOICE",
      recommendationVersion: version,
    };

    // 스트리밍은 로딩 텍스트 갱신용 보조 수단일 뿐, 정답 소스는 아래의 non-stream 호출이다.
    // 실패해도(onError) non-stream 호출에는 영향을 주지 않는다.
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

    if (!response.ok || !isValidOptionsResponse(response.data, stepDef.key)) {
      console.warn("AI 선택지 생성 실패. fallback 선택지를 사용합니다.", response.message);
      return { step: fallbackStep, usedFallback: true };
    }

    return {
      step: {
        ...fallbackStep,
        question: getChoiceQuestion(response.data) || fallbackStep.question,
        guide: getChoiceGuide(response.data) || fallbackStep.guide,
        options: normalizeChoiceOptions(getChoiceOptions(response.data), stepDef.key),
      },
      usedFallback: false,
    };
  };

  const handleRecommendAgain = async () => {
    if (requestGuardRef.current || !canRecommendAgain) return;

    requestGuardRef.current = true;
    setIsLoadingChoiceStep(true);
    setLoadingHint("");

    const nextVersion = (recommendationVersion[currentStep.key] || 0) + 1;
    const { step: newStep, usedFallback } = await requestStepOptions(
      currentStepIndex,
      nextVersion,
      previousAnswers,
      selectedOptions
    );

    setAiSteps((prev) =>
      prev.map((step, index) => (index === currentStepIndex ? newStep : step))
    );
    setFallbackNoticeByStep((prev) => ({ ...prev, [currentStep.key]: usedFallback }));
    setRecommendationVersion((prev) => ({ ...prev, [currentStep.key]: nextVersion }));
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentStep.key];
      return next;
    });

    setIsLoadingChoiceStep(false);
    requestGuardRef.current = false;
  };

  const handlePrevStep = () => {
    if (currentStepIndex === 0) {
      navigate(-1);
      return;
    }

    setCurrentStepIndex((prev) => prev - 1);
  };

  const makeFinalData = () => {
    const protagonistValue = selectedOptions.protagonist?.value || {};

    const storySeed = selectedOptions.storySeed?.value || "";
    const mood = selectedOptions.mood?.value || "";
    const backgroundPlace = selectedOptions.backgroundPlace?.value || "";
    const problem = selectedOptions.problem?.value || "";
    const pageCount = selectedOptions.pageCount?.value || 12;

    return {
      ...previousData,
      bookType: "FAIRY_TALE",
      interactionMode: "CHOICE",
      writerLevel: previousData.writerLevel || "LOWER_ELEMENTARY",
      storySeed,
      protagonistName: protagonistValue.protagonistName || "",
      protagonistDesc: protagonistValue.protagonistDesc || "",
      backgroundPlace,
      problem,
      mood,
      importantObject: "",
      lesson: "용기와 협력의 소중함",
      pageCount,
      title: storySeed.includes("별빛")
        ? "별빛을 찾아 떠난 루미"
        : `${protagonistValue.protagonistName || "주인공"}의 작은 모험`,
      selectedChoiceOptions: selectedOptions,
    };
  };

  const handleNextStep = async () => {
    if (!selectedOption) {
      alert("선택지를 하나 골라주세요.");
      return;
    }

    if (requestGuardRef.current) return;

    if (isLastStep) {
      requestGuardRef.current = true;

      const finalData = normalizeFairyTaleDraftState(makeFinalData(), {
        creationMode: "CHOICE",
        interactionMode: "CHOICE",
      });

      const normResponse = await normalizeSetting(finalData, {
        source: "fairyTaleChoiceBuilder",
      });
      const normalizedSetting = normResponse.ok
        ? getTaskResult(normResponse.data)?.setting
        : null;

      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.CONFIRM, {
        state:
          normalizedSetting && typeof normalizedSetting === "object"
            ? { ...finalData, ...normalizedSetting }
            : finalData,
      });

      requestGuardRef.current = false;
      return;
    }

    requestGuardRef.current = true;
    setIsLoadingChoiceStep(true);
    setLoadingHint("");

    const nextIndex = currentStepIndex + 1;
    const updatedAnswers = [
      ...previousAnswers.filter((answer) => answer.stepKey !== currentStep.key),
      makeAnswerRecord(currentStep, selectedOption),
    ];

    const { step: nextStep, usedFallback } = await requestStepOptions(
      nextIndex,
      0,
      updatedAnswers,
      selectedOptions
    );

    setAiSteps((prev) =>
      prev.map((step, index) => (index === nextIndex ? nextStep : step))
    );
    setFallbackNoticeByStep((prev) => ({ ...prev, [stepList[nextIndex].key]: usedFallback }));
    setPreviousAnswers(updatedAnswers);
    setCurrentStepIndex(nextIndex);
    setIsLoadingChoiceStep(false);
    requestGuardRef.current = false;
  };

  return {
    optionSets,
    previousData,
    currentStepIndex,
    setCurrentStepIndex,
    selectedOptions,
    currentStep,
    isLastStep,
    currentOptions,
    selectedOption,
    progressPercent,
    getSummaryValue,
    handleSelectOption,
    handleRecommendAgain,
    handlePrevStep,
    handleNextStep,
    canRecommendAgain,
    isLoadingChoiceStep,
    showFallbackNotice,
    loadingHint,
  };
}
