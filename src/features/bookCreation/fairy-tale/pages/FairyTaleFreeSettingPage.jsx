import fairyback from "../../assets/fairyback.png";
import { useFairyTaleFreeSetting } from "../hooks/useFairyTaleFreeSetting";

const FairyTaleFreeSettingPage = () => {
  const {
    REQUIRED_FIELDS,
    SUMMARY_ITEMS,
    settings,
    currentStepIndex,
    answer,
    setAnswer,
    records,
    currentStep,
    completedRequiredCount,
    progress,
    isRequiredComplete,
    isOptionalStep,
    isLastStep,
    progressDegree,
    getDisplayValue,
    getStatusIcon,
    handleSubmit,
    handleExampleClick,
    handleExampleApply,
    handleSkip,
    handleStartStudio,
    navigate,
  } = useFairyTaleFreeSetting();
  return (
    <div
      className="free-setting-page"
      style={{ "--fairy-bg": `url(${fairyback})` }}
    >
      <div className="free-setting-overlay" />

      <header className="free-setting-header">
        <div className="free-header-left">
          <div className="free-logo">🏰</div>
          <span className="free-brand">동화마을</span>
        </div>

        <div className="free-header-center">
          <span>동화 만들기</span>
          <span>→</span>
          <strong>자유형 기본설정</strong>
        </div>

        <button
          type="button"
          className="free-header-back"
          onClick={() => navigate(-1)}
        >
          이전으로
        </button>
      </header>

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
                <span className="question-badge">
                  Q{currentStepIndex + 1}
                </span>

                <span className="question-label">{currentStep.title}</span>

                {currentStep.optional && (
                  <span className="optional-badge">선택사항</span>
                )}

                {isRequiredComplete && isOptionalStep && (
                  <span className="ready-badge">시작 가능</span>
                )}
              </div>

              <h2>{currentStep.question}</h2>
              <p>{currentStep.guide}</p>

              {isRequiredComplete && isOptionalStep && (
                <div className="optional-start-notice">
                  <strong>필수 설정은 모두 끝났어요.</strong>
                  <span>
                    분위기, 중요한 물건, 제목은 정하지 않아도 동화 만들기를 바로
                    시작할 수 있어요.
                  </span>
                </div>
              )}

              {currentStep.examples?.length > 0 && (
                <div className="example-area">
                  <div className="example-title">
                    <span>추천 예시</span>
                    <small>
                      누르면 입력창에 들어가고, 다시 보내면 저장돼요.
                    </small>
                  </div>

                  <div className="example-list">
                    {currentStep.examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="example-chip"
                        onClick={() => handleExampleClick(example)}
                        onDoubleClick={() => handleExampleApply(example)}
                      >
                        {currentStep.key === "pageCount"
                          ? `${example}페이지`
                          : example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form className="answer-form" onSubmit={handleSubmit}>
              {currentStep.key === "pageCount" ? (
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
                  placeholder={currentStep.placeholder}
                  className="answer-textarea"
                />
              )}

              <div className="answer-actions">
                {/* {isRequiredComplete && (
                  <button
                    type="button"
                    className="inline-start-btn"
                    onClick={handleStartStudio}
                  >
                    바로 시작하기
                  </button>
                )} */}

                {currentStep.optional && (
                  <button
                    type="button"
                    className="skip-btn"
                    onClick={handleSkip}
                    disabled={isLastStep && !answer.trim()}
                  >
                    건너뛰기
                  </button>
                )}

                <button
                  type="submit"
                  className="send-btn"
                  disabled={!answer.trim()}
                >
                  AI 선생님에게 보내기
                </button>
              </div>
            </form>

            <div className="mini-history">
              <div className="mini-history-head">
                <h3>설정 기록</h3>
                <span>최근 기록 {Math.min(records.length, 5)}개</span>
              </div>

              <div className="history-list">
                {records.slice(-5).map((record, index) => (
                  <div
                    key={`${record.type}-${record.title}-${index}`}
                    className={`history-message ${record.type.toLowerCase()}`}
                  >
                    <span>
                      {record.type === "AI"
                        ? "AI"
                        : record.type === "SET"
                        ? "설정"
                        : "건너뜀"}
                    </span>

                    <div className="record-content">
                      <strong>{record.title}</strong>
                      <p>{record.text}</p>
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
                    {REQUIRED_FIELDS.length - completedRequiredCount}개를 더
                    정하면 동화 만들기를 시작할 수 있어요.
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

                    {/* <button
                      type="button"
                      className="edit-summary-btn"
                      onClick={() => handleEdit(item.key)}
                    >
                      수정
                    </button> */}
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
                  기본설정이 완료됐어요. <br/>이제 동화 공동창작을 시작할 수 있어요.
                </p>
              )}

              <button
                type="button"
                className="start-studio-btn"
                disabled={!isRequiredComplete}
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





