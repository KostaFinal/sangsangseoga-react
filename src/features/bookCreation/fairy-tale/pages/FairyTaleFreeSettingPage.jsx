import fairyback from "../../assets/fairyback.png";
import { useFairyTaleFreeSetting } from "../hooks/useFairyTaleFreeSetting";

const FairyTaleFreeSettingPage = () => {
  const {
    SUMMARY_ITEMS,
    settings,
    answer,
    setAnswer,
    messages,
    activeField,
    displayedExamples,
    canShowExamplesHint,
    handleShowExamples,
    isLoadingQuestion,
    isCompleting,
    usedFallbackNotice,
    loadingHint,
    completedRequiredCount,
    progress,
    isRequiredComplete,
    progressDegree,
    getDisplayValue,
    getStatusIcon,
    handleSubmit,
    handleExampleClick,
    handleExampleApply,
    handleStartStudio,
  } = useFairyTaleFreeSetting();

  const latestAiMessage =
    [...messages].reverse().find((message) => message.sender === "AI")?.text ||
    activeField.question;

  return (
    <div
      className="free-setting-page"
      style={{ "--fairy-bg": `url(${fairyback})` }}
    >
      <div className="free-setting-overlay" />

      <main className="free-setting-main">
        <section className="free-title-section">
          <p className="free-kicker">AI 기본설정 인터뷰</p>
          <h1>AI 선생님과 이야기의 뼈대를 먼저 정해요</h1>
          <p>
            자유롭게 답하면 AI가 동화에 필요한 기본설정을 정리해줍니다.
          </p>
        </section>

        <section className="free-setting-card">
          <div className="interview-area">
            <div className="question-card">
              <div className="question-top">
                <span className="question-badge">AI</span>

                <span className="question-label">{activeField.title}</span>

                {activeField.optional && (
                  <span className="optional-badge">선택사항</span>
                )}

                {isRequiredComplete && activeField.optional && (
                  <span className="ready-badge">시작 가능</span>
                )}
              </div>

              <h2>{latestAiMessage}</h2>
              <p>{activeField.guide}</p>

              {isLoadingQuestion && (
                <p style={{ color: "var(--text-sub)", fontWeight: 800 }}>
                  🤖 {loadingHint || "AI 선생님이 다음 질문을 생각하고 있어요..."}
                </p>
              )}

              {isCompleting && (
                <p style={{ color: "var(--text-sub)", fontWeight: 800 }}>
                  🤖 설정을 정리하고 있어요...
                </p>
              )}

              {!isLoadingQuestion && usedFallbackNotice && (
                <p style={{ color: "#a97c1f", fontWeight: 700 }}>
                  AI 질문을 불러오지 못해 기본 질문으로 이어갈게요.
                </p>
              )}

              {isRequiredComplete && activeField.optional && (
                <div className="optional-start-notice">
                  <strong>필수 설정은 모두 끝났어요.</strong>
                  <span>
                    분위기, 중요한 물건, 제목은 정하지 않아도 동화 만들기를 바로
                    시작할 수 있어요.
                  </span>
                </div>
              )}

              {canShowExamplesHint && (
                <div style={{ marginTop: "22px" }}>
                  <button
                    type="button"
                    className="example-chip"
                    onClick={handleShowExamples}
                  >
                    🤔 잘 모르겠어요, 예시 보여줘
                  </button>
                </div>
              )}

              {displayedExamples.length > 0 && (
                <div className="example-area">
                  <div className="example-title">
                    <span>추천 예시</span>
                    <small>
                      누르면 입력창에 들어가고, 다시 보내면 저장돼요.
                    </small>
                  </div>

                  <div className="example-list">
                    {displayedExamples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="example-chip"
                        onClick={() => handleExampleClick(example)}
                        onDoubleClick={() => handleExampleApply(example)}
                      >
                        {activeField.key === "pageCount"
                          ? `${example}페이지`
                          : example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form className="answer-form" onSubmit={handleSubmit}>
              {activeField.key === "pageCount" ? (
                <select
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="answer-select"
                >
                  <option value="">페이지 수를 선택하세요</option>
                  <option value="12">12페이지</option>
                  <option value="16">16페이지</option>
                  <option value="20">20페이지</option>
                </select>
              ) : (
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={activeField.placeholder}
                  className="answer-textarea"
                />
              )}

              <div className="answer-actions">
                {isRequiredComplete && (
                  <button
                    type="button"
                    className="inline-start-btn"
                    onClick={handleStartStudio}
                    disabled={isCompleting}
                  >
                    바로 시작하기
                  </button>
                )}

                <button
                  type="submit"
                  className="send-btn"
                  disabled={!answer.trim() || isLoadingQuestion || isCompleting}
                >
                  AI 선생님에게 보내기
                </button>
              </div>
            </form>

            <div className="mini-history">
              <div className="mini-history-head">
                <h3>대화 기록</h3>
                <span>최근 기록 {Math.min(messages.length, 5)}개</span>
              </div>

              <div className="history-list">
                {messages.slice(-5).map((message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`history-message ${message.sender.toLowerCase()}`}
                  >
                    <span>{message.sender === "AI" ? "AI" : "나"}</span>

                    <div className="record-content">
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="summary-area">
            <div className="summary-top">
              <div>
                <p className="summary-kicker">기본설정 요약</p>
                <h2>필수 설정 완성도 {progress}%</h2>
              </div>

              <div
                className="progress-circle"
                style={{
                  background: `conic-gradient(var(--primary) ${progressDegree}deg, var(--primary-light) ${progressDegree}deg 360deg)`,
                }}
              >
                <span>{progress}%</span>
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="summary-status-box">
              {isRequiredComplete ? (
                <>
                  <strong>시작 준비 완료</strong>
                  <p>
                    필수 설정이 모두 채워졌어요. 선택사항은 지금 정해도 되고
                    나중에 바꿔도 돼요.
                  </p>
                </>
              ) : (
                <>
                  <strong>필수 설정을 채우는 중</strong>
                  <p>
                    {SUMMARY_ITEMS.filter((item) => item.required).length -
                      completedRequiredCount}
                    개를 더 정하면 동화 만들기를 시작할 수 있어요.
                  </p>
                </>
              )}
            </div>

            <div className="summary-list">
              {SUMMARY_ITEMS.map((item) => {
                const value = settings[item.key];

                return (
                  <div
                    key={item.key}
                    className={`summary-item ${
                      value ? "completed" : "empty"
                    } ${item.required ? "required-item" : "optional-item"}`}
                  >
                    <div className="summary-item-main">
                      <div className="summary-item-title">
                        <span>{getStatusIcon(item.key)}</span>
                        <strong>{item.label}</strong>
                        {item.required ? (
                          <em className="required-tag">필수</em>
                        ) : (
                          <em className="optional-tag">선택</em>
                        )}
                      </div>

                      <p>{getDisplayValue(item.key, value)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-bottom">
              {!isRequiredComplete ? (
                <p className="not-ready-text">
                  필수 설정을 모두 채우면 동화 만들기를 시작할 수 있어요.
                </p>
              ) : (
                <p className="ready-text">
                  기본설정이 완료됐어요. <br />이제 동화 공동창작을 시작할 수 있어요.
                </p>
              )}

              <button
                type="button"
                className="start-studio-btn"
                disabled={!isRequiredComplete || isCompleting}
                onClick={handleStartStudio}
              >
                이 설정으로 동화 만들기 시작
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default FairyTaleFreeSettingPage;
