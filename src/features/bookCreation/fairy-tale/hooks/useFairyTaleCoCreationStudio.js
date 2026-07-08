import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createPagePlan } from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { fallbackStudioSetup } from "../data/fairyTaleCoCreationStudioOptions";
import { getPagePlan, isValidPagePlan, normalizeChoiceOptions } from "../utils/aiSettingOptions";

const FALLBACK_QUESTION = "다음 장면에서는 어떤 일이 일어날까요?";
const UNREVEALED_SCENE_TEXT = "아직 공개되지 않은 장면";
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

// 화면에서 쓰는 친구 카드 색상만 추가 — 실제 정규화/검증은 aiSettingOptions.js의 공용 유틸을 재사용한다.
const normalizeChoicesForDisplay = (options, keyPrefix) =>
  normalizeChoiceOptions(options, keyPrefix).map((option, index) => ({
    ...option,
    color: option.color || ["green", "yellow", "purple"][index % 3],
  }));

const makeInitialPagePlans = (setupData, pageCount) =>
  Array.from({ length: pageCount }, (_, index) => {
    const pageNo = index + 1;
    const seed = setupData.storySeed || setupData.seed || setupData.title || "첫 장면";

    return {
      pageNo,
      phase: "",
      title: pageNo === 1 ? seed : `${pageNo}p 장면`,
      summary: pageNo === 1 ? seed : "",
      mainEmotion: "",
      imagePromptBase: "",
      question: "",
      guide: "",
      options: [],
      selectedAnswer: "",
    };
  });

// Python(CREATE_PAGE_PLAN) 응답의 페이지 하나를 화면에서 쓰는 로컬 pagePlan 항목으로 변환한다.
const toLocalPagePlan = (aiPage, existingPlan) => ({
  // AI가 pageNo를 문자열로 줄 수 있어(예: "1") currentPage(숫자)와의 비교가 깨지지 않도록 여기서 숫자로 고정한다.
  pageNo: Number(aiPage.pageNo),
  phase: aiPage.phase || existingPlan?.phase || "",
  title: aiPage.sceneTitle || existingPlan?.title || "",
  summary: aiPage.sceneSummary || existingPlan?.summary || "",
  mainEmotion: aiPage.mainEmotion || existingPlan?.mainEmotion || "",
  imagePromptBase: aiPage.imagePromptBase || existingPlan?.imagePromptBase || "",
  question: aiPage.question || "",
  guide: aiPage.guide || "",
  options: Array.isArray(aiPage.options) ? aiPage.options : [],
  selectedAnswer: existingPlan?.selectedAnswer || "",
});

