import React from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";
import { QUESTIONS, ESSAY_EDIT_DIRECTION_CHOICES } from "../data/essayQuestions.js";
import { hasText, splitPages } from "../utils/essayTextUtils.js";

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
    updateContent,
    title,
    workInput,
    setWorkInput,
    writeGuidedStep,
    recommendGuidedAnswer,
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
    requestViewChange,
    resetEssay,
    isGenerating,
    generationNotice,
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
  // 답변형은 시와 마찬가지로 AI가 처음 초안을 만들어주기 전까지는 본문을 직접 타이핑할
  // 수 없게 막다가(질문에 답해야만 시작), 초안이 한 번 나온 뒤에는 드래그+수정요청 흐름과
  // 별개로 본문을 클릭해서 바로 고칠 수 있게 한다. 자유형은 처음부터 시처럼 직접 써도 된다.
  const bodyDirectlyEditable = isFree || (isGuided && hasContent);
  const [hideGuidedAfterCreate, setHideGuidedAfterCreate] = React.useState(false);
  const [answerChoiceOpen, setAnswerChoiceOpen] = React.useState(false);
  const [editChoiceOpen, setEditChoiceOpen] = React.useState(false);
  const [freeRequestBlank, setFreeRequestBlank] = React.useState(false);
  const showQuestions = isGuided && (!guidedComplete || hideGuidedAfterCreate);
  const canStartGuided = isLastQuestion && allRequiredReady;
  const currentAnswerChoices = currentQuestion.choices || [];

  React.useEffect(() => {
    setAnswerChoiceOpen(false);
  }, [questionIndex]);

  React.useEffect(() => {
    if (!guidedEditMode && !freeEditMode) {
      setEditChoiceOpen(false);
    }
  }, [guidedEditMode, freeEditMode]);

  const applyAnswerChoice = (choice) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: choice,
    }));
    setAnswerChoiceOpen(false);
  };

  const applyEditChoice = (choice) => {
    setRevisionRequest(choice.request);
    setEditChoiceOpen(false);
  };

  const goNextQuestion = () => {
    if (!currentAnswerReady) return;
    setQuestionIndex((prev) => Math.min(QUESTIONS.length - 1, prev + 1));
  };

  const requestFreeAi = () => {
    if (!hasText(workInput)) {
      setFreeRequestBlank(true);
      return;
    }
    setFreeRequestBlank(false);
    askAi();
  };

  const confirmResetEssay = () => {
    const ok = window.confirm("현재 작성 중인 에세이와 입력 내용을 초기화할까요?");
    if (!ok) return;
    resetEssay();
    setAnswerChoiceOpen(false);
    setEditChoiceOpen(false);
    setHideGuidedAfterCreate(false);
    setFreeRequestBlank(false);
  };

  const closeGuidedAfterCreate = () => {
    setQuestionIndex(0);
    setWorkInput("");
    setSelectedText("");
    setRevisionRequest("");
    setAnswerChoiceOpen(false);
    setEditChoiceOpen(false);
    setGuidedEditMode(false);
    setHideGuidedAfterCreate(true);
  };

  return (
    <section className="essay-studio-page">
      <div className="essay-studio-top">
        <EssayFlowStepper active={2} />
      </div>

      <div
        className={`essay-studio-layout ${isFree ? "free-layout" : ""} ${isGuided ? "guided-layout" : ""}`}
      >
        <section className="essay-editor-panel">
          <div className="essay-editor-title-row">
            <label>
              <span>제목</span>
              <input
                value={settings.title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder={
                  hasContent
                    ? title
                    : "제목을 입력하거나 AI 추천 제목을 사용하세요."
                }
              />
            </label>
          </div>
          {bodyDirectlyEditable && (
            <div className="essay-body-edit-hint">
              {hasContent ? "이 안을 클릭해서 직접 고칠 수도 있어요" : "이 안에 바로 써도 돼요"}
            </div>
          )}
          <textarea
            className="essay-main-textarea"
            value={content}
            readOnly={!bodyDirectlyEditable}
            onChange={(event) => {
              if (!bodyDirectlyEditable) return;
              updateContent(event.target.value);
            }}
            onSelect={selectFromTextarea}
            placeholder={
              isFree
                ? "여기에 바로 써도 되고, 오른쪽 패널에 글감을 입력해 AI에게 맡겨도 돼요."
                : "아직 본문이 없어요. 오른쪽 패널에서 글감을 입력하거나 질문에 답한 뒤 에세이를 시작해 주세요."
            }
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
              {currentAnswerChoices.length > 0 && (
                <div className="essay-answer-choice-helper">
                  <button
                    type="button"
                    className="essay-choice-toggle"
                    aria-expanded={answerChoiceOpen}
                    onClick={() => setAnswerChoiceOpen((open) => !open)}
                  >
                    선택지로 답변하기 ▼
                  </button>
                  {answerChoiceOpen && (
                    <div
                      className="essay-choice-options"
                      aria-label={`${currentQuestion.label} 선택지`}
                    >
                      {currentAnswerChoices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          className={answers[currentQuestion.key] === choice ? "selected" : ""}
                          onClick={() => applyAnswerChoice(choice)}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                    disabled={!canStartGuided || isGenerating}
                    onClick={() => {
                      writeGuidedStep();
                      setHideGuidedAfterCreate(false);
                    }}
                  >
                    {isGenerating ? "만드는 중..." : "에세이 만들기"}
                  </button>
                )}
                  <button
                    type="button"
                    className="essay-ghost danger"
                    onClick={confirmResetEssay}
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
                    placeholder={
                      isGuided
                        ? "예: 어색한 표현을 자연스럽게 다듬어줘 / 경험과 생각이 더 풍성하게 드러나도록 늘려줘"
                        : "예: 이 부분을 더 따뜻하게 바꿔 주세요. / 문장을 조금 더 자연스럽게 다듬어 주세요."
                    }
                  />
                  {isGuided && (
                    <div className="essay-answer-choice-helper essay-edit-choice-helper">
                      <button
                        type="button"
                        className="essay-choice-toggle"
                        aria-expanded={editChoiceOpen}
                        onClick={() => setEditChoiceOpen((open) => !open)}
                      >
                        수정 방향 선택하기 ▼
                      </button>
                      {editChoiceOpen && (
                        <div className="essay-choice-options essay-edit-choice-options" aria-label="수정 방향 선택지">
                          {ESSAY_EDIT_DIRECTION_CHOICES.map((choice) => (
                            <button
                              key={choice.label}
                              type="button"
                              className={revisionRequest === choice.request ? "selected" : ""}
                              onClick={() => applyEditChoice(choice)}
                            >
                              {choice.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="essay-panel-actions essay-edit-actions">
                    <button
                      type="button"
                      className="essay-primary"
                      disabled={!selectedText || !revisionRequest || isGenerating}
                      onClick={applyRevision}
                    >
                      {isGenerating ? "수정 중..." : "수정하기"}
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
                          setEditChoiceOpen(false);
                        }
                      }}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isGuided && hasContent && !hideGuidedAfterCreate ? (
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
                          setEditChoiceOpen(false);
                        }}
                      >
                        수정하기
                      </button>
                      <button
                        type="button"
                        className="essay-soft"
                        onClick={closeGuidedAfterCreate}
                      >
                        다시 만들기
                      </button>

                      <h2>더 이어서 쓰고 싶다면</h2>
                      <p>
                        에세이는 보통 길게 이어져요. 다음 문단에 이어갈
                        방향을 적어 주세요.
                      </p>
                      <textarea
                        value={workInput}
                        onChange={(event) => {
                          setWorkInput(event.target.value);
                          if (freeRequestBlank) setFreeRequestBlank(false);
                        }}
                        placeholder="예: 그때 느꼈던 감정을 더 자세히 이어 써 주세요."
                      />
                      {freeRequestBlank && (
                        <p className="free-request-blank-notice">이어 쓸 내용을 입력해 주세요.</p>
                      )}
                      <button
                        type="button"
                        className="essay-primary"
                        disabled={isGenerating}
                        onClick={requestFreeAi}
                      >
                        {isGenerating ? "이어쓰는 중..." : "이어서 쓰기"}
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
                        onChange={(event) => {
                          setWorkInput(event.target.value);
                          if (freeRequestBlank) setFreeRequestBlank(false);
                        }}
                        placeholder={
                          hasContent
                            ? "예: 그때 느꼈던 감정을 더 자세히 이어 써 주세요."
                            : "예: 친구와 다툰 뒤 미안한 마음이 들었던 일을 에세이로 쓰고 싶어요."
                        }
                      />
                      {isFree && freeRequestBlank && (
                        <p className="free-request-blank-notice">
                          {hasContent ? "이어 쓸 내용을 입력해 주세요." : "글감이나 요청을 입력해 주세요."}
                        </p>
                      )}
                      <div
                        className={`essay-panel-actions ${isFree ? "essay-free-action-bar" : "vertical"}`}
                      >
                        {isFree && (
                          <>
                            <button
                              type="button"
                              className="essay-primary"
                              disabled={isGenerating}
                              onClick={requestFreeAi}
                            >
                              {isGenerating ? "요청하는 중..." : "AI에게 요청하기"}
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
                            onClick={confirmResetEssay}
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

          {generationNotice && <p className="ai-generation-notice">{generationNotice}</p>}
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => requestViewChange("step1")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          disabled={!hasContent}
          onClick={() => goStep("step3")}
        >
          미리보기로 이동
        </button>
      </div>
    </section>
  );
}
