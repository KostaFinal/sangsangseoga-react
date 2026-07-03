import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { normalizeSetting } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { toBookDraft } from "../../utils/bookDraftMapper";
import {
  fallbackStudioSetup,
  friendOptions as fallbackChoices,
} from "../data/fairyTaleCoCreationStudioOptions";

const FALLBACK_QUESTION = "다음 장면에서는 어떤 일이 일어날까요?";
const PHASE_META = [
  { phase: "기", icon: "1", className: "start" },
  { phase: "승", icon: "2", className: "middle" },
  { phase: "전", icon: "3", className: "turn" },
  { phase: "결", icon: "4", className: "end" },
];

const range = (start, end) =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);

const makePhaseSections = (pageCount) => {
  const firstEnd = Math.max(1, Math.round(pageCount * 0.3));
  const secondEnd = Math.max(firstEnd + 1, Math.round(pageCount * 0.6));
  const thirdEnd = Math.max(secondEnd + 1, Math.round(pageCount * 0.8));

  return [
    { ...PHASE_META[0], pages: range(1, Math.min(firstEnd, pageCount)) },
    { ...PHASE_META[1], pages: range(firstEnd + 1, Math.min(secondEnd, pageCount)) },
    { ...PHASE_META[2], pages: range(secondEnd + 1, Math.min(thirdEnd, pageCount)) },
    { ...PHASE_META[3], pages: range(thirdEnd + 1, pageCount) },
  ].filter((section) => section.pages.length);
};

const getResult = (data) => data?.result ?? data?.data?.result ?? data;

const getChoiceQuestion = (data) => {
  const result = getResult(data);
  return (
    result?.nextQuestion ||
    result?.question ||
    result?.message ||
    result?.prompt ||
    ""
  );
};

const getChoiceOptions = (data) => {
  const result = getResult(data);
  const options =
    result?.choices ||
    result?.options ||
    result?.selectedOptions ||
    result?.recommendations ||
    [];

  if (Array.isArray(options)) return options;
  if (options && typeof options === "object") return Object.values(options);
  return [];
};

const getSceneTitle = (data) => {
  const result = getResult(data);
  return (
    result?.sceneTitle ||
    result?.title ||
    result?.currentSceneTitle ||
    result?.pageTitle ||
    ""
  );
};

const getSceneSummary = (data) => {
  const result = getResult(data);
  return (
    result?.sceneSummary ||
    result?.summary ||
    result?.body ||
    result?.text ||
    result?.content ||
    ""
  );
};

const normalizeChoices = (choices) =>
  choices
    .map((choice, index) => {
      const raw = choice && typeof choice === "object" ? choice : { title: choice };
      const title = raw.title || raw.label || raw.value || raw.text || "";

      if (!title) return null;

      return {
        ...raw,
        id: String(raw.id || `choice-${index + 1}`),
        title,
        desc: raw.desc || raw.description || raw.reason || raw.summary || "",
        color: raw.color || ["green", "yellow", "purple"][index % 3],
      };
    })
    .filter(Boolean);

const makeInitialPagePlans = (setupData, pageCount) =>
  Array.from({ length: pageCount }, (_, index) => {
    const pageNo = index + 1;
    const seed = setupData.storySeed || setupData.seed || setupData.title || "첫 장면";

    return {
      pageNo,
      title: `${pageNo}p 장면`,
      summary: pageNo === 1 ? seed : "",
    };
  });

const makeFallbackTitle = (answer) => (answer ? `${answer} 선택` : "새 장면");

