import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createSettingOptions, normalizeSetting } from "../../services/aiGenerateService";
import { toBookDraft } from "../../utils/bookDraftMapper";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  agendaKeyMap,
  initialMinutes,
  optionalAgenda,
  requiredAgenda,
} from "../data/novelAuthorMeetingOptions";
import {
  getChoiceOptions,
  isValidNovelOptionsResponse,
  normalizeChoiceOptions,
} from "../../fairy-tale/utils/aiSettingOptions";

export function useNovelAuthorMeeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const setupData = location.state || {
    bookType: "NOVEL",
    writerLevel: "TEEN",
    interactionMode: "FREE",
  };

  const [activeAgenda, setActiveAgenda] = useState("이야기 씨앗");
  const [answer, setAnswer] = useState("");
  const [minutes, setMinutes] = useState(initialMinutes);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendFailed, setRecommendFailed] = useState(false);
  const [emptyAnswerNotice, setEmptyAnswerNotice] = useState(false);

  const [exampleOptionsByKey, setExampleOptionsByKey] = useState({});
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [exampleFailed, setExampleFailed] = useState(false);

  const allAgenda = [...requiredAgenda, ...optionalAgenda];

  const isCompletedAgenda = (agenda) => {
    const key = agendaKeyMap[agenda];
    return minutes[key] && minutes[key] !== "미정";
  };

  const requiredCompletedCount = requiredAgenda.filter(isCompletedAgenda).length;
  const totalCompletedCount = allAgenda.filter(isCompletedAgenda).length;
  const canStartWriting = requiredCompletedCount === requiredAgenda.length;

  const handleAgendaClick = (agenda) => {
    const key = agendaKeyMap[agenda];
    const savedValue = minutes[key];

    setActiveAgenda(agenda);
    setAnswer(savedValue && savedValue !== "미정" ? savedValue : "");
    setShowExamples(false);
    setEmptyAnswerNotice(false);
  };

  const buildDraftInput = () => ({
    ...setupData,
    bookType: "NOVEL",
    interactionMode: "FREE",
    writerLevel: setupData.writerLevel || "TEEN",
    storySeed: minutes.storySeed !== "미정" ? minutes.storySeed : "",
    genre: minutes.genre !== "미정" ? minutes.genre : "",
    protagonist: minutes.protagonist !== "미정" ? minutes.protagonist : "",
    background: minutes.background !== "미정" ? minutes.background : "",
    conflict: minutes.conflict !== "미정" ? minutes.conflict : "",
    ending: minutes.ending !== "미정" ? minutes.ending : "",
    mood: minutes.mood !== "미정" ? minutes.mood : "",
    problem: minutes.problem !== "미정" ? minutes.problem : "",
    pointOfView: minutes.pointOfView !== "미정" ? minutes.pointOfView : "",
    volume: minutes.volume !== "미정" ? minutes.volume : "",
    style: minutes.style !== "미정" ? minutes.style : "",
    pace: minutes.pace !== "미정" ? minutes.pace : "",
    avoid: minutes.avoid !== "미정" ? minutes.avoid : "",
  });

  const buildPreviousAnswers = () =>
    allAgenda
      .filter((agenda) => isCompletedAgenda(agenda))
      .map((agenda) => ({
        stepKey: agendaKeyMap[agenda],
        label: agenda,
        answer: minutes[agendaKeyMap[agenda]],
      }));

  // 자유형은 카드 여러 개를 고르는 화면이 아니라 텍스트 한 칸이라, AI가 만들어준 선택지 중
  // 첫 번째 것을 답변으로 채워 넣는다.
  const handleAiRecommend = async () => {
    if (isRecommending) return;

    setIsRecommending(true);
    setRecommendFailed(false);

    const stepKey = agendaKeyMap[activeAgenda];
    const draftInput = buildDraftInput();
    const extra = {
      purpose: "CREATE_NOVEL_AUTHOR_MEETING_STEP",
      currentStepKey: stepKey,
      currentStepLabel: activeAgenda,
      previousAnswers: buildPreviousAnswers(),
      interactionMode: "FREE",
      recommendationVersion: 0,
    };

    const response = await createSettingOptions(draftInput, extra);

    if (response.ok && isValidNovelOptionsResponse(response.data, stepKey)) {
      const options = normalizeChoiceOptions(getChoiceOptions(response.data), stepKey);
      const first = options[0];
      const suggestion =
        first && (typeof first.value === "string" && first.value.trim() ? first.value : first.desc);

      if (suggestion) {
        setAnswer(suggestion);
        setEmptyAnswerNotice(false);
      } else {
        setRecommendFailed(true);
      }
    } else {
      console.warn("AI 추천 생성 실패.", response.message);
      setRecommendFailed(true);
    }

    setIsRecommending(false);
  };

  // AI 추천은 첫 번째 선택지만 쓰고 나머지는 버리는데, "예시 보기"는 그 나머지를
  // 읽기 전용 참고용으로 여러 개 보여준 뒤, 마음에 드는 걸 고르면 답변란에 채워 넣는다.
  const handleToggleExamples = async () => {
    if (showExamples) {
      setShowExamples(false);
      return;
    }

    const stepKey = agendaKeyMap[activeAgenda];

    if (exampleOptionsByKey[stepKey]) {
      setShowExamples(true);
      return;
    }

    setIsLoadingExamples(true);
    setExampleFailed(false);

    const draftInput = buildDraftInput();
    const extra = {
      purpose: "CREATE_NOVEL_AUTHOR_MEETING_STEP",
      currentStepKey: stepKey,
      currentStepLabel: activeAgenda,
      previousAnswers: buildPreviousAnswers(),
      interactionMode: "FREE",
      recommendationVersion: 0,
    };

    const response = await createSettingOptions(draftInput, extra);

    if (response.ok && isValidNovelOptionsResponse(response.data, stepKey)) {
      const options = normalizeChoiceOptions(getChoiceOptions(response.data), stepKey);
      const examples = options
        .map((option) =>
          typeof option.value === "string" && option.value.trim() ? option.value : option.desc
        )
        .filter(Boolean);

      if (examples.length) {
        setExampleOptionsByKey((prev) => ({ ...prev, [stepKey]: examples }));
        setShowExamples(true);
      } else {
        setExampleFailed(true);
      }
    } else {
      console.warn("예시 생성 실패.", response.message);
      setExampleFailed(true);
    }

    setIsLoadingExamples(false);
  };

  const handleSelectExample = (text) => {
    setAnswer(text);
    setShowExamples(false);
    setEmptyAnswerNotice(false);
  };

  const handleAnswerChange = (value) => {
    setAnswer(value);
    setEmptyAnswerNotice(false);
  };

  const handleNext = () => {
    if (!answer.trim()) {
      setEmptyAnswerNotice(true);
      return;
    }

    const currentKey = agendaKeyMap[activeAgenda];
    const savedAnswer = answer.trim();

    const nextMinutes = {
      ...minutes,
      [currentKey]: savedAnswer,
    };

    setMinutes(nextMinutes);
    setShowExamples(false);
    setEmptyAnswerNotice(false);

    const currentIndex = allAgenda.indexOf(activeAgenda);
    const nextAgenda = allAgenda[currentIndex + 1];

    if (nextAgenda) {
      setActiveAgenda(nextAgenda);

      const nextKey = agendaKeyMap[nextAgenda];
      const nextSavedValue = nextMinutes[nextKey];

      setAnswer(nextSavedValue && nextSavedValue !== "미정" ? nextSavedValue : "");
    } else {
      setAnswer("");
      alert("작가 회의가 완료되었습니다. 이제 집필 시작을 누를 수 있어요.");
    }
  };

  const handleStartWriting = () => {
    if (!canStartWriting) {
      alert("필수 설정을 먼저 모두 완료해 주세요.");
      return;
    }

    // 자유형(FREE)은 이 채팅 안에서 기본 설정 + 연출(directing)까지 전부 물어봤으므로,
    // 단계별 선택 카드 화면(CONFIRM)을 거치지 않고 바로 집필 에디터로 넘어간다.
    if (setupData.interactionMode === "FREE") {
      const directing = {
        mood: minutes.mood,
        style: minutes.style,
        pointOfView: minutes.pointOfView,
        volume: minutes.volume,
        pace: minutes.pace,
        avoid: minutes.avoid,
      };

      const payload = {
        ...setupData,
        ...minutes,
        minutes,
        directing,
      };

      normalizeSetting(payload, { source: "novelAuthorMeeting" });

      navigate(BOOK_CREATION_ROUTES.NOVEL.EDITOR, {
        state: payload,
      });
      return;
    }

    navigate(BOOK_CREATION_ROUTES.NOVEL.CONFIRM, {
      state: {
        ...setupData,
        minutes,
      },
    });
  };

  return {
    requiredAgenda,
    optionalAgenda,
    agendaKeyMap,
    activeAgenda,
    answer,
    handleAnswerChange,
    minutes,
    allAgenda,
    isCompletedAgenda,
    requiredCompletedCount,
    totalCompletedCount,
    canStartWriting,
    isRecommending,
    recommendFailed,
    emptyAnswerNotice,
    currentExamples: exampleOptionsByKey[agendaKeyMap[activeAgenda]] || [],
    isLoadingExamples,
    showExamples,
    exampleFailed,
    handleAgendaClick,
    handleAiRecommend,
    handleToggleExamples,
    handleSelectExample,
    handleNext,
    handleStartWriting,
  };
}
