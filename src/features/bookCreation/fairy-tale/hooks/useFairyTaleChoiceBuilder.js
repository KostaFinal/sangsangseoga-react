import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  optionSets,
  stepList,
} from "../data/fairyTaleChoiceBuilderOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";

export function useFairyTaleChoiceBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousData = location.state || {};

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [recommendVersion, setRecommendVersion] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  const currentStep = stepList[currentStepIndex];
  const isLastStep = currentStepIndex === stepList.length - 1;

  const currentOptions = useMemo(() => {
    const sets = optionSets[currentStep.key] || [[]];
    const version = recommendVersion[currentStep.key] || 0;
    return sets[version % sets.length];
  }, [currentStep.key, recommendVersion]);

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

  const handleRecommendAgain = () => {
    const optionGroup = optionSets[currentStep.key] || [[]];

    if (optionGroup.length <= 1) {
      return;
    }

    setRecommendVersion((prev) => ({
      ...prev,
      [currentStep.key]: (prev[currentStep.key] || 0) + 1,
    }));

    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentStep.key];
      return next;
    });
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

  const handleNextStep = () => {
    if (!selectedOption) {
      alert("선택지를 하나 골라주세요.");
      return;
    }

    if (isLastStep) {
      const finalData = normalizeFairyTaleDraftState(makeFinalData(), {
        creationMode: "CHOICE",
        interactionMode: "CHOICE",
      });
      normalizeSetting(finalData, {
        source: "fairyTaleChoiceBuilder",
      });

      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.CONFIRM, {
        state: finalData,
      });

      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
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
  };
}
