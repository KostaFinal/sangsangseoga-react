import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelScenarioBuilder } from "../hooks/useNovelScenarioBuilder";

const getAgendaIcon = (label) => {
  if (label.includes("씨앗")) return "▣";
  if (label.includes("장르")) return "▤";
  if (label.includes("주인공")) return "♙";
  if (label.includes("배경")) return "♧";
  if (label.includes("갈등")) return "✦";
  if (label.includes("결말")) return "◈";
  return "•";
};

const getRecommendIcon = (index) => {
  const icons = ["▣", "✎", "✦"];
  return icons[index] || "✦";
};

function NovelScenarioBuilderPage() {
  const {
    agendaItems,
    selectedKey,
    settings,
    customText,
    selectedRecommendationIndex,
    selectedAgenda,
    selectedIndex,
    currentRecommendations,
    completedCount,
    progressPercent,
    isAllComplete,
    isLoadingOptions,
    loadingHint,
    showFallbackNotice,
    handleAgendaClick,
    handleSelectRecommendation,
    handleCustomTextChange,
    handleResetCurrent,
    handlePreviousAgenda,
    handleNextAgenda,
    handleRecommendAgain,
    handleConfirm,
  } = useNovelScenarioBuilder();

  const currentValue = settings[selectedKey] || "";

  const handleBackToDashboard = () => {
    window.history.back();
  };

  return (
    <div className="novel-builder-page" style={{ "--novel-builder-bg": `url(${scenarioBg})` }}>
      <main className="novel-builder-shell">
        <section className="novel-builder-layout">
          {/* 왼쪽 안건 목록 */}
          <aside className="novel-agenda-panel">
            <div className="novel-agenda-title">
              <span className="novel-title-icon">☷</span>
              <h2>소설 회의 안건</h2>
            </div>

            <nav className="novel-agenda-list">
              {agendaItems.map((item) => {
                const value = settings[item.key] || "";
                const isActive = item.key === selectedKey;
                const isCompleted = value.trim() !== "";

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`novel-agenda-button ${
                      isActive ? "active" : ""
                    } ${isCompleted ? "completed" : ""}`}
                    onClick={() => handleAgendaClick(item.key)}
                  >
                    <span className="agenda-number">{item.number}</span>

                    <span className="agenda-text">
                      <strong>{item.label}</strong>
                      {isActive && <em>현재 안건</em>}
                      {isCompleted && !isActive && <em>완료</em>}
                    </span>

                    {isActive && <b>›</b>}
                  </button>
                );
              })}
            </nav>

            <div className="novel-progress-card">
              <div>
                <strong>진행 상황</strong>
                <span>
                  {completedCount} / {agendaItems.length} 안건 완료
                </span>
              </div>

              <div className="novel-progress-line">
                <i style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="novel-tip-card">
              <strong>TIP</strong>
              <p>
                각 안건에서 선택한 내용은 이야기 설계에 자동으로 반영돼요.
              </p>
            </div>
          </aside>

          {/* 중앙 회의 영역 */}
          <section className="novel-meeting-panel">
            <div className="novel-meeting-top">
              <p>소설의 출발점이 되는 핵심 아이디어를 정합니다.</p>

              <div className="novel-step-progress">
                <strong>
                  {selectedIndex + 1} / {agendaItems.length}
                </strong>
                <div>
                  <i style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="novel-question-row">
              <span>{getAgendaIcon(selectedAgenda.label)}</span>
              <h2>{selectedAgenda.question}</h2>
            </div>

            <section className="novel-recommendation-area">
              <div className="novel-section-label-row">
                <p className="novel-section-label">AI 추천 안건</p>

                <button
                  type="button"
                  className="novel-ghost-button small"
                  onClick={handleRecommendAgain}
                  disabled={isLoadingOptions}
                >
                  ↻ 다시 추천
                </button>
              </div>

              {showFallbackNotice && !isLoadingOptions && (
                <p className="novel-fallback-notice">
                  AI 추천을 불러오지 못해 기본 추천을 보여드려요.
                </p>
              )}

              {isLoadingOptions ? (
                <p className="novel-loading-hint">
                  {loadingHint || "AI가 추천을 만드는 중이에요..."}
                </p>
              ) : (
                <div className="novel-recommendation-grid">
                  {currentRecommendations.map((recommendation, index) => {
                    const isSelected = selectedRecommendationIndex === index;

                    return (
                      <button
                        key={`${selectedAgenda.key}-${recommendation.title}`}
                        type="button"
                        className={`novel-recommendation-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() =>
                          handleSelectRecommendation(recommendation, index)
                        }
                      >
                        <span className="recommend-icon">
                          {getRecommendIcon(index)}
                        </span>

                        <span className="recommend-check">
                          {isSelected ? "✓" : ""}
                        </span>

                        <strong>{recommendation.title}</strong>
                        <p>{recommendation.text}</p>

                        <div className="novel-tag-row">
                          {recommendation.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
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
            </section>

            <section className="novel-current-preview">
              <p className="novel-section-label">현재 선택값 미리보기</p>

              <div className="novel-current-choice-box">
                {currentValue ? (
                  <>
                    <strong>{currentValue}</strong>
                    <div className="novel-tag-row">
                      {selectedAgenda.recommendations[
                        selectedRecommendationIndex
                      ]?.tags?.map((tag) => (
                        <span key={`current-${tag}`}>{tag}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <strong className="empty">아직 선택되지 않았습니다.</strong>
                )}
              </div>
            </section>

            <div className="novel-meeting-action-row">
              <button
                type="button"
                className="novel-ghost-button"
                onClick={handlePreviousAgenda}
                disabled={selectedIndex === 0}
              >
                ← 이전 안건
              </button>

              <button
                type="button"
                className="novel-ghost-button"
                onClick={handleResetCurrent}
              >
                ↻ 현재 안건 초기화
              </button>

              <button
                type="button"
                className="novel-primary-button"
                onClick={handleNextAgenda}
                disabled={selectedIndex === agendaItems.length - 1}
              >
                다음 안건으로 →
              </button>
            </div>
          </section>

          {/* 오른쪽 설정 요약 */}
          <aside className="novel-summary-panel">
            <div className="novel-summary-title">
              <span>▱</span>
              <h2>현재 설정 요약</h2>
            </div>

            <div className="novel-summary-list">
              {agendaItems.map((item) => {
                const value = settings[item.key] || "";
                const isCompleted = value.trim() !== "";

                return (
                  <div
                    key={`summary-${item.key}`}
                    className={`novel-summary-item ${
                      isCompleted ? "completed" : ""
                    }`}
                  >
                    <span className="summary-icon">
                      {getAgendaIcon(item.label)}
                    </span>

                    <div>
                      <strong>{item.label}</strong>
                      <p>{isCompleted ? value : "미정"}</p>
                    </div>

                    {!isCompleted && <em>미정</em>}
                  </div>
                );
              })}
            </div>

            <div className="novel-summary-guide">
              <strong>모든 안건을 설정하면</strong>
              <p>나만의 이야기 설계도가 완성돼요!</p>
            </div>

            <button
              type="button"
              className={`novel-confirm-button ${
                isAllComplete ? "enabled" : ""
              }`}
              onClick={handleConfirm}
              disabled={!isAllComplete}
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