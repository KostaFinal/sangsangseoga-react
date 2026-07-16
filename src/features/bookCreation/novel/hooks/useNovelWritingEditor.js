import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createScenePlan,
  extractGeneratedScenes,
  extractGeneratedText,
  extractGeneratedTextEn,
  extractGeneratedTitleEn,
  rewriteScene,
  translateText,
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

  // 표지 선택 화면에서 "이전으로"로 되돌아온 경우, setting에 이미 작성해둔 scenes가 같이
  // 실려온다. 이때는 처음 진입처럼 AI 장면 계획을 새로 만들지 않고 그대로 복원해서 이어 쓴다.
  const incomingScenes = Array.isArray(setting.scenes) && setting.scenes.length
    ? setting.scenes
    : null;

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
      // contentEn/titleEn: content(본문)·title(소제목)의 영어 번역. ...SyncedWith에는 마지막으로
      // 번역했을 때의 값을 저장해뒀다가, 지금 값과 다르면 번역이 오래된 것으로 보고
      // "다음 장면"으로 넘어갈 때 다시 번역한다(ensureCurrentSceneTranslated 참고).
      contentEn: "",
      contentEnSyncedWith: "",
      titleEn: "",
      titleEnSyncedWith: "",
    }));

  const [scenes, setScenes] = useState(() => incomingScenes || createInitialScenes(setting));
  const [currentSceneId, setCurrentSceneId] = useState(() => (incomingScenes ? incomingScenes[0].id : 1));
  const [selectedSentence, setSelectedSentence] = useState("");
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [assistSuggestion, setAssistSuggestion] = useState(null);
  const [isAssisting, setIsAssisting] = useState(false);
  const [assistError, setAssistError] = useState(false);
  // scenes 초기값은 createInitialScenes()가 만든 하드코딩 예시 본문이라, AI 응답이 오기 전까지
  // 그대로 보여주면 사용자가 이걸 실제 생성 결과로 착각한다. 로딩 중에는 화면 자체를 가려서 헷갈리지 않게 한다.
  // 단, 이미 작성된 장면(incomingScenes)을 복원하는 경우엔 AI를 다시 부르지 않으니 로딩할 필요가 없다.
  const [isLoadingScenes, setIsLoadingScenes] = useState(!incomingScenes);
  const [isTranslatingScene, setIsTranslatingScene] = useState(false);
  // 가이드 모드의 AI 초안/문체 수정/다시쓰기/개연성 검사가 진행 중일 때 관련 버튼을 전부 잠근다.
  const [isProcessingAiAction, setIsProcessingAiAction] = useState(false);

  // StrictMode 개발 모드의 마운트→언마운트→재마운트 이중 실행 때문에 CREATE_SCENE_PLAN
  // 요청이 두 번 나가지 않도록, "응답을 반영할지"가 아니라 "요청 자체를 보낼지"를 ref로 막는다.
  const scenePlanRequestedRef = useRef(false);

  useEffect(() => {
    // 이미 작성된 장면을 복원한 경우엔 AI 장면 계획을 다시 만들 필요가 없다.
    if (incomingScenes) return;

    if (scenePlanRequestedRef.current) return;
    scenePlanRequestedRef.current = true;

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

      if (aiScenes.length) {
        setScenes((prev) => normalizeAiScenes(aiScenes, prev));
        setCurrentSceneId(aiScenes[0].sceneNo || aiScenes[0].id || 1);
      }

      setIsLoadingScenes(false);
    };

    syncScenePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 장면을 이동/추가/삭제할 때, 이전 장면에서 선택했던 문장과 AI 제안이 그대로 남아있지
  // 않도록 초기화한다.
  const resetSelectionAndSuggestion = () => {
    setSelectedSentence("");
    setSelectionRange({ start: 0, end: 0 });
    setAssistSuggestion(null);
  };

  // 지금 장면의 content(본문)나 title(소제목)이 아직 번역 안 됐거나, 마지막 번역 이후 사용자가
  // 고쳐서 오래된 번역이 됐으면("다시쓰기" 아니라 "다음 장면"으로 넘어가는 시점에) TRANSLATE_TEXT를
  // 한 번 호출해 본문+소제목을 함께 채운다. 실패해도 다음 장면 이동은 막지 않는다 — 대신 어떤
  // 장면(sceneId)에서 왜 실패했는지 로그로 남겨서 조용히 넘어가지 않게 한다.
  // scenesSnapshot을 받아 갱신된 배열을 그대로 반환해서, 호출부가 setScenes 이후의 React
  // 재렌더링을 기다리지 않고도(state는 비동기라 바로 반영 안 됨) 최신 값을 이어서 쓸 수 있다.
  // publish 시점(novelPageSplitter)에서 이 캐시가 최신인지 다시 확인하고, 아니면 그때 재번역하므로
  // 여기서 실패해도 최종 발행 결과에는 영향이 없다 — 이건 어디까지나 지연 시간을 줄이기 위한 선반영이다.
  const ensureCurrentSceneTranslated = async (scenesSnapshot) => {
    const scene = scenesSnapshot.find((item) => item.id === currentSceneId);
    if (!scene) return scenesSnapshot;

    const content = scene.content || "";
    const title = scene.title || "";
    const contentInSync = !content.trim() || (scene.contentEn && scene.contentEnSyncedWith === content);
    const titleInSync = !title.trim() || (scene.titleEn && scene.titleEnSyncedWith === title);
    if (contentInSync && titleInSync) return scenesSnapshot;

    setIsTranslatingScene(true);

    let contentEn = "";
    let titleEn = "";
    try {
      const protagonistName = setting.protagonist?.split(",")[0] || "";
      const response = await translateText(content, {
        protagonistName,
        ...(title.trim() ? { titleKo: title } : {}),
      });

      if (response.ok) {
        contentEn = extractGeneratedTextEn(response.data);
        titleEn = extractGeneratedTitleEn(response.data);
      } else {
        console.error(
          `[novel editor] 장면 번역 실패 - sceneId=${scene.id}: ${response.message}`
        );
      }
    } catch (error) {
      console.error(`[novel editor] 장면 번역 중 예외 발생 - sceneId=${scene.id}:`, error);
    } finally {
      setIsTranslatingScene(false);
    }

    const updatedScenes = scenesSnapshot.map((item) =>
      item.id === currentSceneId
        ? {
            ...item,
            contentEn: contentEn || item.contentEn || "",
            contentEnSyncedWith: contentEn ? content : item.contentEnSyncedWith,
            titleEn: titleEn || item.titleEn || "",
            titleEnSyncedWith: titleEn ? title : item.titleEnSyncedWith,
          }
        : item
    );

    setScenes(updatedScenes);
    return updatedScenes;
  };

  const handleNextScene = async () => {
    if (currentSceneIndex < 0) return;
    if (currentSceneIndex >= scenes.length - 1) return;

    const updatedScenes = await ensureCurrentSceneTranslated(scenes);
    const nextScene = updatedScenes[currentSceneIndex + 1];

    setCurrentSceneId(nextScene.id);
    resetSelectionAndSuggestion();
  };

  const handlePrevScene = () => {
    if (currentSceneIndex < 0) return;

    if (currentSceneIndex > 0) {
      setCurrentSceneId(scenes[currentSceneIndex - 1].id);
      resetSelectionAndSuggestion();
    }
  };

  // 새 빈 장면을 맨 뒤에 추가하고 바로 그 장면으로 이동한다.
  const handleAddScene = () => {
    const newId = scenes.length ? Math.max(...scenes.map((scene) => scene.id)) + 1 : 1;

    const newScene = {
      id: newId,
      phase: "",
      title: "새 장면",
      goal: "",
      status: "미작성",
      content: "",
      contentEn: "",
      contentEnSyncedWith: "",
      titleEn: "",
      titleEnSyncedWith: "",
    };

    setScenes((prev) => [...prev, newScene]);
    setCurrentSceneId(newId);
    resetSelectionAndSuggestion();
  };

  // 장면을 삭제한다. 최소 1개는 남아야 하므로 마지막 남은 장면은 삭제하지 않는다.
  // 지금 보고 있던 장면을 지운 경우, 그 자리(또는 그 앞) 장면으로 자동 이동한다.
  const handleDeleteScene = (sceneId) => {
    if (scenes.length <= 1) return;

    const deletingIndex = scenes.findIndex((scene) => scene.id === sceneId);
    if (deletingIndex === -1) return;

    const nextScenes = scenes.filter((scene) => scene.id !== sceneId);

    if (sceneId === currentSceneId) {
      const fallbackIndex = Math.min(deletingIndex, nextScenes.length - 1);
      setCurrentSceneId(nextScenes[fallbackIndex].id);
    }

    setScenes(nextScenes);
    resetSelectionAndSuggestion();
  };

  const handleAiAction = async (type) => {
    if (!currentScene) return;
    if (isProcessingAiAction) return;

    setIsProcessingAiAction(true);

    try {
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
        const generatedTextEn = response.ok ? extractGeneratedTextEn(response.data) : "";
        const aiScenes = response.ok ? extractGeneratedScenes(response.data) : [];

        if (aiScenes.length) {
          setScenes((prev) => normalizeAiScenes(aiScenes, prev));
          return;
        }

        if (generatedText) {
          // AI가 한글/영어를 같이 만들어줬으면 둘 다 "지금 막 번역된 상태"로 저장해서,
          // "다음 장면" 이동 시 ensureCurrentSceneTranslated가 또 번역하지 않게 한다.
          setScenes((prev) =>
            prev.map((scene) =>
              scene.id === currentSceneId
                ? {
                    ...scene,
                    content: generatedText,
                    contentEn: generatedTextEn || scene.contentEn || "",
                    contentEnSyncedWith: generatedTextEn ? generatedText : scene.contentEnSyncedWith,
                    status: "수정 중",
                  }
                : scene
            )
          );
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

      if (type === "rewrite") {
        // REWRITE_SCENE은 draft.scenes[].bodyText를 기준으로 기존 장면을 요청에 맞게 고친다.
        // 우리 scenes 상태는 본문을 content(한글)/contentEn(영어)로 들고 있어서, Python이
        // 기대하는 bodyText/bodyTextEn 이름으로도 같이 실어 보낸다.
        const scenesForRewrite = scenes.map((scene) => ({
          ...scene,
          sceneNo: scene.id,
          sceneTitle: scene.title,
          bodyText: scene.content || "",
          bodyTextEn: scene.contentEn || "",
        }));

        const response = await rewriteScene(
          {
            ...setting,
            bookType: "NOVEL",
            scenes: scenesForRewrite,
          },
          {
            currentSceneNo: currentScene.id,
            editRequest: "전체적으로 더 자연스럽고 매끄럽게 다시 써주세요.",
          }
        );

        const revisedText = response.ok ? extractGeneratedText(response.data) : "";
        const revisedTextEn = response.ok ? extractGeneratedTextEn(response.data) : "";

        if (revisedText) {
          setScenes((prev) =>
            prev.map((scene) =>
              scene.id === currentSceneId
                ? {
                    ...scene,
                    content: revisedText,
                    contentEn: revisedTextEn || scene.contentEn || "",
                    contentEnSyncedWith: revisedTextEn ? revisedText : scene.contentEnSyncedWith,
                    status: "수정 중",
                  }
                : scene
            )
          );
          return;
        }

        if (!response.ok) {
          console.warn("REWRITE_SCENE failed:", response.message);
        }
        alert("장면을 다시 쓰지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsProcessingAiAction(false);
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
    // Python envelope 자체의 result가 { actionType, targetScope, suggestedText, evaluation }를 담고 있다.
    const pythonEnvelope = response.ok ? response.data?.data?.result : null;
    const result = pythonEnvelope?.result;
    const suggestedText = result?.suggestedText || "";
    // evaluation: CHECK_SCENE_COHERENCE 전용 — 왜 이 제안을 하는지에 대한 평가 설명.
    // 다른 actionType은 항상 빈 문자열.
    const evaluation = result?.evaluation || "";

    setIsAssisting(false);

    if (!suggestedText) {
      // CHECK_SCENE_COHERENCE는 문제가 없으면 suggestedText 없이 evaluation만 올 수 있다.
      // 이 경우는 실패가 아니라 "괜찮다"는 정상 결과이므로 에러로 취급하지 않는다.
      if (actionType === "CHECK_SCENE_COHERENCE" && evaluation) {
        setAssistSuggestion({
          actionType,
          insertionMode: config.insertionMode,
          targetScope: result?.targetScope || "",
          text: "",
          evaluation,
          context,
        });
        return;
      }

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
      evaluation,
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

  const handleComplete = async () => {
    if (!scenes.length) return;

    // 마지막 장면은 handleNextScene을 거치지 않고 바로 여기로 오므로, 나가기 전에
    // 여기서도 한 번 번역 여부를 확인한다.
    const updatedScenes = await ensureCurrentSceneTranslated(scenes);

    const payload = {
      bookType: "NOVEL",
      setting,
      scenes: updatedScenes,
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
    isLoadingScenes,
    isTranslatingScene,
    isProcessingAiAction,
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
    handleAddScene,
    handleDeleteScene,
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
