import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeNovelScenarioState } from "../../utils/bookDraftMapper";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

import {
  filters,
  initialSelectedFilters,
  scenarios,
} from "../data/novelScenarioSelectOptions";

export function useNovelScenarioSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {
    bookType: "NOVEL",
    writerLevel: "TEEN",
    interactionMode: "CHOICE",
  };
  const [selectedScenarioId, setSelectedScenarioId] = useState("A");
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === selectedScenarioId
  );

  const [selectedFilters, setSelectedFilters] = useState(initialSelectedFilters);

  const handleStart = () => {
    const payload = normalizeNovelScenarioState({
      ...setupData,
      scenario: selectedScenario,
      filters: selectedFilters,
    });

    console.log("선택한 시나리오:", payload);

    navigate(BOOK_CREATION_ROUTES.NOVEL.CONFIRM, {
      state: payload,
    });
  };

  const handleFilterSelect = (filterName, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return {
    scenarios,
    filters,
    selectedScenarioId,
    setSelectedScenarioId,
    selectedScenario,
    selectedFilters,
    handleStart,
    handleFilterSelect,
  };
}
