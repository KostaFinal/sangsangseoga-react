import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  agendaItems,
  initialSettings,
} from "../data/novelScenarioBuilderOptions";

export function useNovelScenarioBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  const setupData = location.state || {
    bookType: "NOVEL",
    writerLevel: "TEEN",
    interactionMode: "MIXED",
  };

  const [selectedKey, setSelectedKey] = useState("storySeed");
  const [settings, setSettings] = useState(initialSettings);
  const [customText, setCustomText] = useState("");
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] =
    useState(null);

  const selectedAgenda = useMemo(() => {
    return agendaItems.find((item) => item.key === selectedKey);
  }, [selectedKey]);

  const selectedIndex = useMemo(() => {
    return agendaItems.findIndex((item) => item.key === selectedKey);
  }, [selectedKey]);

  const completedCount = useMemo(() => {
    return Object.values(settings).filter((value) => value.trim() !== "").length;
  }, [settings]);

  const progressPercent = Math.round((completedCount / agendaItems.length) * 100);
  const isAllComplete = completedCount === agendaItems.length;

  const handleAgendaClick = (key) => {
    setSelectedKey(key);
    setCustomText(settings[key] || "");
    setSelectedRecommendationIndex(null);
  };

  const handleSelectRecommendation = (recommendation, index) => {
    setSettings((prev) => ({
      ...prev,
      [selectedKey]: recommendation.text,
    }));

    setCustomText(recommendation.text);
    setSelectedRecommendationIndex(index);
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;

    if (value.length > selectedAgenda.maxLength) {
      return;
    }

    setCustomText(value);
    setSelectedRecommendationIndex(null);

    setSettings((prev) => ({
      ...prev,
      [selectedKey]: value,
    }));
  };

  const handleResetCurrent = () => {
    setSettings((prev) => ({
      ...prev,
      [selectedKey]: "",
    }));

    setCustomText("");
    setSelectedRecommendationIndex(null);
  };

  const handlePreviousAgenda = () => {
    const prevIndex = selectedIndex - 1;

    if (prevIndex < 0) return;

    const prevKey = agendaItems[prevIndex].key;

    setSelectedKey(prevKey);
    setCustomText(settings[prevKey] || "");
    setSelectedRecommendationIndex(null);
  };

  const handleNextAgenda = () => {
    const nextIndex = selectedIndex + 1;

    if (nextIndex >= agendaItems.length) return;

    const nextKey = agendaItems[nextIndex].key;

    setSelectedKey(nextKey);
    setCustomText(settings[nextKey] || "");
    setSelectedRecommendationIndex(null);
  };

  const handleConfirm = () => {
    if (!isAllComplete) {
      alert("아직 확정되지 않은 설정이 있습니다.");
      return;
    }

    navigate(BOOK_CREATION_ROUTES.NOVEL.CONFIRM, {
      state: {
        ...setupData,
        minutes: settings,
      },
    });
  };

  return {
    agendaItems,
    selectedKey,
    settings,
    customText,
    selectedRecommendationIndex,
    selectedAgenda,
    selectedIndex,
    completedCount,
    progressPercent,
    isAllComplete,
    handleAgendaClick,
    handleSelectRecommendation,
    handleCustomTextChange,
    handleResetCurrent,
    handlePreviousAgenda,
    handleNextAgenda,
    handleConfirm,
  };
}
