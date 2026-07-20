import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  createPagePlan,
  extractGeneratedPages,
  rewritePage,
  writePage,
} from "../../services/aiGenerateService";
import {
  CHAT_HELP_ACTIONS,
  DEFAULT_SETTING,
  QUICK_ACTIONS,
  makeInitialPages,
  makePageText,
} from "../data/fairyTaleChatWritingOptions";
import {
  getEditSummary,
  getNextQuestion,
  getPageBody,
  getPageBodyEn,
  isValidPageBody,
} from "../utils/aiSettingOptions";

// 톤 변경 버튼 → REWRITE_PAGE의 editRequest. rewrite_page.txt가 이미 이 카테고리들을 지원한다.
const TONE_EDIT_REQUEST = {
  쉽게: "더 쉽게",
  따뜻하게: "더 따뜻하게",
  짧게: "더 짧게",
};

const toAiOutlinePage = (page) => ({
  pageNo: page.pageNo,
  phase: page.phase || "",
  sceneTitle: page.sceneTitle || "",
  sceneSummary: page.sceneSummary || "",
  mainEmotion: page.mainEmotion || "",
  imagePromptBase: page.imagePromptBase || "",
});

const toAiWrittenPage = (page) => ({
  pageNo: page.pageNo,
  sceneTitle: page.sceneTitle || "",
  bodyText: page.body || "",
  summary: page.sceneSummary || "",
});

