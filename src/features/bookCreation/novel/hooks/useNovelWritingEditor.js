import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createInitialScenes,
  fallbackSetting,
} from "../data/novelWritingEditorOptions";

export function useNovelWritingEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  const setting = location.state || fallbackSetting;

  const [scenes, setScenes] = useState(() => createInitialScenes(setting));
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState("");

  const currentScene = useMemo(
    () => scenes.find((scene) => scene.id === currentSceneId) || scenes[0],
    [scenes, currentSceneId]
  );

  const currentSceneIndex = scenes.findIndex(
    (scene) => scene.id === currentSceneId
  );

  const updateCurrentScene = (field, value) => {
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
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneId(scenes[currentSceneIndex + 1].id);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneId(scenes[currentSceneIndex - 1].id);
    }
  };

  const handleAiAction = (type) => {
    const baseContent = currentScene.content || "";

    if (type === "continue") {
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
    const payload = {
      setting,
      scenes,
    };

    console.log("표지 선택 화면으로 이동:", payload);

    navigate("/bookmaker/novel/cover", {
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
