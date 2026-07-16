import { useState } from "react";

import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelWritingEditor } from "../hooks/useNovelWritingEditor";
import {
  independentBasicActions,
  independentMoreActions,
  independentPrimaryAction,
} from "../data/novelWritingEditorOptions";

const ALL_ASSIST_ACTIONS = [...independentBasicActions, ...independentMoreActions];
const findAssistAction = (actionType) =>
  ALL_ASSIST_ACTIONS.find((action) => action.actionType === actionType);

function NovelWritingEditorPage() {
  const {
    setting,
    isGuidedWritingLevel,
    isLoadingScenes,
    isTranslatingScene,
    isProcessingAiAction,
    scenes,
    currentSceneId,
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
  } = useNovelWritingEditor();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showFullSetting, setShowFullSetting] = useState(false);
  const isLastScene = scenes.length > 0 && currentSceneIndex === scenes.length - 1;
  const hasSelection = Boolean(selectedSentence.trim());

  const primaryAction = currentScene?.content?.trim()
    ? independentPrimaryAction.filled
    : independentPrimaryAction.empty;

  const resolveApplyMode = (insertionMode) => {
    if (insertionMode !== "replaceParagraphOrSelection") return insertionMode;
    return assistSuggestion?.context?.usedSelectionRange
      ? "replaceSelection"
      : "replaceParagraph";
  };

  const applyLabel = (insertionMode) => {
    const mode = resolveApplyMode(insertionMode);
    if (mode === "insertEmpty") return "적용";
    if (mode === "append") return "본문 뒤에 추가";
    if (mode === "replaceSelection") return "선택 영역과 교체";
    if (mode === "replaceParagraph") return "현재 문단과 교체";
    return "적용";
  };

  if (isLoadingScenes) {
    return (
      <div className="novel-editor-page">
        <img
          className="novel-editor-bg"
          src={scenarioBg}
          alt=""
          aria-hidden="true"
        />
        <div className="novel-editor-overlay" />

        <main className="novel-editor-loading-layout">
          <div className="novel-editor-loading-card">
            <div className="novel-editor-spinner" />
            <h1>AI가 장면을 만들고 있어요...</h1>
            <p>기획과 연출 회의 내용을 바탕으로 장면 목록과 초안을 준비하고 있어요.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="novel-editor-page">
        <img
          className="novel-editor-bg"
          src={scenarioBg}
          alt=""
          aria-hidden="true"
        />
        <div className="novel-editor-overlay" />

        <main className="novel-editor-layout">
          <section className="manuscript-panel">
            <div className="current-scene-info">
              <div>
                <span>현재 장면</span>
                <h1>장면 데이터를 불러오지 못했습니다.</h1>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="novel-editor-page">
      <img
        className="novel-editor-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-editor-overlay" />

      <main className="novel-editor-layout">
        <aside className="scene-list-panel">
          <div className="panel-title-row">
            <h2>장면 목록</h2>
          </div>

          <div className="scene-list">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`scene-item ${
                  scene.id === currentSceneId ? "active" : ""
                }`}
              >
                <div className="scene-item-head">
                  <strong>
                    {scene.id}. {scene.title}
                  </strong>
                  <span>{scene.phase}</span>
                </div>

                <p>{scene.goal}</p>

                <div className="scene-status-row">
                  <em className={scene.content?.trim() ? "draft" : "empty"}>
                    {scene.status}
                  </em>

                  <button
                    type="button"
                    className="scene-delete-btn"
                    onClick={() => handleDeleteScene(scene.id)}
                    disabled={scenes.length <= 1}
                    title={scenes.length <= 1 ? "마지막 장면은 삭제할 수 없어요." : "장면 삭제"}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="scene-add-btn" onClick={handleAddScene}>
            + 장면 추가
          </button>

          <div className="scene-help-card">
            <strong>AI가 기획과 연출 회의 내용을 바탕으로 장면 목록과 초안을 생성했어요.</strong>
            <p>필요에 따라 장면 제목, 목표, 본문을 자유롭게 수정하세요.</p>
          </div>
        </aside>

        <section className="manuscript-panel">
          <div className="current-scene-info">
            <div>
              <span>현재 장면</span>
              <h1>
                {currentScene.id}. {currentScene.title}
              </h1>
              <p>{currentScene.goal}</p>
            </div>

            <div className="scene-mood-card">
              <span>장면 분위기</span>
              <strong>{setting.directing?.mood || "미정"}</strong>
            </div>
          </div>

          <div className="editor-field">
            <label>장면 제목</label>
            <input
              type="text"
              maxLength={30}
              value={currentScene.title}
              onChange={(e) => updateCurrentScene("title", e.target.value)}
            />
            <small>{currentScene.title.length} / 30</small>
          </div>

          <div className="editor-field">
            <label>장면 목표</label>
            <input
              type="text"
              value={currentScene.goal}
              onChange={(e) => updateCurrentScene("goal", e.target.value)}
            />
          </div>

          <div className="editor-field manuscript-editor-field">
            <div className="editor-label-row">
              <label>본문</label>
              {isGuidedWritingLevel ? (
                <button
                  type="button"
                  onClick={() => handleAiAction("continue")}
                  disabled={isProcessingAiAction}
                >
                  {isProcessingAiAction ? "✦ 생성 중..." : "✦ AI 초안"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAssistAction(primaryAction.actionType)}
                  disabled={isAssisting}
                >
                  ✦ {primaryAction.label}
                </button>
              )}
            </div>

            <textarea
              value={currentScene.content}
              onChange={(e) => updateCurrentScene("content", e.target.value)}
              onSelect={handleTextareaSelect}
              placeholder="AI 초안이 없으면 직접 작성하거나 오른쪽 AI 집필 보조를 사용해보세요."
            />

            <div className="word-count">
              {currentScene.content.length.toLocaleString()}자
            </div>
          </div>

          <div className="editor-bottom-actions">
            <button
              type="button"
              className="prev-scene-btn"
              onClick={handlePrevScene}
              disabled={currentSceneIndex === 0}
            >
              ← 이전 장면
            </button>

            <button
              type="button"
              className="next-scene-btn"
              onClick={isLastScene ? handleComplete : handleNextScene}
              disabled={!currentScene || scenes.length === 0 || isTranslatingScene}
            >
              <span className="editor-next-action-label">
                {isTranslatingScene
                  ? "번역 확인 중..."
                  : isLastScene
                  ? "표지 선택으로 →"
                  : "다음 장면 →"}
              </span>
            </button>
          </div>
        </section>

        <aside className="ai-writing-panel">
          <h2>✦ AI 집필 보조</h2>

          <section className="setting-summary-card">
            <h3>현재 설정 요약</h3>

            <SummaryItem label="분위기" value={setting.directing?.mood} />
            <SummaryItem label="문체" value={setting.directing?.style} />
            <SummaryItem label="시점" value={setting.directing?.pointOfView} />
            <SummaryItem label="전개 속도" value={setting.directing?.pace} />
            <SummaryItem label="금지 요소" value={setting.directing?.avoid} />

            {showFullSetting && (
              <>
                <SummaryItem label="이야기 씨앗" value={setting.storySeed} />
                <SummaryItem label="장르" value={setting.genre} />
                <SummaryItem label="주인공" value={setting.protagonist} />
                <SummaryItem label="배경" value={setting.background} />
                <SummaryItem label="갈등" value={setting.conflict} />
                <SummaryItem label="결말 방향" value={setting.ending} />
              </>
            )}

            <button type="button" onClick={() => setShowFullSetting((prev) => !prev)}>
              {showFullSetting ? "기본 설정 접기" : "전체 설정 보기"}
            </button>
          </section>

          <section className="selected-text-card">
            <h3>선택한 문장</h3>
            <p>
              {hasSelection
                ? `"${selectedSentence.trim()}"`
                : "본문에서 문장을 드래그하면 여기에 표시됩니다."}
            </p>
            <p className="assist-scope-hint">
              {hasSelection
                ? "선택 영역을 기준으로 AI가 도와드립니다."
                : "현재 문단 또는 작성된 내용의 다음 부분을 기준으로 도와드립니다."}
            </p>
          </section>

          {isGuidedWritingLevel ? (
            <section className="ai-request-card">
              <h3>무엇을 도와드릴까요?</h3>

              <div className="ai-request-grid">
                <button type="button" onClick={() => handleAiAction("continue")} disabled={isProcessingAiAction}>
                  ✒ 이어쓰기
                </button>
                <button
                  type="button"
                  onClick={() => handleAssistAction("STYLE_SELECTED_TEXT")}
                  disabled={
                    isAssisting ||
                    isProcessingAiAction ||
                    (findAssistAction("STYLE_SELECTED_TEXT").requiresSelection && !hasSelection)
                  }
                  title={!hasSelection ? "수정할 문장을 먼저 선택해 주세요." : undefined}
                >
                  🪶 문체 수정
                </button>
                <button
                  type="button"
                  onClick={() => handleAssistAction("INCREASE_PARAGRAPH_TENSION")}
                  disabled={isAssisting || isProcessingAiAction}
                >
                  ⚡ 긴장감 높이기
                </button>
                <button
                  type="button"
                  onClick={() => handleAssistAction("ENHANCE_PARAGRAPH_DESCRIPTION")}
                  disabled={isAssisting || isProcessingAiAction}
                >
                  🌙 묘사 추가
                </button>
                <button
                  type="button"
                  onClick={() => handleAssistAction("ADD_DIALOGUE_TO_PARAGRAPH")}
                  disabled={isAssisting || isProcessingAiAction}
                >
                  💬 대사 추가
                </button>
                <button type="button" onClick={() => handleAiAction("rewrite")} disabled={isProcessingAiAction}>
                  📄 장면 다시쓰기
                </button>
              </div>

              <button
                type="button"
                className="wide-ai-btn"
                onClick={() => handleAssistAction("CHECK_SCENE_COHERENCE")}
                disabled={isAssisting || isProcessingAiAction}
              >
                🔍 개연성 검사
              </button>

              <button
                type="button"
                className="wide-ai-btn"
                onClick={() => handleAssistAction("CHECK_SCENE_COHERENCE")}
                disabled={isAssisting || isProcessingAiAction}
              >
                ✅ 설정과 비교
              </button>

              {isProcessingAiAction && (
                <p className="assist-loading-note">AI가 작성 중입니다...</p>
              )}
            </section>
          ) : (
            <section className="ai-request-card">
              <h3>무엇을 도와드릴까요?</h3>

              <div className="ai-request-grid">
                {independentBasicActions.map((action) => (
                  <button
                    key={action.actionType}
                    type="button"
                    disabled={
                      isAssisting || (action.requiresSelection && !hasSelection)
                    }
                    title={
                      action.requiresSelection && !hasSelection
                        ? "수정할 문장을 먼저 선택해 주세요."
                        : undefined
                    }
                    onClick={() => handleAssistAction(action.actionType)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {!hasSelection && (
                <p className="assist-selection-hint">
                  수정할 문장을 먼저 선택해 주세요.
                </p>
              )}

              <button
                type="button"
                className="wide-ai-btn"
                onClick={() => setShowMoreActions((prev) => !prev)}
              >
                {showMoreActions ? "더보기 닫기 ▲" : "더보기 ▼"}
              </button>

              {showMoreActions && (
                <div className="ai-request-grid ai-request-more-grid">
                  {independentMoreActions.map((action) => (
                    <button
                      key={action.actionType}
                      type="button"
                      disabled={
                        isAssisting || (action.requiresSelection && !hasSelection)
                      }
                      title={
                        action.requiresSelection && !hasSelection
                          ? "수정할 문장을 먼저 선택해 주세요."
                          : undefined
                      }
                      onClick={() => handleAssistAction(action.actionType)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {isAssisting && (
                <p className="assist-loading-note">AI가 작성 중입니다...</p>
              )}
            </section>
          )}

          {assistError && !isAssisting && (
            <p className="assist-error-note">
              AI 응답을 받지 못했어요. 다시 시도해 주세요.
            </p>
          )}

          {assistSuggestion && (
            <div className="assist-suggestion-card">
              <h3>AI 제안</h3>

              {/* evaluation: 개연성 검사가 왜 이 제안을 하는지 설명하는 평가 문장 */}
              {assistSuggestion.evaluation && (
                <p className="assist-suggestion-evaluation">{assistSuggestion.evaluation}</p>
              )}

              {assistSuggestion.text && (
                <p className="assist-suggestion-text">{assistSuggestion.text}</p>
              )}

              <div className="assist-suggestion-actions">
                {assistSuggestion.text && (
                  <button
                    type="button"
                    className="wide-ai-btn"
                    onClick={() =>
                      handleApplySuggestion(
                        resolveApplyMode(assistSuggestion.insertionMode)
                      )
                    }
                  >
                    {applyLabel(assistSuggestion.insertionMode)}
                  </button>
                )}
                <button type="button" onClick={handleRegenerateSuggestion}>
                  다시 추천
                </button>
                <button type="button" onClick={handleCancelSuggestion}>
                  {assistSuggestion.text ? "취소" : "닫기"}
                </button>
              </div>
            </div>
          )}

          <p className="ai-helper-note">
            문장을 선택하면 AI가 더 정확하게 수정 방향을 잡을 수 있어요.
          </p>
        </aside>
      </main>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="setting-summary-row">
      <span>{label}</span>
      <strong>{value || "미정"}</strong>
    </div>
  );
}

export default NovelWritingEditorPage;
