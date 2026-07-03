import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  agendaKeyMap,
  initialMinutes,
  optionalAgenda,
  requiredAgenda,
} from "../data/novelAuthorMeetingOptions";

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
  };

  const handleAiRecommend = () => {
    setAnswer(
      "오래된 작가 회의실에서 발견된 미완성 원고가 현실의 기억을 바꾸기 시작한다."
    );
  };

  const handleNext = () => {
    if (!answer.trim()) {
      alert("내용을 먼저 입력하거나 AI 추천을 받아보세요.");
      return;
    }

    const currentKey = agendaKeyMap[activeAgenda];
    const savedAnswer = answer.trim();

    const nextMinutes = {
      ...minutes,
      [currentKey]: savedAnswer,
    };

    setMinutes(nextMinutes);

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
    setAnswer,
    minutes,
    allAgenda,
    isCompletedAgenda,
    requiredCompletedCount,
    totalCompletedCount,
    canStartWriting,
    handleAgendaClick,
    handleAiRecommend,
    handleNext,
    handleStartWriting,
  };
}
