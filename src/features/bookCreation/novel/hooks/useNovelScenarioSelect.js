import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  filters,
  initialSelectedFilters,
  scenarios,
} from "../data/novelScenarioSelectOptions";

export function useNovelScenarioSelect() {
  const navigate = useNavigate();
  const [selectedScenarioId, setSelectedScenarioId] = useState("A");
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === selectedScenarioId
  );

  const [selectedFilters, setSelectedFilters] = useState(initialSelectedFilters);

  const handleStart = () => {
    const payload = {
      scenario: selectedScenario,
      filters: selectedFilters,
    };

    console.log("선택한 시나리오:", payload);

    navigate("/bookmaker/novel/confirm", {
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
