import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  initialSettings,
  seedOptions,
  steps,
} from "../data/fairyTaleSettingWizardOptions";

export function useFairyTaleSettingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSetup = location.state;

  console.log("이전 화면에서 넘어온 설정:", initialSetup);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState("MAGIC_OBJECT");
  const [customSeed, setCustomSeed] = useState("");
  const [settings, setSettings] = useState(initialSettings);

  const currentStepInfo = steps[currentStep];

  const completedCount = useMemo(() => {
    return Object.values(settings).filter((value) => value && value.trim() !== "")
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    console.log("동화 기본 설정:", settings);
    navigate("/fairy-tale/studio", {
      state: {
        ...initialSetup,
        ...settings,
      },
    });
  };

  const isSeedStep = currentStepInfo.key === "seed";

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
    completedCount,
    progressPercent,
    handleSeedSelect,
    handleCustomSeedChange,
    handleNext,
    isSeedStep,
  };
}
