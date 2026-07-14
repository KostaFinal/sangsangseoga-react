import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createScenePlan,
  extractGeneratedScenes,
  extractGeneratedText,
  writeScene,
  writeSceneSegment,
} from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  createInitialScenes,
  fallbackSetting,
  INDEPENDENT_WRITER_LEVELS,
  independentBasicActions,
  independentMoreActions,
  independentPrimaryAction,
} from "../data/novelWritingEditorOptions";

const ALL_INDEPENDENT_ACTIONS = [
  independentPrimaryAction.empty,
  independentPrimaryAction.filled,
  ...independentBasicActions,
  ...independentMoreActions,
];

// 빈 줄(\n\n) 기준으로 문단을 나누고, 없으면 한 줄 단위로 대체한다.
const splitParagraphs = (body) => {
  if (!body) return [];
  const blocks = body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  return body.split("\n").map((line) => line.trim()).filter(Boolean);
};

// 커서 위치(pos)가 포함된 문단의 텍스트와 본문 내 시작/끝 인덱스를 찾는다.
const findParagraphAt = (body, pos) => {
  if (!body) return { text: "", start: 0, end: 0 };

  const paragraphs = splitParagraphs(body);
  let cursor = 0;

  for (const paragraph of paragraphs) {
    const start = body.indexOf(paragraph, cursor);
    if (start === -1) continue;
    const end = start + paragraph.length;

    if (pos >= start && pos <= end) {
      return { text: paragraph, start, end };
    }

    cursor = end;
  }

  const last = paragraphs[paragraphs.length - 1] || "";
  const lastStart = last ? body.lastIndexOf(last) : body.length;

  return { text: last, start: lastStart, end: lastStart + last.length };
};

