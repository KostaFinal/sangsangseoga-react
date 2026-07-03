import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  defaultMinutes,
  directingSteps,
  initialDirecting,
} from "../data/novelSettingConfirmOptions";

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

  const currentStep = directingSteps[currentStepIndex];

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

  const moveToNextStep = (nextDirecting) => {
    const nextIndex = currentStepIndex + 1;
    const nextStep = directingSteps[nextIndex];

    if (nextStep) {
      setCurrentStepIndex(nextIndex);

      addChat([
        {
          type: "ai",
          text: `좋아요. "${currentStep.label}"은 "${
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
          text: "이제 오른쪽 회의록을 확인한 뒤, 설정을 확정하고 집필 에디터로 이동할 수 있어요.",
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

    const recommended = currentStep.options[0];
    setCustomInput(recommended);
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
    completedCount,
    isAllComplete,
    getStepStatus,
    handleSelectOption,
    handleSendCustom,
    handleAiRecommend,
    handleStartEditor,
  };
}
