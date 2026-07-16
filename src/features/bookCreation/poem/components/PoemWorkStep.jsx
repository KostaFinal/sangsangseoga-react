import React, { useEffect, useState } from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import { answerQuestions, POEM_EDIT_DIRECTION_CHOICES } from '../data/poemQuestions.js';
import { getContentBase } from '../utils/poemTextUtils.js';


export default function PoemWorkStep({
  settings,
  answers,
  poem,
  poems,
  initialPoemBody,
  activePoem,
  setActivePoem,
  updatePoem,
  questionIndex,
  setQuestionIndex,
  updateCurrentPoemAnswers,
  updateCurrentPoemFreeRequest,
  makePoem,
  variant,
  setVariant,
  resetStep3,
  addPoem,
  deletePoem,
  setCurrentView,
  requestViewChange,
  isGenerating,
  generationNotice,
  requestFreePoemText,
  requestPoemRevision,
}) {
  const mode = settings.mode || 'answer';
  const isAnswerMode = mode === 'answer';
  const isFreeMode = mode === 'free';
  const questions = answerQuestions;
  const safeQuestionIndex = Math.min(questionIndex, questions.length - 1);
  const q = questions[safeQuestionIndex];
  const currentAnswerChoices = q.choices || [];
  const [answerEditMode, setAnswerEditMode] = useState(false);
  const [answerChoiceOpen, setAnswerChoiceOpen] = useState(false);
  const [answerSelectedText, setAnswerSelectedText] = useState('');
  const [answerEditRequest, setAnswerEditRequest] = useState('');
  const [answerEditChoiceOpen, setAnswerEditChoiceOpen] = useState(false);
  const [freeEditMode, setFreeEditMode] = useState(false);
  const [freeSelectedText, setFreeSelectedText] = useState('');
  const [freeEditRequest, setFreeEditRequest] = useState('');
  const [freeUndoSnapshot, setFreeUndoSnapshot] = useState(null);
  const [freeRedoSnapshot, setFreeRedoSnapshot] = useState(null);
  const [freeRequestBlank, setFreeRequestBlank] = useState(false);
  const answerReady = answerQuestions.every((item) => item.optional || String(answers[item.key] || '').trim());
  const freeBaseContent = getContentBase(poem.content);
  const freeHasContent = freeBaseContent.trim().length > 0;
  const canUseAiRequest = true;
  const poemGenerated = getContentBase(poem.content).trim().length > 0;
  // 선택+답변형은 오른쪽 질문에 답해서 AI가 첫 본문을 만들어주기 전까지는
  // 본문 칸에 직접 타이핑해서 시작할 수 없도록 막는다. (AI가 한 번 만든 뒤에는
  // 기존처럼 클릭해서 자유롭게 고칠 수 있다.)
  const answerBodyLocked = isAnswerMode && !poemGenerated;
  // 선택+답변형은 자유형과 달리 오른쪽에 직접 내용을 입력하는 칸이 없고 질문에 답하는
  // 방식뿐이라, 안내 문구에서 "오른쪽에서 내용을 입력하거나" 부분만 빼고 보여준다.
  // (poem.content 자체는 그대로 둬서 getContentBase() 같은 빈 상태 판별 로직은 안 건드린다.)
  const answerModePlaceholder = '아직 시가 없어요.\nAI에게 요청해 본문을 추가해 주세요.';
  const displayedPoemContent = isAnswerMode && poem.content === initialPoemBody
    ? answerModePlaceholder
    : poem.content;

  // 아직 아무것도 안 쓴 상태(placeholder 안내 문구가 그대로 있을 때)에서 본문 칸을
  // 클릭하면, 사용자가 안내 문구를 일일이 지우지 않아도 되게 바로 비워 준다.
  const handlePoemBodyFocus = () => {
    if (answerBodyLocked) return;
    if (poem.content === initialPoemBody) {
      updatePoem({ content: '' });
    }
  };

  const updateAnswer = (value) => {
    const nextAnswers = { ...answers, [q.key]: value };
    updateCurrentPoemAnswers(nextAnswers);
  };

  const applyAnswerChoice = (choice) => {
    updateAnswer(choice);
    setAnswerChoiceOpen(false);
  };

  const applyAnswerEditChoice = (choice) => {
    setAnswerEditRequest(choice.request);
    setAnswerEditChoiceOpen(false);
  };

  const goNextAnswer = () => {
    if (safeQuestionIndex < answerQuestions.length - 1) {
      setQuestionIndex((prev) => Math.min(answerQuestions.length - 1, prev + 1));
    }
  };

  const makeAnswerPoem = () => {
    makePoem({ answers }, { generationSource: 'answer' });
  };

  const saveFreeUndoSnapshot = () => {
    setFreeUndoSnapshot({
      poemId: poem.id,
      content: poem.content,
      title: poem.title,
      freeRequest: poem.freeRequest || '',
      generationSource: poem.generationSource || '',
    });
  };

  const requestFreeContinuation = async () => {
    if (!String(poem.freeRequest || '').trim()) {
      setFreeRequestBlank(true);
      return;
    }
    setFreeRequestBlank(false);
    saveFreeUndoSnapshot();
    const result = await requestFreePoemText();
    if (result.ok) {
      setFreeRedoSnapshot(null);
    }
  };

  const undoFreeAction = () => {
    if (!freeUndoSnapshot || freeUndoSnapshot.poemId !== poem.id) return;
    setFreeRedoSnapshot({
      poemId: poem.id,
      content: poem.content,
      title: poem.title,
      freeRequest: poem.freeRequest || '',
      generationSource: poem.generationSource || '',
    });
    updatePoem({
      content: freeUndoSnapshot.content,
      title: freeUndoSnapshot.title,
      freeRequest: freeUndoSnapshot.freeRequest,
      generationSource: freeUndoSnapshot.generationSource,
    });
    setFreeUndoSnapshot(null);
  };

  const redoFreeAction = () => {
    if (!freeRedoSnapshot || freeRedoSnapshot.poemId !== poem.id) return;
    setFreeUndoSnapshot({
      poemId: poem.id,
      content: poem.content,
      title: poem.title,
      freeRequest: poem.freeRequest || '',
      generationSource: poem.generationSource || '',
    });
    updatePoem({
      content: freeRedoSnapshot.content,
      title: freeRedoSnapshot.title,
      freeRequest: freeRedoSnapshot.freeRequest,
      generationSource: freeRedoSnapshot.generationSource,
    });
    setFreeRedoSnapshot(null);
  };

  const resetGuidedWork = () => {
    const ok = window.confirm('현재 작성 중인 시와 입력 내용을 초기화할까요?');
    if (!ok) return;
    resetStep3();
    setAnswerEditMode(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setAnswerEditChoiceOpen(false);
  };

  const resetFreeWork = () => {
    const ok = window.confirm('현재 작성 중인 시와 입력 내용을 초기화할까요?');
    if (!ok) return;
    updatePoem({
      title: '아직 제목이 없어요',
      content: initialPoemBody,
      freeRequest: '',
      generationSource: '',
    });
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
    setFreeUndoSnapshot(null);
    setFreeRedoSnapshot(null);
  };

  const applyFreeEdit = async () => {
    const selected = freeSelectedText;
    const request = freeEditRequest.trim();
    if (!selected.trim() || !request) return;
    saveFreeUndoSnapshot();
    const result = await requestPoemRevision({ selectedText: selected, editRequest: request });
    if (result.ok) {
      setFreeRedoSnapshot(null);
      setFreeSelectedText('');
      setFreeEditRequest('');
    }
  };

  const closeFreeEditMode = () => {
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
  };

  useEffect(() => {
    setAnswerEditMode(false);
    setAnswerChoiceOpen(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setAnswerEditChoiceOpen(false);
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
    setFreeUndoSnapshot(null);
    setFreeRedoSnapshot(null);
    setFreeRequestBlank(false);
  }, [poem.id, mode]);

  useEffect(() => {
    setAnswerChoiceOpen(false);
  }, [safeQuestionIndex]);

  const handlePoemTextSelect = (event) => {
    if (!answerEditMode && !freeEditMode) return;
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number' || start === end) return;
    const selectedText = target.value.slice(start, end);

    if (answerEditMode) {
      setAnswerSelectedText(selectedText);
    }

    if (freeEditMode) {
      setFreeSelectedText(selectedText);
    }
  };


  const applyAnswerEdit = async () => {
    const selected = answerSelectedText;
    if (!selected || !answerEditRequest.trim()) return;
    const result = await requestPoemRevision({ selectedText: selected, editRequest: answerEditRequest });
    if (result.ok) {
      setAnswerSelectedText('');
      setAnswerEditRequest('');
    }
  };

  const closeAnswerEditMode = () => {
    setAnswerEditMode(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setAnswerEditChoiceOpen(false);
  };

  const freeInputPlaceholder = `예: 다음 연은 밤 장면으로 이어줘
예: 조금 더 따뜻한 분위기로 이어줘
예: 이 분위기로 자연스럽게 이어줘`;
  const freeSelectionType = freeSelectedText.trim() && freeSelectedText.trim() === getContentBase(poem.content).trim() ? '전체 선택됨' : '선택 부분';
  const isFreeEditing = isFreeMode && freeEditMode;

  return (
    <section className="step-page editor-step">
      <PoemFlowStepper active={2} />

      <div className={`editor-grid ${((answerEditMode && isAnswerMode) || isFreeEditing) ? 'edit-mode-grid' : ''}`}>
        <aside className="page-panel">
          <div className="page-panel-head">
            <h3>시</h3>
            <div className="page-panel-actions">
              <button onClick={addPoem} aria-label="시 추가">+</button>
              <button onClick={deletePoem} disabled={poems.length === 1} aria-label="시 삭제">-</button>
            </div>
          </div>
          <div className="page-thumbs">
            {poems.map((item, index) => (
              <button key={item.id} className={activePoem === index ? 'active' : ''} onClick={() => setActivePoem(index)}>
                <div className="thumb-paper">
                  <span>{index + 1}</span>
                  <i />
                  <i />
                  <i />
                </div>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="result-panel">
          <div className="poem-canvas">
            <div className="title-editor">
              <label>시 제목</label>
              <input value={poem.title} onChange={(e) => updatePoem({ title: e.target.value })} />
            </div>

            <div className="body-label-row">
              <label className="body-label">시 본문</label>
              <span className="body-edit-hint">
                {answerBodyLocked
                  ? '오른쪽 질문에 답하면 이곳에 시가 채워져요'
                  : '이 안을 클릭해서 직접 고칠 수도 있어요'}
              </span>
            </div>
            <textarea
              className={answerBodyLocked ? 'poem-body-locked' : ''}
              value={displayedPoemContent}
              readOnly={answerBodyLocked}
              aria-readonly={answerBodyLocked}
              onChange={(event) => {
                if (answerBodyLocked) return;
                updatePoem({ content: event.target.value });
              }}
              onFocus={handlePoemBodyFocus}
              onSelect={handlePoemTextSelect}
              onMouseUp={handlePoemTextSelect}
              onKeyUp={handlePoemTextSelect}
            />
          </div>
        </section>

        <aside className="ai-panel">
          {isAnswerMode && (
            <>
              <div className={`question-card answer-question-card ${answerEditMode ? 'edit-active-card' : ''}`}>
                {answerEditMode ? (
                  <div className="edit-mode-panel focused-edit-panel">
                    <div className="edit-mode-head">
                      <span>수정하기</span>
                      <strong>시 본문에서 바꾸고 싶은 부분을 드래그해 주세요.</strong>
                    </div>
                    <span className="edit-section-label">드래그한 부분</span>
                    <div className={`selected-edit-text ${answerSelectedText ? '' : 'empty'}`}>
                      {answerSelectedText || '수정하고 싶은 문장이나 구절을 드래그해 주세요.'}
                    </div>
                    <span className="edit-section-label edit-request-label">수정 요청</span>
                    <textarea
                      className="answer-input edit-request-input"
                      value={answerEditRequest}
                      placeholder="예: 더 시적으로 다듬어줘 / 내용을 더 간결하게 줄여줘 / 이미지와 표현을 조금 더 풍성하게 늘려줘"
                      onChange={(event) => setAnswerEditRequest(event.target.value)}
                    />
                    <div className="answer-choice-helper edit-choice-helper">
                      <button
                        type="button"
                        className="answer-choice-toggle"
                        aria-expanded={answerEditChoiceOpen}
                        onClick={() => setAnswerEditChoiceOpen((open) => !open)}
                      >
                        수정 방향 선택하기 ▼
                      </button>
                      {answerEditChoiceOpen && (
                        <div className="answer-choice-options edit-choice-options" aria-label="수정 방향 선택지">
                          {POEM_EDIT_DIRECTION_CHOICES.map((choice) => (
                            <button
                              key={choice.label}
                              type="button"
                              className={answerEditRequest === choice.request ? 'selected' : ''}
                              onClick={() => applyAnswerEditChoice(choice)}
                            >
                              {choice.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mini-nav edit-actions">
                      <button
                        className="primary small"
                        disabled={!answerSelectedText.trim() || !answerEditRequest.trim() || isGenerating}
                        onClick={applyAnswerEdit}
                      >
                        {isGenerating ? '수정 중...' : '수정하기'}
                      </button>
                      <button className="ghost small" onClick={closeAnswerEditMode}>닫기</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="question-head">
                      <span>질문 {safeQuestionIndex + 1} / {answerQuestions.length}</span>
                      <strong>{q.label}</strong>
                    </div>
                    <h3>{q.question}</h3>
                    <textarea
                      className="answer-input"
                      value={answers[q.key] || ''}
                      placeholder={q.placeholder}
                      onChange={(event) => updateAnswer(event.target.value)}
                    />
                    {currentAnswerChoices.length > 0 && (
                      <div className="answer-choice-helper">
                        <button
                          type="button"
                          className="answer-choice-toggle"
                          aria-expanded={answerChoiceOpen}
                          onClick={() => setAnswerChoiceOpen((open) => !open)}
                        >
                          선택지로 답변하기 ▼
                        </button>
                        {answerChoiceOpen && (
                          <div className="answer-choice-options" aria-label={`${q.label} 선택지`}>
                            {currentAnswerChoices.map((choice) => (
                              <button
                                key={choice}
                                type="button"
                                className={answers[q.key] === choice ? 'selected' : ''}
                                onClick={() => applyAnswerChoice(choice)}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mini-nav">
                      <button className="ghost small" disabled={safeQuestionIndex === 0} onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}>이전</button>
                      {poemGenerated ? (
                        <button className="primary small" onClick={() => setAnswerEditMode(true)}>수정하기</button>
                      ) : safeQuestionIndex < answerQuestions.length - 1 ? (
                        <button className="primary small" disabled={!q.optional && !String(answers[q.key] || '').trim()} onClick={goNextAnswer}>다음</button>
                      ) : (
                        <button className="primary small" disabled={!answerReady || isGenerating} onClick={makeAnswerPoem}>
                          {isGenerating ? '만드는 중...' : '시 만들기'}
                        </button>
                      )}
                      {/* AI 전체 만들기 버튼이 있던 자리(2x2 mini-nav의 오른쪽 아래 칸)에 그대로 배치 */}
                      <button className="ghost small danger" style={{ gridColumn: 2 }} onClick={resetGuidedWork}>초기화</button>
                    </div>
                  </>
                )}
              </div>

              {!answerEditMode && (
                <div className="history-card answer-history-card">
                  <h3>답변 히스토리</h3>
                  {answerQuestions.map((item) => (
                    <div key={item.key}>
                      <span>{item.label}</span>
                      <strong>{answers[item.key] || ''}</strong>
                    </div>
                  ))}
                </div>
              )}

              {generationNotice && <p className="ai-generation-notice">{generationNotice}</p>}
            </>
          )}

          {isFreeMode && (
            <>
              <div className={`question-card answer-question-card ${freeEditMode ? 'edit-active-card' : ''}`}>
                {freeEditMode ? (
                  <div className="edit-mode-panel focused-edit-panel free-edit-panel">
                    <div className="edit-mode-head">
                      <span>수정하기</span>
                      <strong>시 본문에서 바꾸고 싶은 부분을 드래그해 주세요. 전체를 드래그하면 전체 수정으로 처리돼요.</strong>
                    </div>
                    <span className="edit-section-label">{freeSelectedText ? freeSelectionType : '드래그한 부분'}</span>
                    <div className={`selected-edit-text ${freeSelectedText ? '' : 'empty'}`}>
                      {freeSelectedText || '수정하고 싶은 문장이나 구절을 드래그해 주세요.'}
                    </div>
                    <span className="edit-section-label edit-request-label">수정 방향</span>
                    <textarea
                      className="answer-input edit-request-input"
                      value={freeEditRequest}
                      placeholder="예: 더 따뜻하게 바꿔줘 / 짧게 줄여줘 / 비유를 넣어줘 / 오타와 어색한 표현만 고쳐줘"
                      onChange={(event) => setFreeEditRequest(event.target.value)}
                    />
                    <div className="mini-nav edit-actions free-edit-actions">
                      <button
                        className="primary small"
                        disabled={!freeSelectedText.trim() || !freeEditRequest.trim() || isGenerating}
                        onClick={applyFreeEdit}
                      >
                        {isGenerating ? '수정 중...' : '선택 부분 수정'}
                      </button>
                      <button className="ghost small" onClick={closeFreeEditMode}>닫기</button>
                    </div>
                  </div>
                ) : !freeHasContent ? (
                  <>
                    <div className="question-head">
                      <span>자유형</span>
                    </div>
                    <h3>먼저 왼쪽 본문에 시를 직접 써 주세요.</h3>
                    <p className="free-guide-text">
                      본문을 쓰고 나면 여기서 이어 쓰거나 AI에게 다음 흐름을 부탁할 수 있어요.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="question-head">
                      <span>자유형</span>
                      <strong>이어가기</strong>
                    </div>
                    <h3>현재 시 뒤에 어떻게 이어갈까요?</h3>
                    <p className="free-guide-text">
                      입력창에 AI에게 부탁할 방향을 적고 요청하세요.
                    </p>
                    <textarea
                      className="answer-input free-input"
                      value={poem.freeRequest || ''}
                      placeholder={freeInputPlaceholder}
                      onChange={(event) => {
                        updateCurrentPoemFreeRequest(event.target.value);
                        if (freeRequestBlank) setFreeRequestBlank(false);
                      }}
                    />
                    {freeRequestBlank && (
                      <p className="free-request-blank-notice">이어갈 방향을 입력해 주세요.</p>
                    )}

                    <div className="free-action-bar" aria-label="자유형 작업 버튼">
                      <button className="primary small" disabled={!canUseAiRequest || isGenerating} onClick={requestFreeContinuation}>
                        {isGenerating ? '요청하는 중...' : 'AI에게 요청하기'}
                      </button>
                      <button className="ghost small" onClick={() => setFreeEditMode(true)}>
                        수정하기
                      </button>
                    </div>

                    <div className="free-management">
                      <button className="ghost small" disabled={!freeUndoSnapshot || freeUndoSnapshot.poemId !== poem.id} onClick={undoFreeAction}>되돌리기</button>
                      <button className="ghost small" disabled={!freeRedoSnapshot || freeRedoSnapshot.poemId !== poem.id} onClick={redoFreeAction}>앞으로 가기</button>
                      <button className="ghost small danger" onClick={resetFreeWork}>초기화</button>
                    </div>
                  </>
                )}
              </div>

              {generationNotice && <p className="ai-generation-notice">{generationNotice}</p>}
            </>
          )}
        </aside>
      </div>

      <div className="bottom-actions">
        <button className="ghost" onClick={() => requestViewChange('step1')}>이전</button>
        <button className="primary" disabled={!poemGenerated} onClick={() => setCurrentView('step3')}>다음</button>
      </div>
    </section>
  );
}
