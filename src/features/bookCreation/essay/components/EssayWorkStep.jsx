import React from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";
import { QUESTIONS, PAGE_LIMIT, hasText, splitPages } from "../essayShared.js";

export default function EssayWorkStep(props) {
  const {
    settings,
    setSettings,
    answers,
    setAnswers,
    questionIndex,
    setQuestionIndex,
    guidedComplete,
    content,
    title,
    workInput,
    setWorkInput,
    startEssay,
    writeGuidedStep,
    recommendGuidedAnswer,
    appendRaw,
    appendPolished,
    askAi,
    selectedText,
    setSelectedText,
    revisionRequest,
    setRevisionRequest,
    freeEditMode,
    setFreeEditMode,
    guidedEditMode,
    setGuidedEditMode,
    freeUndoSnapshot,
    freeRedoSnapshot,
    undoFreeAction,
    redoFreeAction,
    closeFreeEditMode,
    applyRevision,
    selectFromTextarea,
    goStep,
    resetEssay,
  } = props;
  const isGuided = settings.mode === "guided";
  const isFree = settings.mode === "free";
  const currentQuestion =
    QUESTIONS[Math.min(questionIndex, QUESTIONS.length - 1)];
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const currentAnswerReady =
    currentQuestion.optional || hasText(answers[currentQuestion.key]);
  const allRequiredReady = QUESTIONS.every(
    (item) => item.optional || hasText(answers[item.key]),
  );
  const hasContent = hasText(content);
  const showQuestions = isGuided && !guidedComplete;
  const canStartGuided = isLastQuestion && allRequiredReady;

  const goNextQuestion = () => {
    if (!currentAnswerReady) return;
    writeGuidedStep();
  };

  const summaryMemo = (
    <div className="essay-ai-card essay-summary-card">
      <h2>작성 요약</h2>
      <p>
        {isGuided
          ? "질문에 답할 때마다 에세이 본문이 한 문단씩 이어져요."
          : "현재 에세이 작성에 참고되는 정보예요."}
      </p>
      <div className="essay-source-box">
        <strong>{isGuided ? "질문 답변" : "작성 정보"}</strong>
        {isGuided ? (
          <dl className="essay-answer-summary-list">
            <div>
              <dt>경험</dt>
              <dd>{answers.experience || "아직 입력 전"}</dd>
            </div>
            <div>
              <dt>감정</dt>
              <dd>{answers.emotion || "아직 입력 전"}</dd>
            </div>
            <div>
              <dt>생각</dt>
              <dd>{answers.meaning || "아직 입력 전"}</dd>
            </div>
            <div>
              <dt>장면</dt>
              <dd>{answers.scene || "아직 입력 전"}</dd>
            </div>
            <div>
              <dt>독자의 마음</dt>
              <dd>{answers.readerFeeling || "아직 입력 전"}</dd>
            </div>
          </dl>
        ) : (
          <dl>
            <div>
              <dt>방식</dt>
              <dd>자유형</dd>
            </div>
            <div>
              <dt>작가</dt>
              <dd>{settings.authorAge || "-"}</dd>
            </div>
            <div>
              <dt>독자</dt>
              <dd>{settings.readerAge || "미지정"}</dd>
            </div>
            <div>
              <dt>본문</dt>
              <dd>
                {hasContent
                  ? `${content.length.toLocaleString()}자 작성됨`
                  : "아직 작성 전"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );

  return (
    <section className="essay-studio-page">
      <div className="essay-studio-top">
        <EssayFlowStepper active={3} />
      </div>

      <div
        className={`essay-studio-layout ${isFree ? "free-layout" : ""} ${isGuided ? "guided-layout" : ""}`}
      >
        <section className="essay-editor-panel">
          <div className="essay-editor-title-row">
            <label>
              <span>제목</span>
              <input
                value={settings.title || title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="제목을 입력하거나 AI 추천 제목을 사용하세요."
              />
            </label>
            <button
              type="button"
              className="essay-soft essay-title-button"
              onClick={() => setSettings((prev) => ({ ...prev, title }))}
            >
              AI 제목 추천
            </button>
          </div>
          <textarea
            className="essay-main-textarea"
            value={content}
            readOnly
            onSelect={selectFromTextarea}
            placeholder="아직 본문이 없어요. 오른쪽 패널에서 글감을 입력하거나 질문에 답한 뒤 에세이를 시작해 주세요."
          />
          <div className="essay-editor-foot">
            <span>{content.length.toLocaleString()}자</span>
            <span>{splitPages(content).length}쪽 예상</span>
            {selectedText && (
              <span>
                선택됨: {selectedText.slice(0, 18)}
                {selectedText.length > 18 ? "…" : ""}
              </span>
            )}
          </div>
        </section>

        <aside className="essay-ai-panel">
          {showQuestions ? (
            <div className="essay-ai-card essay-guided-question-card">
              <div className="question-progress">
                <span>{questionIndex + 1}</span> / {QUESTIONS.length}
              </div>
              <h2>
                {currentQuestion.question}
                {currentQuestion.optional && (
                  <span className="optional-inline"> (선택)</span>
                )}
              </h2>
              <textarea
                value={answers[currentQuestion.key]}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.key]: event.target.value,
                  }))
                }
                placeholder={currentQuestion.placeholder}
              />
              <div className="essay-panel-actions essay-guided-nav-actions">
                <button
                  type="button"
                  className="essay-ghost"
                  disabled={questionIndex === 0}
                  onClick={() =>
                    setQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                >
                  이전
                </button>
                {!isLastQuestion && (
                  <button
                    type="button"
                    className="essay-primary"
                    disabled={!currentAnswerReady}
                    onClick={goNextQuestion}
                  >
                    다음
                  </button>
                )}
                {isLastQuestion && (
                  <button
                    type="button"
                    className="essay-primary"
                    disabled={!canStartGuided}
                    onClick={writeGuidedStep}
                  >
                    에세이 작성
                  </button>
                )}
                <button
                  type="button"
                  className="essay-ghost danger"
                  onClick={resetEssay}
                >
                  초기화
                </button>
                <button
                  type="button"
                  className="essay-soft"
                  onClick={recommendGuidedAnswer}
                >
                  AI 추천
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`essay-ai-card ${(freeEditMode && isFree) || (guidedEditMode && isGuided) ? "essay-edit-active-card" : ""}`}
            >
              {(freeEditMode && isFree) || (guidedEditMode && isGuided) ? (
                <div className="essay-edit-mode-panel">
                  <div className="essay-edit-mode-head">
                    <span>수정하기</span>
                    <strong>
                      에세이 본문에서 바꾸고 싶은 부분을 드래그한 뒤 수정 요청을
                      입력하세요.
                    </strong>
                  </div>
                  <span className="essay-edit-section-label">
                    드래그한 부분
                  </span>
                  <div
                    className={`selected-preview ${selectedText ? "" : "empty"}`}
                  >
                    {selectedText ||
                      "수정하고 싶은 문장이나 문단을 드래그해 주세요."}
                  </div>
                  <span className="essay-edit-section-label">수정 요청</span>
                  <textarea
                    value={revisionRequest}
                    onChange={(event) => setRevisionRequest(event.target.value)}
                    placeholder="예: 이 부분을 더 따뜻하게 바꿔 주세요. / 문장을 조금 더 자연스럽게 다듬어 주세요."
                  />
                  <div className="essay-panel-actions essay-edit-actions">
                    <button
                      type="button"
                      className="essay-primary"
                      disabled={!selectedText || !revisionRequest}
                      onClick={applyRevision}
                    >
                      수정하기
                    </button>
                    <button
                      type="button"
                      className="essay-ghost"
                      onClick={() => {
                        if (isFree) closeFreeEditMode();
                        if (isGuided) {
                          setGuidedEditMode(false);
                          setSelectedText("");
                          setRevisionRequest("");
                        }
                      }}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isGuided && hasContent ? (
                    <div className="essay-guided-after-create">
                      <h2>에세이가 작성되었어요.</h2>
                      <p>
                        본문에서 수정하고 싶은 부분을 드래그한 뒤 수정하기
                        버튼을 눌러 주세요.
                      </p>
                      <button
                        type="button"
                        className="essay-primary"
                        onClick={() => {
                          setGuidedEditMode(true);
                          setRevisionRequest("");
                        }}
                      >
                        수정하기
                      </button>
                      <button
                        type="button"
                        className="essay-soft"
                        onClick={resetEssay}
                      >
                        다시 만들기
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2>
                        {hasContent
                          ? "다음에 이어 쓸 내용을 입력해 주세요."
                          : "글감이나 요청을 입력해 주세요."}
                      </h2>
                      <textarea
                        value={workInput}
                        onChange={(event) => setWorkInput(event.target.value)}
                        placeholder={
                          hasContent
                            ? "예: 그때 느꼈던 감정을 더 자세히 이어 써 주세요."
                            : "예: 친구와 다툰 뒤 미안한 마음이 들었던 일을 에세이로 쓰고 싶어요."
                        }
                      />
                      <div
                        className={`essay-panel-actions ${isFree ? "essay-free-action-bar" : "vertical"}`}
                      >
                        <button
                          type="button"
                          className="essay-soft"
                          disabled={!hasText(workInput)}
                          onClick={appendRaw}
                        >
                          {hasContent ? "그대로 이어붙이기" : "그대로 넣기"}
                        </button>
                        <button
                          type="button"
                          className="essay-soft"
                          disabled={!hasText(workInput)}
                          onClick={appendPolished}
                        >
                          {hasContent
                            ? "AI가 다듬어 이어붙이기"
                            : "AI가 다듬어 넣기"}
                        </button>
                        {isFree && (
                          <>
                            <button
                              type="button"
                              className="essay-primary"
                              onClick={askAi}
                            >
                              AI에게 요청하기
                            </button>
                            <button
                              type="button"
                              className="essay-ghost"
                              disabled={!hasContent}
                              onClick={() => {
                                setFreeEditMode(true);
                                setRevisionRequest("");
                              }}
                            >
                              수정하기
                            </button>
                          </>
                        )}
                      </div>
                      {isFree && (
                        <div className="essay-free-management">
                          <button
                            type="button"
                            className="essay-ghost"
                            disabled={!freeUndoSnapshot}
                            onClick={undoFreeAction}
                          >
                            되돌리기
                          </button>
                          <button
                            type="button"
                            className="essay-ghost"
                            disabled={!freeRedoSnapshot}
                            onClick={redoFreeAction}
                          >
                            앞으로 가기
                          </button>
                          <button
                            type="button"
                            className="essay-ghost danger"
                            onClick={resetEssay}
                          >
                            초기화
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {summaryMemo}
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => goStep("step2")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          disabled={!hasContent}
          onClick={() => goStep("step4")}
        >
          미리보기로 이동
        </button>
      </div>
    </section>
  );
}