// 로컬 pagePlan 항목을 "다시 추천" 요청의 extra.existingPagePlan에 실을 AI 스키마로 되돌린다.
const toAiPageShape = (plan) => ({
  pageNo: plan.pageNo,
  phase: plan.phase,
  sceneTitle: plan.title,
  sceneSummary: plan.summary,
  mainEmotion: plan.mainEmotion,
  imagePromptBase: plan.imagePromptBase,
  question: plan.question,
  guide: plan.guide,
  options: plan.options,
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

  const [currentPage, setCurrentPage] = useState(1);
  const [completedPageNumbers, setCompletedPageNumbers] = useState([]);
  const [pagePlans, setPagePlans] = useState(() =>
    Array.isArray(initialSetup.pagePlans) && initialSetup.pagePlans.length
      ? initialSetup.pagePlans
      : makeInitialPagePlans(setupData, pageCount)
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [customAnswer, setCustomAnswer] = useState("");
  const [previousAnswers, setPreviousAnswers] = useState(
    Array.isArray(initialSetup.previousAnswers) ? initialSetup.previousAnswers : []
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);

  // 최초 전체 pagePlan 생성(마운트 시 1회)과, 페이지별 "다시 추천"의 로딩 상태를 분리해서 관리한다.
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isRecommendingAgain, setIsRecommendingAgain] = useState(false);
  const [planFallbackNotice, setPlanFallbackNotice] = useState(false);
  const [pageFallbackNotice, setPageFallbackNotice] = useState({});
  const [pageRecommendationVersion, setPageRecommendationVersion] = useState({});

  const planRequestRef = useRef(false);
  const recommendGuardRef = useRef(false);

  // pageNo가 숫자/문자열로 섞여 들어와도 안전하게 매칭되도록 Number로 비교한다.
  const currentPageData = pagePlans.find((plan) => Number(plan.pageNo) === Number(currentPage));
  const choiceQuestion = currentPageData?.question || FALLBACK_QUESTION;
  const choiceGuide = currentPageData?.guide || "";
  const showFallbackNotice = planFallbackNotice || Boolean(pageFallbackNotice[currentPage]);
  const isLoadingChoiceStep = isGeneratingPlan || isRecommendingAgain;

  // AI가 실제로 만든 options만 사용한다. 비어있으면 하드코딩 샘플 선택지로 대체하지 않고
  // 빈 배열을 반환해 화면에서 안내 문구 + 직접 입력만 보이게 한다.
  const choices = useMemo(() => {
    const aiOptions = currentPageData?.options;
    if (!aiOptions?.length) return [];
    return normalizeChoicesForDisplay(aiOptions, `page${currentPage}`);
  }, [currentPageData, currentPage]);

  const showNoOptionsNotice = !isLoadingChoiceStep && !showFallbackNotice && choices.length === 0;

  const selectedChoice = choices.find((choice) => choice.id === selectedChoiceId);
  const selectedAnswer = customAnswer.trim() || selectedChoice?.title || "";
  const canCreateNextScene = Boolean(selectedAnswer) && !isLoadingChoiceStep;

  // AI가 pagePlan 전체(12페이지)를 미리 받아둬도, 화면에는 사용자가 아직 진행하지 않은
  // 미래 페이지의 제목/내용을 보여주지 않는다 — currentPage까지 도달한 페이지만 실제 제목을 노출한다.
  const outlineData = useMemo(
    () =>
      makePhaseSections(pageCount).map((section) => ({
        ...section,
        items: section.pages.map((pageNo) => {
          const isRevealed = pageNo <= currentPage;
          const pagePlan = isRevealed
            ? pagePlans.find((plan) => Number(plan.pageNo) === pageNo)
            : null;

          return {
            page: pageNo,
            text: isRevealed ? pagePlan?.title || `${pageNo}p 장면` : UNREVEALED_SCENE_TEXT,
            done: completedPageNumbers.includes(pageNo),
            current: pageNo === currentPage,
            locked: !isRevealed,
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
          future: page > currentPage,
          disabled: true,
        };
      }),
    [completedPageNumbers, currentPage, pageCount]
  );

  // 마운트 시 1회: pagePlan이 아직 AI로 보강된 적 없으면(옵션이 하나도 없으면) CREATE_PAGE_PLAN을 1번만 호출한다.
  // 공동창작실 진입/페이지 이동마다 다시 호출하지 않는다 — "다시 추천" 또는 최초 생성 실패 시에만 재호출한다.
  useEffect(() => {
    if (planRequestRef.current) return;
    planRequestRef.current = true;

    const alreadyEnriched = pagePlans.some(
      (plan) => Array.isArray(plan.options) && plan.options.length > 0
    );
    if (alreadyEnriched) return;

    (async () => {
      setIsGeneratingPlan(true);

      // 어떤 이유로 실패하든(네트워크 오류, 예상 못한 예외 포함) 로딩 상태는 반드시 풀려야
      // 화면이 멈추지 않는다 — finally에서 무조건 해제한다.
      try {
        const extra = {
          purpose: "CREATE_FAIRY_TALE_PAGE_PLAN",
          previousAnswers,
        };
        const response = await createPagePlan(setupData, extra);

        if (response.ok && isValidPagePlan(response.data, pageCount)) {
          const aiPages = getPagePlan(response.data);

          setPagePlans((prev) =>
            aiPages.map((aiPage) =>
              toLocalPagePlan(
                aiPage,
                prev.find((plan) => plan.pageNo === aiPage.pageNo)
              )
            )
          );
          setPlanFallbackNotice(false);
        } else {
          console.warn(
            "AI 페이지 계획 생성 실패. 기본 선택지로 진행합니다.",
            response.message
          );
          setPlanFallbackNotice(true);
        }
      } catch (error) {
        console.warn("AI 페이지 계획 생성 중 예외 발생. 기본 선택지로 진행합니다.", error);
        setPlanFallbackNotice(true);
      } finally {
        setIsGeneratingPlan(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecommendAgain = async () => {
    if (recommendGuardRef.current || isGeneratingPlan) return;

    recommendGuardRef.current = true;
    setIsRecommendingAgain(true);

    const pageNo = currentPage;
    const nextVersion = (pageRecommendationVersion[pageNo] || 0) + 1;

    // 어떤 이유로 실패하든(네트워크 오류, 예상 못한 예외 포함) 로딩 상태는 반드시 풀려야
    // 화면이 멈추지 않는다 — finally에서 무조건 해제한다.
    try {
      const extra = {
        purpose: "CREATE_FAIRY_TALE_PAGE_PLAN",
        regeneratePageNo: pageNo,
        existingPagePlan: pagePlans.map(toAiPageShape),
        previousAnswers,
        recommendationVersion: nextVersion,
      };

      const response = await createPagePlan(setupData, extra);
      const aiPages = response.ok && isValidPagePlan(response.data, pageCount)
        ? getPagePlan(response.data)
        : [];
      const updatedPage = aiPages.find((page) => page.pageNo === pageNo);

      if (updatedPage) {
        setPagePlans((prev) =>
          prev.map((plan) => (plan.pageNo === pageNo ? toLocalPagePlan(updatedPage, plan) : plan))
        );
        setPageFallbackNotice((prev) => ({ ...prev, [pageNo]: false }));
      } else {
        console.warn("AI 다시 추천 실패. 기존 선택지를 유지합니다.", response.message);
        setPageFallbackNotice((prev) => ({ ...prev, [pageNo]: true }));
      }

      setPageRecommendationVersion((prev) => ({ ...prev, [pageNo]: nextVersion }));
      setSelectedChoiceId(null);
      setCustomAnswer("");
    } catch (error) {
      console.warn("AI 다시 추천 중 예외 발생. 기존 선택지를 유지합니다.", error);
      setPageFallbackNotice((prev) => ({ ...prev, [pageNo]: true }));
    } finally {
      setIsRecommendingAgain(false);
      recommendGuardRef.current = false;
    }
  };

  // AI 재호출 없이, 이미 캐시된 pagePlan 안에서 선택/입력값만 반영하고 다음 페이지로 진행한다.
  // 직접 입력이 있으면(customAnswer) 선택한 옵션(chosenValue)보다 우선한다.
  const handleNextScene = () => {
    if (!selectedAnswer) return;

    const chosenValue = selectedChoice?.value;
    const hasCustomAnswer = Boolean(customAnswer.trim());

    const nextPagePlans = pagePlans.map((plan) => {
      if (plan.pageNo !== currentPage) return plan;

      return {
        ...plan,
        title: hasCustomAnswer
          ? makeFallbackTitle(selectedAnswer)
          : chosenValue?.sceneTitle || plan.title,
        summary: hasCustomAnswer ? customAnswer.trim() : chosenValue?.summary || plan.summary,
        selectedAnswer,
      };
    });

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
    const nextCompletedPageNumbers = completedPageNumbers.includes(currentPage)
      ? completedPageNumbers
      : [...completedPageNumbers, currentPage];

    setPagePlans(nextPagePlans);
    setCompletedPageNumbers(nextCompletedPageNumbers);
    setPreviousAnswers(nextPreviousAnswers);

    if (currentPage === pageCount) {
      const fairyTalePages = nextPagePlans.map((plan) => ({
        pageNo: plan.pageNo,
        title: plan.title,
        sceneTitle: plan.title,
        summary: plan.summary || "",
        body: plan.body || plan.summary || "",
        selectedAnswer: plan.selectedAnswer || "",
        status: nextCompletedPageNumbers.includes(plan.pageNo) ? "DONE" : "WAITING",
      }));

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

    setCurrentPage((prev) => prev + 1);
    setPreviewPage((prev) => Math.min(prev + 1, pageCount));
    setSelectedChoiceId(null);
    setCustomAnswer("");
  };

  // 선택형(CHOICE)은 버튼 선택만으로 완성하는 모드라 직접 입력란이 없어야 한다.
  // MIXED(선택+입력형)만 직접 입력을 허용한다.
  const allowCustomAnswer = setupData.interactionMode !== "CHOICE";

  return {
    outlineData,
    choices,
    choiceQuestion,
    choiceGuide,
    selectedChoiceId,
    setSelectedChoiceId,
    customAnswer,
    setCustomAnswer,
    allowCustomAnswer,
    currentPage,
    pageCount,
    isPreviewOpen,
    setIsPreviewOpen,
    previewPage,
    setPreviewPage,
    pageButtons,
    isLoadingChoiceStep,
    isGeneratingPlan,
    isRecommendingAgain,
    canCreateNextScene,
    completedPageNumbers,
    pagePlans,
    showFallbackNotice,
    showNoOptionsNotice,
    handleNextScene,
    handleRecommendAgain,
  };
}
