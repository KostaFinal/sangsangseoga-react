import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { seedMap, steps } from "../data/novelChoiceBuilderOptions";

export function useNovelChoiceBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {
    bookType: "NOVEL",
    writerLevel: "BALANCED",
    interactionMode: "CHOICE",
  };

  const initialSelections = useMemo(() => {
    return steps.reduce((acc, step) => {
      acc[step.key] = step.options[0];
      return acc;
    }, {});
  }, []);

  const [selections, setSelections] = useState(initialSelections);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = steps[currentIndex];

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const minutes = {
      storySeed: seedMap[selections.genre],
      genre: selections.genre,
      protagonist: selections.protagonist,
      background: selections.background,
      conflict: `${selections.protagonist}이 ${selections.background}에서 숨겨진 진실을 발견한다`,
      ending: selections.ending,
    };

    navigate("/bookmaker/novel/confirm", {
      state: {
        ...setupData,
        minutes,
      },
    });
  };

  return {
    steps,
    selections,
    setSelections,
    currentIndex,
    currentStep,
    handleNext,
  };
}
