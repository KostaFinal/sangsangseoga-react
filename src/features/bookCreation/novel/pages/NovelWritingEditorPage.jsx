import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelWritingEditor } from "../hooks/useNovelWritingEditor";

function NovelWritingEditorPage() {
  const {
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
  } = useNovelWritingEditor();
  return (
    <div className="novel-editor-page">
      <img
        className="novel-editor-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-editor-overlay" />

      <header className="novel-editor-header">
        <div className="novel-editor-brand">
          <span>✒</span>
          <strong>소설 스튜디오</strong>
        </div>

        <div className="novel-editor-title">
          <strong>{setting.storySeed || "제목 없는 소설"}</strong>
          <button type="button">✎</button>
          <span>✓ 자동 저장됨</span>
          <em>오후 3:42</em>
        </div>

        <div className="novel-editor-actions">
          <button type="button" className="ghost-btn">
            📖 미리보기
          </button>
          <button type="button" className="ghost-btn" onClick={handleSave}>
            💾 저장
          </button>
          <button type="button" className="complete-btn" onClick={handleComplete}>
            ✓ 완성하기
          </button>
        </div>
      </header>

      <main className="novel-editor-layout">
        <aside className="scene-list-panel">
          <div className="panel-title-row">
            <h2>장면 목록</h2>
            <button type="button" onClick={handleAddScene}>
              ＋ 장면 추가
            </button>
          </div>

          <div className="scene-list">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                className={`scene-item ${
                  scene.id === currentSceneId ? "active" : ""
                }`}
                onClick={() => setCurrentSceneId(scene.id)}
              >
                <div className="scene-item-head">
                  <strong>
                    {scene.id}. {scene.title}
                  </strong>
                  <span>{scene.phase}</span>
                </div>

                <p>{scene.goal}</p>

                <div className="scene-status-row">
                  <em className={scene.status === "미작성" ? "empty" : "draft"}>
                    {scene.status}
                  </em>
                </div>
              </button>
            ))}
          </div>

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
              <button type="button" onClick={() => handleAiAction("continue")}>
                ✦ AI 초안
              </button>
            </div>

            <div className="mini-toolbar">
              <button type="button">↶</button>
              <button type="button">↷</button>
              <button type="button">H1</button>
              <button type="button">H2</button>
              <button type="button">B</button>
              <button type="button">I</button>
              <button type="button">밑줄</button>
              <button type="button">정렬</button>
            </div>

            <textarea
              value={currentScene.content}
              onChange={(e) => updateCurrentScene("content", e.target.value)}
              onMouseUp={(e) => {
                const selected = e.currentTarget.value.substring(
                  e.currentTarget.selectionStart,
                  e.currentTarget.selectionEnd
                );
                setSelectedSentence(selected);
              }}
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

            <button type="button" className="save-btn" onClick={handleSave}>
              ☁ 임시 저장
            </button>

            <button
              type="button"
              className="next-scene-btn"
              onClick={handleNextScene}
              disabled={currentSceneIndex === scenes.length - 1}
            >
              다음 장면 →
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

            <button type="button">전체 설정 보기</button>
          </section>

          <section className="selected-text-card">
            <h3>선택한 문장</h3>
            <p>
              {selectedSentence.trim()
                ? `“${selectedSentence.trim()}”`
                : "본문에서 문장을 드래그하면 여기에 표시됩니다."}
            </p>
          </section>

          <section className="ai-request-card">
            <h3>무엇을 도와드릴까요?</h3>

            <div className="ai-request-grid">
              <button type="button" onClick={() => handleAiAction("continue")}>
                ✒ 이어쓰기
              </button>
              <button type="button" onClick={() => handleAiAction("tone")}>
                🪶 문체 수정
              </button>
              <button type="button">⚡ 긴장감 높이기</button>
              <button type="button">🌙 묘사 추가</button>
              <button type="button">💬 대사 추가</button>
              <button type="button" onClick={() => handleAiAction("rewrite")}>
                📄 장면 다시쓰기
              </button>
            </div>

            <button
              type="button"
              className="wide-ai-btn"
              onClick={() => handleAiAction("check")}
            >
              🔍 개연성 검사
            </button>

            <button type="button" className="wide-ai-btn">
              ✅ 설정과 비교
            </button>
          </section>

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




