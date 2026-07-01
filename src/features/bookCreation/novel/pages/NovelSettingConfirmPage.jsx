import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelSettingConfirm } from "../hooks/useNovelSettingConfirm";

function NovelSettingConfirmPage() {
  const {
    minutes,
    directingSteps,
    directing,
    customInput,
    setCustomInput,
    messages,
    currentStepIndex,
    currentStep,
    completedCount,
    isAllComplete,
    getStepStatus,
    handleSelectOption,
    handleSendCustom,
    handleAiRecommend,
    handleStartEditor,
  } = useNovelSettingConfirm();
  return (
    <div className="novel-confirm-page">
      <img
        className="novel-confirm-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-confirm-overlay" />

      <header className="novel-confirm-header">
        <div className="novel-confirm-brand">
          <span>🌙</span>
          <strong>소설 스튜디오</strong>
        </div>

        <nav className="novel-confirm-nav">
          <button type="button">프로젝트</button>
          <button type="button">세계관 설정</button>
          <button type="button">캐릭터</button>
          <button type="button">자료실</button>
          <button type="button">요금제</button>
          <button type="button">가이드</button>
        </nav>

        <div className="novel-confirm-user">
          <button type="button" className="novel-premium-btn">
            👑 프리미엄
          </button>
          <button type="button" className="novel-bell-btn">
            🔔
          </button>
          <button type="button" className="novel-profile-btn">
            작가의 서재⌄
          </button>
        </div>
      </header>

      <main className="novel-confirm-main">
        <section className="confirm-title-area">
          <h1>✦ 작가 회의실 ✦</h1>
          <p>AI와 대화하며 소설의 분위기, 문체, 시점, 분량을 정리합니다.</p>
        </section>

        <section className="confirm-step-bar">
          <div className="confirm-step done">
            <span>✓</span>
            <strong>이야기 기획</strong>
          </div>

          <em />

          <div className="confirm-step active">
            <span>2</span>
            <strong>AI 연출 회의</strong>
          </div>

          <em />

          <div className="confirm-step">
            <span>3</span>
            <strong>집필 에디터</strong>
          </div>
        </section>

        <section className="confirm-layout">
          <aside className="directing-progress-panel">
            <h2>✦ AI 연출 진행표 ✦</h2>

            <div className="directing-progress-list">
              {directingSteps.map((step, index) => {
                const status = getStepStatus(index, step.key);

                return (
                  <div
                    key={step.key}
                    className={`directing-progress-item ${status}`}
                  >
                    <span className="progress-icon">{step.icon}</span>

                    <div>
                      <strong>{step.label}</strong>
                      <p>
                        {directing[step.key] !== "미정"
                          ? directing[step.key]
                          : status === "active"
                          ? "AI가 질문 중"
                          : "아직 정하지 않음"}
                      </p>
                    </div>

                    {status === "completed" && <em>✓</em>}
                    {status === "active" && <small>진행 중</small>}
                    {status === "pending" && <i />}
                  </div>
                );
              })}
            </div>

            <div className="directing-help-box">
              <span>✦</span>
              <p>
                왼쪽은 수정 메뉴가 아니라
                <br />
                AI 회의 진행 상태를 보여주는 판이에요.
              </p>
            </div>
          </aside>

          <section className="directing-chat-panel">
            <h2>✦ AI와 연출 회의 ✦</h2>

            <div className="novel-chat-window">
              <div className="novel-chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`novel-chat-message ${message.type}`}
                  >
                    <div className="novel-message-bubble">{message.text}</div>
                  </div>
                ))}
              </div>

              {!isAllComplete && currentStep && (
                <div className="current-question-box">
                  <div className="question-header">
                    <span>
                      STEP {currentStepIndex + 1} / {directingSteps.length}
                    </span>
                    <strong>{currentStep.label}</strong>
                  </div>

                  <h3>{currentStep.question}</h3>
                  <p>{currentStep.guide}</p>

                  <div className="novel-chat-option-grid">
                    {currentStep.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectOption(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isAllComplete && (
                <div className="current-question-box complete">
                  <h3>AI 연출 회의가 완료되었습니다.</h3>
                  <p>
                    오른쪽 실시간 회의록을 확인한 뒤 에디터로 이동하면 됩니다.
                  </p>
                </div>
              )}

              <div className="novel-chat-input-area">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={
                    isAllComplete
                      ? "연출 회의가 완료되었습니다."
                      : "직접 입력하고 싶은 연출 방향을 적어주세요."
                  }
                  disabled={isAllComplete}
                />

                <div className="novel-chat-actions">
                  <button
                    type="button"
                    className="novel-sub-btn"
                    onClick={handleAiRecommend}
                    disabled={isAllComplete}
                  >
                    ✨ AI 추천
                  </button>

                  <button
                    type="button"
                    className="novel-send-btn"
                    onClick={handleSendCustom}
                    disabled={isAllComplete}
                  >
                    전송 →
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="live-minutes-panel">
            <h2>✦ 실시간 회의록 ✦</h2>

            <section className="live-minutes-box">
              <h3>기본 설정</h3>
              <NovelSummaryRow label="이야기 씨앗" value={minutes.storySeed} />
              <NovelSummaryRow label="장르" value={minutes.genre} />
              <NovelSummaryRow label="주인공" value={minutes.protagonist} />
              <NovelSummaryRow label="배경" value={minutes.background} />
              <NovelSummaryRow label="갈등" value={minutes.conflict} />
              <NovelSummaryRow label="결말 방향" value={minutes.ending} />
            </section>

            <section className="live-minutes-box">
              <h3>AI 연출 설정</h3>
              <NovelSummaryRow label="분위기" value={directing.mood} />
              <NovelSummaryRow label="문체" value={directing.style} />
              <NovelSummaryRow label="시점" value={directing.pointOfView} />
              <NovelSummaryRow label="분량" value={directing.volume} />
              <NovelSummaryRow label="전개 속도" value={directing.pace} />
              <NovelSummaryRow label="금지 요소" value={directing.avoid} />
            </section>

            <section className="live-progress-box">
              <div>
                <strong>연출 완성도</strong>
                <span>
                  {completedCount} / {directingSteps.length} 완료
                </span>
              </div>

              <div className="novel-progress-track">
                <em
                  style={{
                    width: `${(completedCount / directingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </section>

            <button
              type="button"
              className={`move-editor-btn ${isAllComplete ? "enabled" : ""}`}
              disabled={!isAllComplete}
              onClick={handleStartEditor}
            >
              ✨ 설정 확정하고 에디터로 이동
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function NovelSummaryRow({ label, value }) {
  const completed = value && value !== "미정";

  return (
    <div className={`novel-summary-row ${completed ? "completed" : ""}`}>
      <span>{label}</span>
      <strong>{completed ? value : "미정"}</strong>
    </div>
  );
}

export default NovelSettingConfirmPage;




