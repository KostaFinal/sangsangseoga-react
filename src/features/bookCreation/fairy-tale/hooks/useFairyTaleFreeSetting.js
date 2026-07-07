import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  collectSetting,
  normalizeSetting,
  requestAiGenerateStream,
} from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  EMPTY_SETTINGS,
  REQUIRED_FIELDS,
  STEPS,
  SUMMARY_ITEMS,
} from "../data/fairyTaleFreeSettingOptions";
import { normalizeFairyTaleDraftState } from "../utils/normalizeFairyTaleDraftState";
import {
  extractPartialQuestion,
  getChoiceQuestion,
  getMissingFields,
  getResultExamples,
  getResultSetting,
  getStatus,
  isValidChatResponse,
} from "../utils/aiSettingOptions";

// pageCount는 CHOICE/MIXED와 동일하게 정책상 고정 선택 항목이다 — AI에게 묻거나 AI 응답으로 채우지 않는다.
const AI_SKIPPED_FIELD_KEYS = new Set(["pageCount"]);

export function useFairyTaleFreeSetting() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {};

  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [missingFields, setMissingFields] = useState(
    REQUIRED_FIELDS.filter((key) => !AI_SKIPPED_FIELD_KEYS.has(key))
  );
  const [aiExamples, setAiExamples] = useState([]);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [usedFallbackNotice, setUsedFallbackNotice] = useState(false);
  const [loadingHint, setLoadingHint] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const requestGuardRef = useRef(false);
  const initialFetchRef = useRef(false);

  const completedRequiredCount = useMemo(
    () => REQUIRED_FIELDS.filter((key) => String(settings[key] || "").trim()).length,
    [settings]
  );
  const progress = Math.round((completedRequiredCount / REQUIRED_FIELDS.length) * 100);
  const isRequiredComplete = completedRequiredCount === REQUIRED_FIELDS.length;
  const progressDegree = progress * 3.6;

  // 아직 값이 없는 필드 중 STEPS에 정의된 첫 항목 — 예시 칩/페이지 수 select 분기 및 fallback 질문에 쓰인다.
  // missingFields(AI 기준)에 없는 pageCount는 다른 필수 필드가 모두 끝난 뒤 두 번째 조건에서 자연스럽게 걸린다.
  const activeField =
    STEPS.find((step) => missingFields.includes(step.key)) ||
    STEPS.find((step) => !String(settings[step.key] || "").trim()) ||
    STEPS[STEPS.length - 1];

  const isPageCountField = activeField.key === "pageCount";
  const rawExamples =
    isPageCountField || aiExamples.length === 0 ? activeField.examples || [] : aiExamples;
  // pageCount는 빠른 선택용 칩이라 항상 보여준다. 그 외 필드는 "모르겠어요"를 눌렀을 때만 예시를 공개한다.
  const displayedExamples = isPageCountField || showExamples ? rawExamples : [];
  const canShowExamplesHint = !isPageCountField && !showExamples && rawExamples.length > 0;

  const getDisplayValue = (key, value) => {
    if (!value) return "아직 정하지 않음";
    if (key === "pageCount") return `${value}페이지`;
    return value;
  };

  const getStatusIcon = (key) => {
    if (String(settings[key] || "").trim()) return "✓";
    return REQUIRED_FIELDS.includes(key) ? "!" : "·";
  };

  const addAiMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "AI", text }]);
    // 새 질문이 왔으니 이전 질문에서 열어봤던 예시는 다시 숨긴다.
    setShowExamples(false);
  };

  const handleShowExamples = () => {
    setShowExamples(true);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "USER", text }]);
  };

  // settings에 아직 값이 없는 첫 STEPS 항목을 순서대로 찾는다 — 기존 STEPS 순서를 그대로 fallback 순서로 쓴다.
  const pickFallbackStep = (fromSettings) =>
    STEPS.find((step) => !String(fromSettings[step.key] || "").trim()) || STEPS[STEPS.length - 1];

  const buildDraftInput = (fromSettings) => ({
    ...setupData,
    bookType: "FAIRY_TALE",
    interactionMode: "FREE",
    writerLevel: setupData.writerLevel || "LOWER_ELEMENTARY",
    ...fromSettings,
  });

  // AI가 돌려준 result.setting 중 값이 채워진 필드만 로컬 settings에 병합한다.
  // pageCount는 정책상 항상 제외 — AI가 뭐라고 응답하든 무시하고 사용자의 화면 선택만 반영한다.
  const mergeAiSetting = (aiSetting) => {
    if (!aiSetting || typeof aiSetting !== "object") return settings;

    const merged = { ...settings };
    Object.keys(EMPTY_SETTINGS).forEach((key) => {
      if (AI_SKIPPED_FIELD_KEYS.has(key)) return;

      const value = aiSetting[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        merged[key] = value;
      }
    });

    setSettings(merged);
    return merged;
  };

  const completeSetup = async (finalSettings) => {
    setIsCompleting(true);

    const finalData = normalizeFairyTaleDraftState(
      {
        ...setupData,
        ...finalSettings,
      },
      {
        creationMode: "FREE",
        interactionMode: "FREE",
      }
    );

    const normResponse = await normalizeSetting(finalData, {
      source: "fairyTaleFreeSetting",
    });
    const normalizedSetting = normResponse.ok ? getResultSetting(normResponse.data) : null;

    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.CONFIRM, {
      state:
        normalizedSetting && typeof normalizedSetting === "object"
          ? { ...finalData, ...normalizedSetting }
          : finalData,
    });

    setIsCompleting(false);
  };

  // 스트리밍은 로딩 텍스트 갱신용 보조 수단일 뿐, 정답 소스는 non-stream collectSetting 호출이다.
  const fireLoadingStream = (draftInput, extra) => {
    let streamedText = "";
    requestAiGenerateStream({
      taskType: "COLLECT_SETTING",
      draft: toBookDraft(draftInput),
      extra,
      onDelta: (text) => {
        streamedText += text;
        const partial = extractPartialQuestion(streamedText);
        if (partial) setLoadingHint(partial);
      },
    });
  };

  // 마운트 시 1회: 첫 질문을 Gemini에게 받아온다. 고정 질문을 직접 쓰지 않는다.
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;

    (async () => {
      setIsLoadingQuestion(true);
      setLoadingHint("");

      const draftInput = buildDraftInput(EMPTY_SETTINGS);
      const extra = {
        userMessage: "",
        previousMessages: [],
        interactionMode: "FREE",
        source: "fairyTaleFreeSetting",
      };

      fireLoadingStream(draftInput, extra);

      const response = await collectSetting(draftInput, extra);

      if (response.ok && isValidChatResponse(response.data)) {
        mergeAiSetting(getResultSetting(response.data));
        setMissingFields(getMissingFields(response.data));
        setAiExamples(getResultExamples(response.data));
        addAiMessage(getChoiceQuestion(response.data));
        setUsedFallbackNotice(false);
      } else {
        console.warn("AI 첫 질문 생성 실패. 기본 질문으로 이어갑니다.", response.message);
        addAiMessage(STEPS[0].question);
        setUsedFallbackNotice(true);
      }

      setIsLoadingQuestion(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = async (rawValue) => {
    const trimmed = String(rawValue ?? answer).trim();
    if (!trimmed || requestGuardRef.current) return;

    // pageCount는 정책상 고정 선택 항목 — AI에 묻지 않고 로컬에만 반영한다(CHOICE/MIXED와 동일 정책).
    if (activeField.key === "pageCount") {
      setSettings((prev) => ({ ...prev, pageCount: trimmed }));
      addUserMessage(`${trimmed}페이지로 만들게요.`);
      addAiMessage("좋아요! 페이지 수를 정했어요.");
      setAnswer("");
      return;
    }

    requestGuardRef.current = true;
    addUserMessage(trimmed);
    setAnswer("");
    setIsLoadingQuestion(true);
    setLoadingHint("");

    const previousMessages = [...messages, { sender: "USER", text: trimmed }].map((message) => ({
      sender: message.sender,
      content: message.text,
    }));

    const draftInput = buildDraftInput(settings);
    const extra = {
      userMessage: trimmed,
      previousMessages,
      interactionMode: "FREE",
      source: "fairyTaleFreeSetting",
    };

    fireLoadingStream(draftInput, extra);

    const response = await collectSetting(draftInput, extra);

    if (response.ok && isValidChatResponse(response.data)) {
      mergeAiSetting(getResultSetting(response.data));

      const nextMissingFields = getMissingFields(response.data).filter(
        (key) => !AI_SKIPPED_FIELD_KEYS.has(key)
      );

      setMissingFields(nextMissingFields);
      setAiExamples(getResultExamples(response.data));
      setUsedFallbackNotice(false);
      addAiMessage(getChoiceQuestion(response.data));
      setIsLoadingQuestion(false);
      requestGuardRef.current = false;
      return;
    }

    console.warn("AI 답변 처리 실패. 기본 질문으로 이어갑니다.", response.message);
    const fallbackStep = pickFallbackStep(settings);
    addAiMessage(fallbackStep.question);
    setUsedFallbackNotice(true);
    setIsLoadingQuestion(false);
    requestGuardRef.current = false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitAnswer();
  };

  const handleExampleClick = (example) => {
    setAnswer(example);
  };

  const handleExampleApply = (example) => {
    submitAnswer(example);
  };

  // 필수 설정을 다 채운 뒤에도 자동으로 다음 화면으로 넘어가지 않는다 — 사용자가 "바로 시작하기"/
  // "이 설정으로 동화 만들기 시작" 버튼을 직접 눌러야만 설정확인 화면으로 이동한다.
  const handleStartStudio = () => {
    if (!isRequiredComplete || requestGuardRef.current) return;

    requestGuardRef.current = true;
    completeSetup(settings).finally(() => {
      requestGuardRef.current = false;
    });
  };

  return {
    REQUIRED_FIELDS,
    SUMMARY_ITEMS,
    settings,
    answer,
    setAnswer,
    messages,
    activeField,
    displayedExamples,
    canShowExamplesHint,
    handleShowExamples,
    isLoadingQuestion,
    isCompleting,
    usedFallbackNotice,
    loadingHint,
    completedRequiredCount,
    progress,
    isRequiredComplete,
    progressDegree,
    getDisplayValue,
    getStatusIcon,
    handleSubmit,
    handleExampleClick,
    handleExampleApply,
    handleStartStudio,
    navigate,
  };
}