export function useFairyTaleCoCreationStudio() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSetup = location.state || fallbackStudioSetup;
  const setupData = {
    ...initialSetup,
    bookType: "FAIRY_TALE",
  };
  const pageCount = Number(setupData.pageCount) || 10;
  const requestGuardRef = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [completedPageNumbers, setCompletedPageNumbers] = useState([]);
  const [pagePlans, setPagePlans] = useState(() =>
    Array.isArray(initialSetup.pagePlans) && initialSetup.pagePlans.length
      ? initialSetup.pagePlans
      : makeInitialPagePlans(setupData, pageCount)
  );
  const [choiceQuestion, setChoiceQuestion] = useState(FALLBACK_QUESTION);
  const [choices, setChoices] = useState(() => normalizeChoices(fallbackChoices));
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [customAnswer, setCustomAnswer] = useState("");
  const [previousAnswers, setPreviousAnswers] = useState(
    Array.isArray(initialSetup.previousAnswers) ? initialSetup.previousAnswers : []
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [isLoadingChoiceStep, setIsLoadingChoiceStep] = useState(false);

  const selectedChoice = choices.find((choice) => choice.id === selectedChoiceId);
  const selectedAnswer = customAnswer.trim() || selectedChoice?.title || "";
  const canCreateNextScene = Boolean(selectedAnswer) && !isLoadingChoiceStep;

  const outlineData = useMemo(
    () =>
      makePhaseSections(pageCount).map((section) => ({
        ...section,
        items: section.pages.map((pageNo) => {
          const pagePlan = pagePlans.find((plan) => plan.pageNo === pageNo);

          return {
            page: pageNo,
            text: pagePlan?.title || `${pageNo}p 장면`,
            done: completedPageNumbers.includes(pageNo),
            current: pageNo === currentPage,
          };
        }),
      })),
    [completedPageNumbers, currentPage, pageCount, pagePlans]
  );

  const pageButtons = useMemo(
    () =>
      Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;

        return {
          page,
          done: completedPageNumbers.includes(page),
          current: page === currentPage,
          disabled: true,
        };
      }),
    [completedPageNumbers, currentPage, pageCount]
  );

  const handleNextScene = async () => {
    if (requestGuardRef.current || !selectedAnswer) return;

    const currentAnswerRecord = {
      step: currentPage,
      pageNo: currentPage,
      question: choiceQuestion,
      answer: selectedAnswer,
      option: selectedChoice || null,
    };
    const nextPreviousAnswers = [
      ...previousAnswers.filter((item) => item.pageNo !== currentPage),
      currentAnswerRecord,
    ];
    const draftInput = {
      ...setupData,
      currentPage,
      pagePlans,
      storyPages: pagePlans,
      selectedChoiceId,
      selectedChoice,
      customAnswer,
      selectedAnswer,
      previousAnswers: nextPreviousAnswers,
    };
    const draft = toBookDraft(draftInput);
    const extra = {
      purpose: "CREATE_FAIRY_TALE_CHOICE_STEP",
      currentStep: currentPage,
      currentPageNo: currentPage,
      previousAnswers: nextPreviousAnswers,
      selectedChoice,
      selectedAnswer,
      fallbackQuestion: choiceQuestion || FALLBACK_QUESTION,
    };

    requestGuardRef.current = true;
    setIsLoadingChoiceStep(true);

    console.log("[CHOICE STEP REQUEST]", {
      currentStep: currentPage,
      previousAnswers: nextPreviousAnswers,
      draft,
    });

    const response = await normalizeSetting(draftInput, extra);

    console.log("[CHOICE STEP RESPONSE]", response);

    const aiQuestion = response.ok ? getChoiceQuestion(response.data) : "";
    const aiChoices = response.ok ? normalizeChoices(getChoiceOptions(response.data)) : [];
    const sceneTitle =
      (response.ok ? getSceneTitle(response.data) : "") || makeFallbackTitle(selectedAnswer);
    const sceneSummary = response.ok ? getSceneSummary(response.data) : "";

    if (!response.ok || !aiQuestion || aiChoices.length === 0) {
      console.warn("[CHOICE STEP FALLBACK]", response.message);
    }

    const nextPagePlans = pagePlans.map((plan) =>
      plan.pageNo === currentPage
        ? {
            ...plan,
            title: sceneTitle,
            summary: sceneSummary || plan.summary,
            selectedAnswer,
          }
        : plan
    );
    const nextCompletedPageNumbers = completedPageNumbers.includes(currentPage)
      ? completedPageNumbers
      : [...completedPageNumbers, currentPage];
    const fairyTalePages = nextPagePlans.map((plan) => ({
      pageNo: plan.pageNo,
      title: plan.title,
      sceneTitle: plan.title,
      summary: plan.summary || "",
      body: plan.body || plan.summary || "",
      selectedAnswer: plan.selectedAnswer || "",
      status: nextCompletedPageNumbers.includes(plan.pageNo) ? "DONE" : "WAITING",
    }));

    setPagePlans(nextPagePlans);
    setCompletedPageNumbers(nextCompletedPageNumbers);
    setPreviousAnswers(nextPreviousAnswers);

    if (currentPage === pageCount) {
      setIsLoadingChoiceStep(false);
      requestGuardRef.current = false;
      navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.IMAGES, {
        state: {
          ...setupData,
          pageCount,
          pagePlans: nextPagePlans,
          storyPages: nextPagePlans,
          fairyTalePages,
          previousAnswers: nextPreviousAnswers,
          completedPageNumbers: nextCompletedPageNumbers,
        },
      });
      return;
    }

    if (currentPage < pageCount) {
      setCurrentPage((prev) => prev + 1);
      setPreviewPage((prev) => Math.min(prev + 1, pageCount));
      setChoiceQuestion(aiQuestion || FALLBACK_QUESTION);
      setChoices(aiChoices.length ? aiChoices : normalizeChoices(fallbackChoices));
      setSelectedChoiceId(null);
      setCustomAnswer("");
    }

    setIsLoadingChoiceStep(false);
    requestGuardRef.current = false;
  };

  return {
    outlineData,
    choices,
    choiceQuestion,
    selectedChoiceId,
    setSelectedChoiceId,
    customAnswer,
    setCustomAnswer,
    currentPage,
    pageCount,
    isPreviewOpen,
    setIsPreviewOpen,
    previewPage,
    setPreviewPage,
    pageButtons,
    isLoadingChoiceStep,
    canCreateNextScene,
    completedPageNumbers,
    pagePlans,
    handleNextScene,
  };
}
