import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  EMPTY_SETTINGS,
  REQUIRED_FIELDS,
  STEPS,
  SUMMARY_ITEMS,
} from "../data/fairyTaleFreeSettingOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";

export function useFairyTaleFreeSetting() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {};

  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [records, setRecords] = useState([
    {
      type: "AI",
      title: "인터뷰 시작",
      text: "동화를 쓰기 전에 필요한 기본설정을 하나씩 정리할게요.",
    },
  ]);

  const currentStep = STEPS[currentStepIndex];

  const completedRequiredCount = useMemo(() => {
    return REQUIRED_FIELDS.filter((key) => String(settings[key]).trim()).length;
  }, [settings]);

  const progress = Math.round(
    (completedRequiredCount / REQUIRED_FIELDS.length) * 100
  );

  const isRequiredComplete = completedRequiredCount === REQUIRED_FIELDS.length;
  const isOptionalStep = Boolean(currentStep.optional);
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progressDegree = progress * 3.6;

  const getDisplayValue = (key, value) => {
    if (!value) return "아직 정하지 않음";

    if (key === "pageCount") {
      return `${value}페이지`;
    }

    return value;
  };

  const getStatusIcon = (key) => {
    if (String(settings[key]).trim()) return "✓";
    return REQUIRED_FIELDS.includes(key) ? "!" : "·";
  };

  const goNextStep = () => {
    const nextIndex = currentStepIndex + 1;

    if (nextIndex < STEPS.length) {
      setCurrentStepIndex(nextIndex);
    }
  };

  const addRecord = ({ type, title, text }) => {
    setRecords((prev) => [
      ...prev,
      {
        type,
        title,
        text,
      },
    ]);
  };

  const saveCurrentAnswer = (value) => {
    const trimmedValue = String(value).trim();
    if (!trimmedValue) return;

    const key = currentStep.key;

    setSettings((prev) => ({
      ...prev,
      [key]: trimmedValue,
    }));

    addRecord({
      type: "SET",
      title: `${currentStep.title} 설정`,
      text: `${currentStep.title}을(를) "${getDisplayValue(
        key,
        trimmedValue
      )}"로 정리했어요.`,
    });

    setAnswer("");
    goNextStep();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveCurrentAnswer(answer);
  };

  const handleExampleClick = (example) => {
    setAnswer(example);
  };

  const handleExampleApply = (example) => {
    saveCurrentAnswer(example);
  };

  const handleSkip = () => {
    if (!currentStep.optional) return;

    addRecord({
      type: "SKIP",
      title: `${currentStep.title} 건너뜀`,
      text: `${currentStep.title}은(는) 선택하지 않고 넘어갔어요.`,
    });

    setAnswer("");
    goNextStep();
  };

  const handleEdit = (key) => {
    const targetIndex = STEPS.findIndex((step) => step.key === key);
    if (targetIndex === -1) return;

    setCurrentStepIndex(targetIndex);
    setAnswer(settings[key] || "");

    addRecord({
      type: "AI",
      title: `${STEPS[targetIndex].title} 수정`,
      text: `${STEPS[targetIndex].title}을(를) 다시 수정할 수 있어요.`,
    });
  };

  const handleStartStudio = () => {
    if (!isRequiredComplete) return;

    const finalData = normalizeFairyTaleDraftState(
      {
        ...setupData,
        ...settings,
      },
      {
        creationMode: "FREE",
        interactionMode: "FREE",
      }
    );

    console.log("자유형 기본설정 완료 데이터:", finalData);

    normalizeSetting(finalData, {
      source: "fairyTaleFreeSetting",
    });

    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.CHAT, {
      state: finalData,
    });
  };

  return {
    REQUIRED_FIELDS,
    STEPS,
    SUMMARY_ITEMS,
    settings,
    currentStepIndex,
    answer,
    setAnswer,
    records,
    currentStep,
    completedRequiredCount,
    progress,
    isRequiredComplete,
    isOptionalStep,
    isLastStep,
    progressDegree,
    getDisplayValue,
    getStatusIcon,
    handleSubmit,
    handleExampleClick,
    handleExampleApply,
    handleSkip,
    handleEdit,
    handleStartStudio,
    navigate,
  };
}