export function useNovelWritingEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  const setting = location.state || fallbackSetting;
  const isIndependentWritingLevel = INDEPENDENT_WRITER_LEVELS.includes(
    setting.writerLevel
  );
  const isGuidedWritingLevel = !isIndependentWritingLevel;

  // CREATE_SCENE_PLAN은 sceneNo/sceneTitle/sceneGoal처럼 이 화면과 다른 필드명을 쓰고,
  // 본문(content)은 아예 생성하지 않는다(장면별 본문은 이후 "AI 초안"/"다음 문단 제안"으로 따로 쓴다).
  const normalizeAiScenes = (aiScenes, fallbackScenes) =>
    aiScenes.map((scene, index) => ({
      id: scene.sceneNo || scene.id || fallbackScenes[index]?.id || index + 1,
      phase: scene.phase || fallbackScenes[index]?.phase || "",
      title: scene.sceneTitle || scene.title || fallbackScenes[index]?.title || "",
      goal: scene.sceneGoal || scene.goal || fallbackScenes[index]?.goal || "",
      status: "미작성",
      content: "",
    }));

  const [scenes, setScenes] = useState(() => createInitialScenes(setting));
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState("");
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [assistSuggestion, setAssistSuggestion] = useState(null);
  const [isAssisting, setIsAssisting] = useState(false);
  const [assistError, setAssistError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncScenePlan = async () => {
      const response = await createScenePlan(
        {
          ...setting,
          bookType: "NOVEL",
          scenes,
        },
        {
          sceneCount: scenes.length,
        }
      );
      const aiScenes = response.ok ? extractGeneratedScenes(response.data) : [];

      if (isMounted && aiScenes.length) {
        setScenes((prev) => normalizeAiScenes(aiScenes, prev));
        setCurrentSceneId(aiScenes[0].sceneNo || aiScenes[0].id || 1);
      }
    };

    syncScenePlan();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentScene = useMemo(
    () => scenes.find((scene) => scene.id === currentSceneId) || scenes[0],
    [scenes, currentSceneId]
  );

  const currentSceneIndex = scenes.findIndex(
    (scene) => scene.id === currentSceneId
  );

  const updateCurrentScene = (field, value) => {
    if (!currentScene) return;

    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === currentSceneId
          ? {
              ...scene,
              [field]: value,
              status: value.trim() ? "수정 중" : scene.status,
            }
          : scene
      )
    );
  };

  const handleTextareaSelect = (e) => {
    const { selectionStart, selectionEnd, value } = e.currentTarget;

    setSelectionRange({ start: selectionStart, end: selectionEnd });
    setSelectedSentence(
      selectionStart === selectionEnd
        ? ""
        : value.substring(selectionStart, selectionEnd)
    );
  };

  const handleNextScene = () => {
    if (currentSceneIndex < 0) return;

    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneId(scenes[currentSceneIndex + 1].id);
      setAssistSuggestion(null);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex < 0) return;

    if (currentSceneIndex > 0) {
      setCurrentSceneId(scenes[currentSceneIndex - 1].id);
      setAssistSuggestion(null);
    }
  };

  const handleAiAction = async (type) => {
    if (!currentScene) return;

    const baseContent = currentScene.content || "";

    if (type === "continue") {
      const response = await writeScene(
        {
          ...setting,
          bookType: "NOVEL",
          scenes,
        },
        {
          scene: currentScene,
          sceneIndex: currentSceneIndex,
        }
      );
      const generatedText = response.ok ? extractGeneratedText(response.data) : "";
      const aiScenes = response.ok ? extractGeneratedScenes(response.data) : [];

      if (aiScenes.length) {
        setScenes((prev) => normalizeAiScenes(aiScenes, prev));
        return;
      }

      if (generatedText) {
        updateCurrentScene("content", generatedText);
        return;
      }

      if (!response.ok) {
        console.warn("WRITE_SCENE failed:", response.message);
      }

      updateCurrentScene(
        "content",
        `${baseContent}

나는 그 순간, 이 일이 단순한 이상 현상이 아니라는 것을 알았다. 사라진 별의 자리에는 검은 균열처럼 보이는 어둠이 남아 있었고, 그 어둠은 마치 나를 바라보는 눈처럼 조용히 흔들리고 있었다.`
      );
      return;
    }

    if (type === "tone") {
      alert("문체 수정 기능은 이후 AI API와 연결하면 됩니다.");
      return;
    }

    if (type === "rewrite") {
      alert("장면 다시쓰기 기능은 이후 AI API와 연결하면 됩니다.");
      return;
    }

    if (type === "check") {
      alert("개연성 검사 기능은 이후 AI API와 연결하면 됩니다.");
    }
  };

  // 청소년/성인(창작 보조 모드) 전용. 우선순위: 선택한 텍스트 > 커서가 있는 문단 > 본문 마지막 문단.
  const resolveAssistContext = () => {
    const trimmedSelection = selectedSentence.trim();

    if (trimmedSelection) {
      return {
        selectedText: trimmedSelection,
        currentParagraph: "",
        paragraphRange: null,
        usedSelectionRange: selectionRange,
      };
    }

    const body = currentScene?.content || "";
    const paragraphInfo = findParagraphAt(body, selectionRange.start);

    return {
      selectedText: "",
      currentParagraph: paragraphInfo.text,
      paragraphRange: { start: paragraphInfo.start, end: paragraphInfo.end },
      usedSelectionRange: null,
    };
  };

  const handleAssistAction = async (actionType) => {
    if (!currentScene) return;

    const config = ALL_INDEPENDENT_ACTIONS.find(
      (action) => action.actionType === actionType
    );
    if (!config) return;

    if (config.requiresSelection && !selectedSentence.trim()) return;

    setIsAssisting(true);
    setAssistError(false);

    const context = resolveAssistContext();

    const response = await writeSceneSegment(
      {
        ...setting,
        bookType: "NOVEL",
        scenes,
      },
      {
        actionType,
        currentSceneNo: currentScene.id,
        sceneTitle: currentScene.title,
        sceneGoal: currentScene.goal,
        currentBody: currentScene.content || "",
        currentParagraph: context.currentParagraph,
        selectedText: context.selectedText,
      }
    );

    // Spring 응답은 { success, data: { bookId, stage, result: <Python envelope> } } 형태이고,
    // Python envelope 자체의 result가 { actionType, targetScope, suggestedText }를 담고 있다.
    const pythonEnvelope = response.ok ? response.data?.data?.result : null;
    const result = pythonEnvelope?.result;
    const suggestedText = result?.suggestedText || "";

    setIsAssisting(false);

    if (!suggestedText) {
      setAssistError(true);
      if (!response.ok) {
        console.warn("WRITE_SCENE_SEGMENT failed:", response.message);
      }
      return;
    }

    setAssistSuggestion({
      actionType,
      insertionMode: config.insertionMode,
      targetScope: result?.targetScope || "",
      text: suggestedText,
      context,
    });
  };

  const handleRegenerateSuggestion = () => {
    if (!assistSuggestion) return;
    handleAssistAction(assistSuggestion.actionType);
  };

  const handleCancelSuggestion = () => {
    setAssistSuggestion(null);
    setAssistError(false);
  };

  // mode: "insertEmpty" | "append" | "replaceSelection" | "replaceParagraph"
  const handleApplySuggestion = (mode) => {
    if (!assistSuggestion || !currentScene) return;

    const body = currentScene.content || "";
    const { text, context } = assistSuggestion;
    let nextBody = body;

    if (mode === "insertEmpty") {
      nextBody = text;
    } else if (mode === "append") {
      nextBody = body ? `${body}\n\n${text}` : text;
    } else if (mode === "replaceSelection" && context.usedSelectionRange) {
      const { start, end } = context.usedSelectionRange;
      nextBody = `${body.slice(0, start)}${text}${body.slice(end)}`;
    } else if (mode === "replaceParagraph" && context.paragraphRange) {
      const { start, end } = context.paragraphRange;
      nextBody = `${body.slice(0, start)}${text}${body.slice(end)}`;
    } else {
      nextBody = body ? `${body}\n\n${text}` : text;
    }

    updateCurrentScene("content", nextBody);
    setAssistSuggestion(null);
    setSelectedSentence("");
    setSelectionRange({ start: 0, end: 0 });
  };

  const handleComplete = () => {
    if (!scenes.length) return;

    const payload = {
      bookType: "NOVEL",
      setting,
      scenes,
    };

    console.log("표지 선택 화면으로 이동:", payload);

    navigate(BOOK_CREATION_ROUTES.NOVEL.COVER, {
      state: payload,
    });
  };

  return {
    setting,
    isGuidedWritingLevel,
    isIndependentWritingLevel,
    scenes,
    currentSceneId,
    setCurrentSceneId,
    selectedSentence,
    currentScene,
    currentSceneIndex,
    updateCurrentScene,
    handleTextareaSelect,
    handleNextScene,
    handlePrevScene,
    handleAiAction,
    handleComplete,
    assistSuggestion,
    isAssisting,
    assistError,
    handleAssistAction,
    handleRegenerateSuggestion,
    handleCancelSuggestion,
    handleApplySuggestion,
  };
}
