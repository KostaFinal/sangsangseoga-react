import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  createPagePlan,
  extractGeneratedPages,
  extractGeneratedText,
  writePage,
} from "../../services/aiGenerateService";
import {
  CHAT_HELP_ACTIONS,
  DEFAULT_SETTING,
  QUICK_ACTIONS,
  makeInitialPages,
  makePageText,
} from "../data/fairyTaleChatWritingOptions";

export function useFairyTaleChatWriting() {
  const navigate = useNavigate();
  const location = useLocation();

  const setting = location.state?.fairyTaleSetting || DEFAULT_SETTING;
  const setupData = location.state || {};
  const pageCount = Number(setting.pageCount) || 16;

  const [pages, setPages] = useState(() => makeInitialPages(pageCount));
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [requestText, setRequestText] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "기본설정을 바탕으로 한 페이지씩 동화를 완성해볼게요. 먼저 1페이지를 써볼까요?",
    },
  ]);
  const chatLogRef = useRef(null);

  useEffect(() => {
    if (!chatLogRef.current) return;

    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const syncPagePlan = async () => {
      const response = await createPagePlan(
        {
          ...setupData,
          fairyTaleSetting: setting,
          fairyTalePages: pages,
        },
        {
          pageCount,
        }
      );
      const aiPages = response.ok ? extractGeneratedPages(response.data) : [];

      if (isMounted && aiPages.length) {
        setPages((prev) =>
          aiPages.map((page, index) => ({
            ...prev[index],
            ...page,
            pageNo: page.pageNo || prev[index]?.pageNo || index + 1,
            status: page.status || prev[index]?.status || "WAITING",
          }))
        );
      }
    };

    syncPagePlan();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentPage = useMemo(() => {
    return pages.find((page) => page.pageNo === currentPageNo) || pages[0];
  }, [pages, currentPageNo]);

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
    setMessages((prev) => [
      ...prev,
      {
        sender: "AI",
        text,
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "USER",
        text,
      },
    ]);
  };

  const handleWritePage = async () => {
    let body = makePageText({
      page: currentPage,
      setting,
      tone: "기본",
    });
    const response = await writePage(
      {
        ...setupData,
        fairyTaleSetting: setting,
        fairyTalePages: pages,
      },
      {
        page: currentPage,
        pageNo: currentPageNo,
      }
    );

    if (response.ok) {
      body = extractGeneratedText(response.data) || body;
    } else {
      console.warn("WRITE_PAGE failed:", response.message);
    }

    updateCurrentPage({
      body,
      status: "WRITING",
      teacherNote: "AI 선생님이 이번 페이지 글을 작성했어요. 마음에 들면 페이지를 완성해 주세요.",
    });

    addAiMessage(`${currentPageNo}페이지 글을 작성했어요. 읽어보고 분위기나 문장을 더 바꾸고 싶으면 말해 주세요.`);
  };

  const handleQuickAction = (action) => {
    if (!currentPage.body) {
      addAiMessage("먼저 현재 페이지 글을 작성한 뒤에 문장을 다듬을 수 있어요.");
      return;
    }

    const body = makePageText({
      page: currentPage,
      setting,
      tone: action.tone,
    });

    updateCurrentPage({
      body,
      teacherNote: action.teacherText,
    });

    addUserMessage(action.label);
    addAiMessage(action.teacherText);
  };

  const handleChatHelp = (action) => {
    addUserMessage(action.label);

    if (action.id === "direction") {
      addAiMessage(
        `${currentPageNo}페이지는 "${currentPage.sceneTitle}" 장면이에요. ${
          currentPage.role
        }이므로 앞 장면과 자연스럽게 이어지게 쓰면 좋아요.`
      );
      return;
    }

    if (action.id === "continue") {
      if (!currentPage.body) {
        const body = makePageText({
          page: currentPage,
          setting,
          tone: "기본",
        });

        updateCurrentPage({
          body,
          status: "WRITING",
          teacherNote:
            "AI 선생님이 현재 페이지 글을 이어서 작성했어요. 마음에 들면 다음 페이지로 넘어가도 좋아요.",
        });

        addAiMessage("좋아요. 현재 페이지 글을 이어서 작성했어요.");
        return;
      }

      const continuedText = `${currentPage.body}

  루루는 잠시 멈춰 서서 주변을 둘러보았어요.
  작은 빛들이 길을 알려주듯 반짝였고, 루루는 다시 용기를 내어 앞으로 걸어갔어요.`;

      updateCurrentPage({
        body: continuedText,
        teacherNote: "앞 문장과 자연스럽게 이어지도록 내용을 덧붙였어요.",
      });

      addAiMessage("좋아요. 앞 문장과 자연스럽게 이어지는 문장을 추가했어요.");
      return;
    }

    if (action.id === "explain") {
      addAiMessage(
        `쉽게 말하면, ${currentPageNo}페이지는 "${currentPage.sceneTitle}" 장면이에요. 이 장면에서는 주인공이 무엇을 보고, 어떤 마음이 들었는지를 분명하게 보여주면 좋아요.`
      );
      return;
    }

    if (action.id === "emotion") {
      updateCurrentPage({
        teacherNote:
          "주인공의 두근거림, 걱정, 용기 같은 감정을 더 넣으면 장면이 살아나요.",
      });

      addAiMessage(
        "좋아요. 이 장면에는 주인공의 마음을 더 넣으면 좋아요. 예를 들면 ‘무섭지만 궁금했어요’, ‘가슴이 콩콩 뛰었어요’ 같은 표현을 사용할 수 있어요."
      );
      return;
    }

    if (action.id === "nextScene") {
      addAiMessage(
        `다음 장면에서는 ${currentPage.sceneTitle} 이후에 주인공이 작은 단서를 발견하거나, 새로운 친구를 만나는 방향이 좋아요.`
      );
    }
  };

  const handleCompletePage = () => {
    if (!currentPage.body) {
      addAiMessage("아직 작성된 글이 없어요. 먼저 이 페이지 글을 작성해볼게요.");
      handleWritePage();
      return;
    }

    updateCurrentPage({
      status: "DONE",
    });

    addAiMessage(`${currentPageNo}페이지를 완성했어요. 다음 페이지도 이어서 써볼 수 있어요.`);
  };

  const handleNextPage = () => {
    const nextPageNo = currentPageNo + 1;

    if (nextPageNo > pageCount) {
      addAiMessage("모든 페이지를 다 썼어요. 이제 이미지 만들기로 이동할 수 있어요.");
      return;
    }

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

    addAiMessage(`${nextPageNo}페이지로 이동했어요. 앞 장면과 자연스럽게 이어서 써볼게요.`);
  };

  const handleSendRequest = (event) => {
    event.preventDefault();

    const trimmed = requestText.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);

    if (!currentPage.body) {
      const body = makePageText({
        page: currentPage,
        setting,
        tone: "기본",
      });

      updateCurrentPage({
        body,
        status: "WRITING",
        teacherNote: "요청을 참고해서 현재 페이지 글을 작성했어요.",
      });

      addAiMessage("좋아요. 요청을 참고해서 현재 페이지 글을 작성했어요.");
    } else {
      updateCurrentPage({
        teacherNote: "요청을 반영해서 문장 분위기와 흐름을 다시 다듬었어요.",
      });

      addAiMessage("좋아요. 요청을 반영해서 현재 페이지를 다시 다듬었어요.");
    }

    setRequestText("");
  };

  const handleShowSetting = () => {
    addAiMessage(
      `현재 기본설정은 "${setting.storySeed}"이고, 주인공은 "${setting.protagonist}", 배경은 "${setting.backgroundPlace}"이에요.`
    );
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
    handleWritePage,
    handleQuickAction,
    handleChatHelp,
    handleCompletePage,
    handleNextPage,
    handleSendRequest,
    handleShowSetting,
    handleSave,
    handleGoImageDesign,
  };
}