export function useFairyTaleChatWriting() {
  const navigate = useNavigate();
  const location = useLocation();

  const setting = location.state?.fairyTaleSetting || DEFAULT_SETTING;
  const setupData = location.state || {};
  const pageCount = Number(setting.pageCount) || 16;

  const [pages, setPages] = useState(() => {
    const incoming = location.state?.pagePlans || location.state?.fairyTalePages;
    return Array.isArray(incoming) && incoming.length ? incoming : makeInitialPages(pageCount);
  });
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [requestText, setRequestText] = useState("");
  const [chatNotes, setChatNotes] = useState([]);
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "기본설정을 바탕으로 한 페이지씩 동화를 완성해볼게요. 먼저 1페이지를 써볼까요?",
    },
  ]);
  // 장면 계획(sceneSummary 등)이 이미 있는 채로 들어온 경우(이전 화면에서 복귀 등)엔 계획을 다시 만들
  // 필요가 없다 - 최초 렌더 시점에 바로 계산해서 isGeneratingPlan 초기값에 반영해야, 아래 자동 글쓰기
  // useEffect가 "아직 계획 생성 중"인 걸 놓치고 계획이 오기도 전에 페이지를 써버리는 경합을 막을 수 있다.
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(
    () => !pages.some((page) => String(page.sceneSummary || "").trim())
  );
  const [isWorking, setIsWorking] = useState(false);
  const [usedFallbackNotice, setUsedFallbackNotice] = useState(false);

  const chatLogRef = useRef(null);
  const planRequestRef = useRef(false);
  const workGuardRef = useRef(false);

  useEffect(() => {
    if (!chatLogRef.current) return;

    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages]);

  // 마운트 시 1회: 이미 pagePlan(장면 계획)이 있으면 다시 생성하지 않는다.
  // 없을 때만 CREATE_PAGE_PLAN을 1번 호출해서 캐시한다(공동창작실과 동일한 가드 패턴).
  useEffect(() => {
    if (planRequestRef.current) return;
    planRequestRef.current = true;

    const alreadyEnriched = pages.some((page) => String(page.sceneSummary || "").trim());
    if (alreadyEnriched) return;

    (async () => {
      const response = await createPagePlan(
        { ...setupData, fairyTaleSetting: setting, fairyTalePages: pages },
        { pageCount }
      );
      const aiPages = response.ok ? extractGeneratedPages(response.data) : [];

      if (aiPages.length) {
        setPages((prev) =>
          prev.map((page, index) => {
            const aiPage = aiPages.find((item) => item.pageNo === page.pageNo) || aiPages[index];
            if (!aiPage) return page;

            return {
              ...page,
              phase: aiPage.phase || page.phase,
              sceneTitle: aiPage.sceneTitle || page.sceneTitle,
              sceneSummary: aiPage.sceneSummary || page.sceneSummary,
              mainEmotion: aiPage.mainEmotion || page.mainEmotion,
              imagePromptBase: aiPage.imagePromptBase || page.imagePromptBase,
              role: aiPage.sceneSummary || page.role,
            };
          })
        );
      } else {
        console.warn("AI 페이지 계획 생성 실패. 기본 장면 구성으로 진행합니다.", response.message);
      }

      setIsGeneratingPlan(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentPage = (fromPages) =>
    fromPages.find((page) => page.pageNo === currentPageNo) || fromPages[0];
  const currentPage = getCurrentPage(pages);

  const completedCount = pages.filter((page) => page.status === "DONE").length;

  const updateCurrentPage = (patch) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNo === currentPageNo
          ? {
              ...page,
              ...patch,
            }
          : page
      )
    );
  };

  const addAiMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "AI", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "USER", text }]);
  };

  const buildDraftInput = () => ({
    ...setupData,
    bookType: "FAIRY_TALE",
    fairyTaleSetting: setting,
    fairyTalePages: pages.filter((page) => page.body).map(toAiWrittenPage),
    outline: { pages: pages.map(toAiOutlinePage) },
  });

  // WRITE_PAGE(최초 작성)/REWRITE_PAGE(수정) 공용 실행 함수.
  const runPageAction = async ({ taskType, extra, fallbackTone }) => {
    if (workGuardRef.current) return;

    workGuardRef.current = true;
    setIsWorking(true);
    setUsedFallbackNotice(false);

    const draftInput = buildDraftInput();

    const response =
      taskType === "REWRITE_PAGE"
        ? await rewritePage(draftInput, extra)
        : await writePage(draftInput, extra);

    if (response.ok && isValidPageBody(response.data)) {
      const body = getPageBody(response.data);
      const bodyEn = getPageBodyEn(response.data);
      const nextQuestion = getNextQuestion(response.data);
      const editSummary = getEditSummary(response.data);

      updateCurrentPage({
        body,
        bodyEn: bodyEn || currentPage.bodyEn,
        status: "WRITING",
        nextQuestion: nextQuestion || currentPage.nextQuestion,
        teacherNote: editSummary || currentPage.teacherNote,
      });

      addAiMessage(
        nextQuestion ||
          (taskType === "REWRITE_PAGE"
            ? "요청하신 대로 다듬었어요."
            : `${currentPageNo}페이지 글을 작성했어요. 읽어보고 더 바꾸고 싶으면 말해 주세요.`)
      );

      setChatNotes([]);
      setIsWorking(false);
      workGuardRef.current = false;
      return true;
    }

    console.warn("AI 페이지 글쓰기 실패. 기본 문장으로 이어갑니다.", response.message);
    setUsedFallbackNotice(true);

    const fallbackBody = makePageText({
      page: currentPage,
      setting,
      tone: fallbackTone || "기본",
    });

    updateCurrentPage({ body: fallbackBody, status: "WRITING" });
    addAiMessage("AI 응답을 불러오지 못해 기본 문장으로 이어갈게요.");
    setIsWorking(false);
    workGuardRef.current = false;
    return false;
  };

  // "이 페이지 글쓰기" / "AI 선생님에게 다시 도움받기" — 지금까지 채팅으로 남긴 메모(chatNotes)를
  // extra.userInput으로 합쳐서 보낸다. 이게 "채팅에서 논의한 내용이 정리되어 반영"되는 지점이다.
  const handleWritePage = async () => {
    const userInput = chatNotes.length ? chatNotes.join("\n") : undefined;

    await runPageAction({
      taskType: "WRITE_PAGE",
      extra: { currentPageNo, userInput },
    });
  };

  // 현재 페이지에 아직 글이 없으면(처음 진입, 또는 "다음 페이지"로 넘어온 직후) "이 페이지 글쓰기"를
  // 누르지 않아도 자동으로 써준다. isGeneratingPlan이 끝나기 전에는 기다린다 - 장면 계획(제목/요약)이
  // 준비되기 전에 먼저 써버리면 내용이 부실해질 수 있어서다(isGeneratingPlan 초기값 계산 참고).
  useEffect(() => {
    if (isGeneratingPlan || isWorking || currentPage.body) return;

    handleWritePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageNo, isGeneratingPlan]);

  const handleQuickAction = async (action) => {
    if (!currentPage.body) {
      addAiMessage("먼저 현재 페이지 글을 작성한 뒤에 문장을 다듬을 수 있어요.");
      return;
    }

    addUserMessage(action.label);

    await runPageAction({
      taskType: "REWRITE_PAGE",
      extra: {
        currentPageNo,
        editRequest: TONE_EDIT_REQUEST[action.tone] || action.tone,
      },
      fallbackTone: action.tone,
    });
  };

  const handleChatHelp = async (action) => {
    addUserMessage(action.label);

    if (action.id === "direction") {
      addAiMessage(
        `${currentPageNo}페이지는 "${currentPage.sceneTitle}" 장면이에요. ${currentPage.role}이므로 앞 장면과 자연스럽게 이어지게 쓰면 좋아요.`
      );
      return;
    }

    if (action.id === "nextScene") {
      addAiMessage(
        currentPage.nextQuestion
          ? `다음 장면 힌트: ${currentPage.nextQuestion}`
          : `아직 다음 장면 힌트가 없어요. 먼저 "이 페이지 글쓰기"로 이번 페이지를 써보면 다음 힌트를 받을 수 있어요.`
      );
      return;
    }

    if (!currentPage.body) {
      addAiMessage("먼저 현재 페이지 글을 작성한 뒤에 이어쓰거나 다듬을 수 있어요.");
      return;
    }

    if (action.id === "continue") {
      await runPageAction({
        taskType: "REWRITE_PAGE",
        extra: {
          currentPageNo,
          editRequest: "현재 내용에 자연스럽게 이어지는 다음 문장을 덧붙여줘",
        },
      });
      return;
    }

    if (action.id === "explain") {
      await runPageAction({
        taskType: "REWRITE_PAGE",
        extra: { currentPageNo, editRequest: "더 쉽게" },
        fallbackTone: "쉽게",
      });
      return;
    }

    if (action.id === "emotion") {
      await runPageAction({
        taskType: "REWRITE_PAGE",
        extra: { currentPageNo, editRequest: "감정 더 넣기" },
      });
    }
  };

  const handleNextPage = () => {
    const nextPageNo = currentPageNo + 1;

    if (nextPageNo > pageCount) {
      addAiMessage("모든 페이지를 다 썼어요. 이제 이미지 만들기로 이동할 수 있어요.");
      return;
    }

    // "이 페이지 완성" 버튼이 없어졌으니, 글이 있는 페이지를 두고 다음으로 넘어가는 게
    // 곧 그 페이지를 완성 처리하는 것이다 - 완성 여부를 채팅에도 남겨서 예전 버튼이
    // 주던 피드백("~페이지를 완성했어요")이 사라지지 않게 한다.
    const justCompleted = currentPage.status !== "DONE" && Boolean(currentPage.body);

    setPages((prev) =>
      prev.map((page) => {
        if (page.pageNo === currentPageNo && page.status !== "DONE") {
          return {
            ...page,
            status: page.body ? "DONE" : "WAITING",
          };
        }

        if (page.pageNo === nextPageNo) {
          return {
            ...page,
            status: "WRITING",
          };
        }

        return page;
      })
    );

    setCurrentPageNo(nextPageNo);
    setChatNotes([]);

    addAiMessage(
      `${justCompleted ? `${currentPageNo}페이지를 완성했어요. ` : ""}${nextPageNo}페이지로 이동했어요. 앞 장면과 자연스럽게 이어서 써볼게요.`
    );
  };

  // 채팅은 그 자체로 AI를 부르지 않는다 — 메모만 쌓아두고, "이 페이지 글쓰기"/"다시 도움받기"를
  // 누를 때 한꺼번에 반영한다. 다만 물음표로 끝나는 "질문"이면, 매번 똑같은 "메모했어요!"만
  // 반복하는 대신 무엇을 물어봤는지 되짚어줘서 대화가 뚝 끊긴 것처럼 느껴지지 않게 한다.
  const handleSendRequest = (event) => {
    event.preventDefault();

    const trimmed = requestText.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setChatNotes((prev) => [...prev, trimmed]);

    const looksLikeQuestion = trimmed.endsWith("?");
    addAiMessage(
      looksLikeQuestion
        ? `"${trimmed}"에 대한 생각도 페이지 쓸 때 반영할게요!`
        : "메모했어요! \"이 페이지 글쓰기\" 또는 \"다시 도움받기\"를 누르면 지금까지 나눈 이야기를 반영해서 정리해드릴게요."
    );
    setRequestText("");
  };

  const handleShowSetting = () => {
    const lines = [
      `📖 이야기 씨앗: ${setting.storySeed || "미정"}`,
      `🧑 주인공: ${setting.protagonist || setting.protagonistName || "미정"}`,
      setting.protagonistDesc && `　${setting.protagonistDesc}`,
      `🏰 배경: ${setting.backgroundPlace || "미정"}`,
      `❓ 문제/목표: ${setting.problem || "미정"}`,
      `🎨 분위기: ${setting.mood || "미정"}`,
      `📚 페이지 수: ${setting.pageCount ? `${setting.pageCount}페이지` : "미정"}`,
      setting.title && `✏️ 제목: ${setting.title}`,
    ].filter(Boolean);

    addAiMessage(`지금까지 정한 기본설정을 알려드릴게요.\n${lines.join("\n")}`);
  };

  const handleSave = () => {
    console.log("저장할 페이지 데이터:", {
      ...setupData,
      pages,
    });

    addAiMessage("현재까지 작성한 동화 글을 저장했어요.");
  };

  const handleGoImageDesign = () => {
    navigate(BOOK_CREATION_ROUTES.FAIRY_TALE.IMAGES, {
      state: {
        ...setupData,
        fairyTaleSetting: setting,
        fairyTalePages: pages,
        pagePlans: pages,
      },
    });
  };

  return {
    QUICK_ACTIONS,
    CHAT_HELP_ACTIONS,
    setting,
    pageCount,
    pages,
    currentPageNo,
    requestText,
    setRequestText,
    messages,
    chatLogRef,
    currentPage,
    completedCount,
    isGeneratingPlan,
    isWorking,
    usedFallbackNotice,
    chatNotesCount: chatNotes.length,
    handleWritePage,
    handleQuickAction,
    handleChatHelp,
    handleNextPage,
    handleSendRequest,
    handleShowSetting,
    handleSave,
    handleGoImageDesign,
  };
}
