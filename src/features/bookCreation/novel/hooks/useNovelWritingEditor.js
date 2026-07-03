import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createScenePlan,
  extractGeneratedScenes,
  extractGeneratedText,
  writeScene,
} from "../../services/aiGenerateService";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import {
  createInitialScenes,
  fallbackSetting,
} from "../data/novelWritingEditorOptions";

export function useNovelWritingEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  const setting = location.state || fallbackSetting;
  const normalizeAiScenes = (aiScenes, fallbackScenes) =>
    aiScenes.map((scene, index) => ({
      ...fallbackScenes[index],
      ...scene,
      id: scene.id || fallbackScenes[index]?.id || index + 1,
      status: scene.status || fallbackScenes[index]?.status || "초안",
      content: scene.content || scene.body || scene.text || fallbackScenes[index]?.content || "",
    }));

  const [scenes, setScenes] = useState(() => createInitialScenes(setting));
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState("");

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
        setCurrentSceneId(aiScenes[0].id || 1);
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

  const handleAddScene = () => {
    const nextId = scenes.length + 1;

    const newScene = {
      id: nextId,
      phase: "추가 장면",
      title: `새 장면 ${nextId}`,
      goal: "새로운 장면의 목표를 입력해 주세요.",
      status: "미작성",
      content: "",
    };

    setScenes((prev) => [...prev, newScene]);
    setCurrentSceneId(nextId);
  };

  const handleSave = () => {
    const savedData = {
      setting,
      scenes,
      savedAt: new Date().toISOString(),
    };

    console.log("저장된 소설 원고:", savedData);
    alert("임시 저장되었습니다. 콘솔에서 데이터를 확인할 수 있어요.");
  };

  const handleNextScene = () => {
    if (currentSceneIndex < 0) return;

    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneId(scenes[currentSceneIndex + 1].id);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex < 0) return;

    if (currentSceneIndex > 0) {
      setCurrentSceneId(scenes[currentSceneIndex - 1].id);
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

  const handleComplete = () => {
    if (!scenes.length) return;

    const payload = {
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
    scenes,
    currentSceneId,
    setCurrentSceneId,
    selectedSentence,
    setSelectedSentence,
    currentScene,
    currentSceneIndex,
    updateCurrentScene,
    handleAddScene,
    handleSave,
    handleNextScene,
    handlePrevScene,
    handleAiAction,
    handleComplete,
  };
}
