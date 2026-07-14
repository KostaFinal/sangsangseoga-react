import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createSettingOptions,
  requestAiGenerateStream,
} from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  agendaItems,
  initialSettings,
} from "../data/novelScenarioBuilderOptions";
import {
  extractPartialQuestion,
  getChoiceGuide,
  getChoiceOptions,
  getChoiceQuestion,
  isValidNovelOptionsResponse,
  normalizeChoiceOptions,
} from "../../fairy-tale/utils/aiSettingOptions";

// AI 옵션 응답의 value(보통 문자열, 드물게 desc만 있는 경우 대비)를 이 화면이 쓰는
// { title, text, tags } 추천 카드 모양으로 맞춘다.
const toRecommendation = (option) => ({
  title: option.title,
  text: typeof option.value === "string" && option.value.trim() ? option.value : option.desc || option.title,
  tags: [],
});

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

  const [recommendationsByKey, setRecommendationsByKey] = useState({});
  const [recommendationVersionByKey, setRecommendationVersionByKey] = useState({});
  const [fallbackNoticeByKey, setFallbackNoticeByKey] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadingHint, setLoadingHint] = useState("");

  const requestGuardRef = useRef(false);
  const fetchedKeysRef = useRef(new Set());

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
  const showFallbackNotice = Boolean(fallbackNoticeByKey[selectedKey]);

  // 화면에 보여줄 추천 카드 목록: AI가 이미 채워준 게 있으면 그걸, 아니면(로딩 전/실패 전) 정적 기본값을 쓴다.
  const currentRecommendations =
    recommendationsByKey[selectedKey] || selectedAgenda.recommendations;

  const buildDraftInput = (fromSettings) => ({
    ...setupData,
    bookType: "NOVEL",
    interactionMode: "MIXED",
    writerLevel: setupData.writerLevel || "TEEN",
    storySeed: fromSettings.storySeed || "",
    genre: fromSettings.genre || "",
    protagonist: fromSettings.protagonist || "",
    background: fromSettings.background || "",
    conflict: fromSettings.conflict || "",
    ending: fromSettings.ending || "",
  });

  const buildPreviousAnswers = (fromSettings) =>
    agendaItems
      .filter((item) => String(fromSettings[item.key] || "").trim())
      .map((item) => ({
        stepKey: item.key,
        label: item.label,
        answer: fromSettings[item.key],
      }));

  // 새 안건 진입("안건 클릭"/"다음 안건")과 재추천("다시 추천")이 공유하는 요청 함수.
  const requestAgendaOptions = async (key, version, answersSoFar) => {
    const draftInput = buildDraftInput(settings);
    const extra = {
      purpose: "CREATE_NOVEL_SCENARIO_STEP",
      currentStepKey: key,
      currentStepLabel: agendaItems.find((item) => item.key === key)?.label,
      previousAnswers: answersSoFar,
      interactionMode: "MIXED",
      recommendationVersion: version,
    };

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

    if (!response.ok || !isValidNovelOptionsResponse(response.data, key)) {
      console.warn("AI 추천 생성 실패. 기본 추천을 사용합니다.", response.message);
      return { recommendations: null, usedFallback: true };
    }

    const options = normalizeChoiceOptions(getChoiceOptions(response.data), key);

    return {
      recommendations: options.map(toRecommendation),
      usedFallback: false,
    };
  };

  const ensureAgendaOptions = async (key) => {
    if (fetchedKeysRef.current.has(key)) return;
    fetchedKeysRef.current.add(key);

    setIsLoadingOptions(true);
    setLoadingHint("");

    const { recommendations, usedFallback } = await requestAgendaOptions(
      key,
      0,
      buildPreviousAnswers(settings)
    );

    if (recommendations) {
      setRecommendationsByKey((prev) => ({ ...prev, [key]: recommendations }));
    }
    setFallbackNoticeByKey((prev) => ({ ...prev, [key]: usedFallback }));
    setIsLoadingOptions(false);
  };

  // 마운트 시 1회: 첫 안건(storySeed)의 추천을 AI로 받아온다.
  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    ensureAgendaOptions("storySeed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgendaClick = (key) => {
    setSelectedKey(key);
    setCustomText(settings[key] || "");
    setSelectedRecommendationIndex(null);
    ensureAgendaOptions(key);
  };

  const handleRecommendAgain = async () => {
    if (requestGuardRef.current) return;

    requestGuardRef.current = true;
    setIsLoadingOptions(true);
    setLoadingHint("");

    const nextVersion = (recommendationVersionByKey[selectedKey] || 0) + 1;
    const { recommendations, usedFallback } = await requestAgendaOptions(
      selectedKey,
      nextVersion,
      buildPreviousAnswers(settings)
    );

    if (recommendations) {
      setRecommendationsByKey((prev) => ({ ...prev, [selectedKey]: recommendations }));
    }
    setFallbackNoticeByKey((prev) => ({ ...prev, [selectedKey]: usedFallback }));
    setRecommendationVersionByKey((prev) => ({ ...prev, [selectedKey]: nextVersion }));
    setSelectedRecommendationIndex(null);

    setIsLoadingOptions(false);
    requestGuardRef.current = false;
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
    ensureAgendaOptions(prevKey);
  };

  const handleNextAgenda = () => {
    const nextIndex = selectedIndex + 1;

    if (nextIndex >= agendaItems.length) return;

    const nextKey = agendaItems[nextIndex].key;

    setSelectedKey(nextKey);
    setCustomText(settings[nextKey] || "");
    setSelectedRecommendationIndex(null);
    ensureAgendaOptions(nextKey);
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
    currentRecommendations,
    completedCount,
    progressPercent,
    isAllComplete,
    isLoadingOptions,
    loadingHint,
    showFallbackNotice,
    handleAgendaClick,
    handleSelectRecommendation,
    handleCustomTextChange,
    handleResetCurrent,
    handlePreviousAgenda,
    handleNextAgenda,
    handleRecommendAgain,
    handleConfirm,
  };
}
