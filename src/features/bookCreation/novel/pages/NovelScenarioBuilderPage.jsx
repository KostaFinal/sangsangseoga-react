import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelScenarioBuilder } from "../hooks/useNovelScenarioBuilder";

function NovelScenarioBuilderPage() {
  const {
    agendaItems,
    selectedKey,
    settings,
    customText,
    selectedRecommendationIndex,
    selectedAgenda,
    selectedIndex,
    completedCount,
    progressPercent,
    isAllComplete,
    handleAgendaClick,
    handleSelectRecommendation,
    handleCustomTextChange,
    handleResetCurrent,
    handlePreviousAgenda,
    handleNextAgenda,
    handleConfirm,
  } = useNovelScenarioBuilder();
  return (
    <div className="novel-builder-page">
      <img
        className="novel-builder-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-builder-overlay" />

      <main className="novel-builder-shell">
        <header className="novel-builder-header">
          <div>
            <p className="novel-builder-eyebrow">AUTHOR MEETING MODE</p>
            <h1>소설 작가 회의</h1>
            <p>
              AI 추천안을 선택하거나 직접 수정하면서 소설의 기본 설정을
              확정하세요.
            </p>
          </div>

          <aside className="novel-builder-progress-card">
            <span>설정 진행률</span>
            <strong>{progressPercent}%</strong>

            <div className="novel-builder-progress-track">
              <div
                className="novel-builder-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <small>
              {completedCount} / {agendaItems.length}개 확정
            </small>
          </aside>
        </header>

        <section className="novel-builder-layout">
          <aside className="novel-agenda-panel">
            <div className="novel-panel-title-row">
              <h2>회의 안건</h2>
              <span>{selectedAgenda.number}</span>
            </div>

            <nav className="novel-agenda-list">
              {agendaItems.map((item) => {
                const isActive = item.key === selectedKey;
                const isCompleted = settings[item.key].trim() !== "";

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`novel-agenda-button ${
                      isActive ? "active" : ""
                    } ${isCompleted ? "completed" : ""}`}
                    onClick={() => handleAgendaClick(item.key)}
                  >
                    <span>{item.number}</span>
                    <strong>{item.label}</strong>
                    {isCompleted && <em>완료</em>}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="novel-meeting-panel">
            <div className="novel-panel-title-row">
              <div>
                <h2>AI와 설정 회의</h2>
                <p>{selectedAgenda.description}</p>
              </div>

              <span>
                {selectedIndex + 1} / {agendaItems.length}
              </span>
            </div>

            <div className="novel-question-box">
              <span>{selectedAgenda.number}</span>
              <h3>{selectedAgenda.question}</h3>
            </div>

            <section className="novel-recommendation-area">
              <p className="novel-section-label">AI 추천 안건</p>

              <div className="novel-recommendation-grid">
                {selectedAgenda.recommendations.map((recommendation, index) => (
                  <button
                    key={`${selectedAgenda.key}-${recommendation.title}`}
                    type="button"
                    className={`novel-recommendation-card ${
                      selectedRecommendationIndex === index ? "selected" : ""
                    }`}
                    onClick={() =>
                      handleSelectRecommendation(recommendation, index)
                    }
                  >
                    <strong>{recommendation.title}</strong>
                    <p>{recommendation.text}</p>

                    <div className="novel-tag-row">
                      {recommendation.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="novel-custom-input-area">
              <div className="novel-section-label-row">
                <p className="novel-section-label">직접 입력 또는 수정</p>
                <span>
                  {customText.length} / {selectedAgenda.maxLength}
                </span>
              </div>

              <textarea
                value={customText}
                onChange={handleCustomTextChange}
                placeholder={selectedAgenda.placeholder}
              />

              <div className="novel-current-choice-box">
                <span>현재 선택값</span>
                <p>
                  {settings[selectedKey] || "아직 선택되지 않았습니다."}
                </p>
              </div>
            </section>

            <div className="novel-meeting-action-row">
              <button
                type="button"
                className="novel-ghost-button"
                onClick={handlePreviousAgenda}
                disabled={selectedIndex === 0}
              >
                이전 안건
              </button>

              <button
                type="button"
                className="novel-ghost-button"
                onClick={handleResetCurrent}
              >
                현재 안건 초기화
              </button>

              <button
                type="button"
                className="novel-gold-button"
                onClick={handleNextAgenda}
                disabled={selectedIndex === agendaItems.length - 1}
              >
                다음 안건으로 →
              </button>
            </div>
          </section>

          <aside className="novel-summary-panel">
            <div className="novel-panel-title-row">
              <h2>현재 설정 요약</h2>
              <span>{completedCount}</span>
            </div>

            <div className="novel-summary-list">
              {agendaItems.map((item) => (
                <div key={`summary-${item.key}`} className="novel-summary-item">
                  <span>{item.label}</span>
                  <p>{settings[item.key] || "미정"}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`novel-start-writing-button ${
                isAllComplete ? "enabled" : ""
              }`}
              onClick={handleConfirm}
            >
              설정 확정하기 →
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default NovelScenarioBuilderPage;




