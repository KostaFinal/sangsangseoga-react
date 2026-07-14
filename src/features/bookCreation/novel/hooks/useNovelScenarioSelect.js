import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createScenarioCards } from "../../services/aiGenerateService";
import { normalizeNovelScenarioState } from "../../utils/bookDraftMapper";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

import {
  filters,
  initialSelectedFilters,
  scenarios as fallbackScenarios,
} from "../data/novelScenarioSelectOptions";

const CARD_IDS = ["A", "B", "C"];

const toScenarios = (cards) =>
  cards.slice(0, CARD_IDS.length).map((card, index) => ({
    id: CARD_IDS[index],
    title: card.title || "",
    genre: card.genre || "",
    mood: card.mood || "",
    seed: card.seed || "",
    protagonist: card.protagonist || "",
    conflict: card.conflict || "",
  }));

export function useNovelScenarioSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {
    bookType: "NOVEL",
    writerLevel: "TEEN",
    interactionMode: "CHOICE",
  };

  const [scenarios, setScenarios] = useState(fallbackScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState(fallbackScenarios[0]?.id);
  const [selectedFilters, setSelectedFilters] = useState(initialSelectedFilters);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
  const [scenarioFallbackNotice, setScenarioFallbackNotice] = useState(false);
  const [shownTitles, setShownTitles] = useState([]);
  const hasRequestedInitialCards = useRef(false);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) || scenarios[0];

  const requestScenarioCards = async (excludeTitles) => {
    setIsLoadingScenarios(true);
    setScenarioFallbackNotice(false);

    const response = await createScenarioCards(
      { ...setupData, bookType: "NOVEL" },
      {
        cardCount: CARD_IDS.length,
        filters: selectedFilters,
        excludeTitles,
      }
    );

    // Spring 응답은 { data: { result: <Python envelope> } } 형태이고,
    // Python envelope 자체의 result가 { cards: [...] }를 담고 있다.
    const cards = response.ok ? response.data?.data?.result?.result?.cards : null;

    setIsLoadingScenarios(false);

    if (!Array.isArray(cards) || cards.length === 0) {
      setScenarioFallbackNotice(true);
      if (!response.ok) {
        console.warn("CREATE_SCENARIO_CARDS failed:", response.message);
      }
      return;
    }

    const nextScenarios = toScenarios(cards);

    setScenarios(nextScenarios);
    setShownTitles((prev) => [...prev, ...nextScenarios.map((scenario) => scenario.title)]);
    setSelectedScenarioId(nextScenarios[0].id);
  };

  useEffect(() => {
    // StrictMode 개발 모드의 마운트→언마운트→재마운트 이중 실행 때문에 초기 추천 요청이
    // 두 번 나가지 않도록 ref로 한 번만 실행되게 막는다(ref는 재마운트에도 초기화되지 않는다).
    if (hasRequestedInitialCards.current) return;
    hasRequestedInitialCards.current = true;
    requestScenarioCards([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    requestScenarioCards(shownTitles);
  };

  const handleStart = () => {
    const payload = normalizeNovelScenarioState({
      ...setupData,
      scenario: selectedScenario,
      filters: selectedFilters,
    });

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
    isLoadingScenarios,
    scenarioFallbackNotice,
    handleStart,
    handleFilterSelect,
    handleRegenerate,
  };
}
