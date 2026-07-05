import React, { useEffect, useState } from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import { answerQuestions, POEM_EDIT_DIRECTION_CHOICES } from '../data/poemQuestions.js';
import { getGeneratedPoemText, getFreeRequestedText, joinPoemText, polishFreeInput, getFreeContinuationText, getFreeRevisionText, getAnswerRevisionText, getContentBase, getTitleIdeas } from '../utils/poemTextUtils.js';


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
  makeAll,
  variant,
  setVariant,
  resetStep3,
  titleIdeas,
  addPoem,
  deletePoem,
  setCurrentView,
  requestViewChange,
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
  const [freeAction, setFreeAction] = useState('raw');
  const [freeEditMode, setFreeEditMode] = useState(false);
  const [freeSelectedText, setFreeSelectedText] = useState('');
  const [freeEditRequest, setFreeEditRequest] = useState('');
  const [freeUndoSnapshot, setFreeUndoSnapshot] = useState(null);
  const [freeRedoSnapshot, setFreeRedoSnapshot] = useState(null);
  const answerReady = answerQuestions.every((item) => item.optional || String(answers[item.key] || '').trim());
  const freeInputReady = String(poem.freeRequest || '').trim().length > 0;
  const freeBaseContent = getContentBase(poem.content);
  const freeHasContent = freeBaseContent.trim().length > 0;
  const canUseRawFreeAction = freeInputReady;
  const canUseAiRequest = true;
  const poemGenerated = getContentBase(poem.content).trim().length > 0;

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

  const regenerateAnswerPoem = () => {
    if (poem.generationSource === 'basic') {
      makeAll();
      return;
    }

    makeAnswerPoem();
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

  const applyFreeAction = (action) => {
    const input = String(poem.freeRequest || '').trim();
    const base = getContentBase(poem.content);
    const hasBase = base.trim().length > 0;
    let addition = '';

    if (action === 'raw') {
      if (!input) return;
      addition = input;
    }

    if (action === 'polish') {
      if (!input) return;
      addition = polishFreeInput(input);
    }

    if (action === 'ask') {
      if (hasBase) {
        addition = getFreeContinuationText(base, input, settings, variant);
      } else {
        addition = getFreeRequestedText(input, settings, variant);
      }
    }

    if (!addition.trim()) return;
    saveFreeUndoSnapshot();
    setFreeRedoSnapshot(null);
    setFreeAction(action);
    const title = poem.title === '아직 제목이 없어요' ? getTitleIdeas(settings, poem)[0] : poem.title;
    updatePoem({
      title,
      content: joinPoemText(base, addition),
      freeRequest: '',
      generationSource: `free-${action}`,
    });
    setVariant((v) => v + 1);
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
    setFreeAction('raw');
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
    setFreeUndoSnapshot(null);
    setFreeRedoSnapshot(null);
  };

  const applyFreeEdit = () => {
    const selected = freeSelectedText;
    const request = freeEditRequest.trim();
    if (!selected.trim() || !request) return;
    const edited = getFreeRevisionText(selected, request);
    if (!edited) return;
    saveFreeUndoSnapshot();
    setFreeRedoSnapshot(null);
    updatePoem({ content: poem.content.replace(selected, edited), generationSource: 'free-edit' });
    setFreeSelectedText('');
    setFreeEditRequest('');
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


  const applyAnswerEdit = () => {
    const selected = answerSelectedText;
    if (!selected || !answerEditRequest.trim()) return;
    const edited = getAnswerRevisionText(selected, answerEditRequest);
    if (!edited) return;
    updatePoem({ content: poem.content.replace(selected, edited) });
    setAnswerSelectedText('');
    setAnswerEditRequest('');
  };

  const closeAnswerEditMode = () => {
    setAnswerEditMode(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setAnswerEditChoiceOpen(false);
  };

  const freeLastActionLabel = freeAction === 'raw'
    ? (freeHasContent ? '그대로 이어 붙이기' : '그대로 넣기')
    : freeAction === 'polish'
      ? (freeHasContent ? 'AI가 다듬어 이어 붙이기' : 'AI가 다듬어 넣기')
      : 'AI에게 요청하기';
  const freePanelStateLabel = freeHasContent ? '이어가기' : '처음 넣기';
  const freeInputPlaceholder = freeHasContent
    ? `예: 다음 연은 밤 장면으로 이어줘
예: 조금 더 따뜻한 분위기로 이어줘
예: 이 분위기로 자연스럽게 이어줘`
    : `예: 꿈은 밤마다 내 창문을 두드리고...
예: 꿈을 주제로 첫 연만 써줘
예: 따뜻한 자유시 한 편을 써줘`; 
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
              <div className="title-recommend">
                <button
                  type="button"
                  className="essay-soft essay-title-button poem-title-recommend-button"
                  onClick={() => updatePoem({ title: titleIdeas[0] || '나의 시' })}
                >
                  AI제목추천
                </button>
              </div>
            </div>

            <label className="body-label">시 본문</label>
            <textarea
              value={poem.content}
              readOnly
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
                        disabled={!answerSelectedText.trim() || !answerEditRequest.trim()}
                        onClick={applyAnswerEdit}
                      >
                        수정하기
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
                        <button className="primary small" disabled={!answerReady} onClick={makeAnswerPoem}>시 만들기</button>
                      )}
                      <button className="ghost small danger" onClick={resetGuidedWork}>초기화</button>
                      <button className="primary small" onClick={poemGenerated ? regenerateAnswerPoem : makeAll}>
                        {poemGenerated ? 'AI 전체 재생성' : 'AI 전체 만들기'}
                      </button>
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
                        disabled={!freeSelectedText.trim() || !freeEditRequest.trim()}
                        onClick={applyFreeEdit}
                      >
                        선택 부분 수정
                      </button>
                      <button className="ghost small" onClick={closeFreeEditMode}>닫기</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="question-head">
                      <span>자유형</span>
                      <strong>{freePanelStateLabel}</strong>
                    </div>
                    <h3>{freeHasContent ? '현재 시 뒤에 어떻게 이어갈까요?' : '본문에 넣을 첫 내용을 만들어 주세요.'}</h3>
                    <p className="free-guide-text">
                      {freeHasContent
                        ? '입력창에 이어 붙일 내용이나 AI에게 부탁할 방향을 적고 버튼을 선택하세요.'
                        : '입력창에 직접 쓴 시나 AI에게 부탁할 내용을 적고 버튼을 선택하세요.'}
                    </p>
                    <textarea
                      className="answer-input free-input"
                      value={poem.freeRequest || ''}
                      placeholder={freeInputPlaceholder}
                      onChange={(event) => updateCurrentPoemFreeRequest(event.target.value)}
                    />

                    <p className="free-ai-request-note">
                      {freeHasContent
                        ? '입력창을 비우고 AI에게 요청하면 현재 시의 흐름을 자연스럽게 이어 써요.'
                        : '입력창을 비우고 AI에게 요청하면 기본 설정만으로 시 한 편을 만들어줘요.'}
                    </p>

                    <div className="free-action-bar" aria-label="자유형 작업 버튼">
                      <button
                        className="ghost small"
                        disabled={!canUseRawFreeAction}
                        onClick={() => applyFreeAction('raw')}
                      >
                        {freeHasContent ? '그대로 이어 붙이기' : '그대로 넣기'}
                      </button>
                      <button
                        className="ghost small"
                        disabled={!canUseRawFreeAction}
                        onClick={() => applyFreeAction('polish')}
                      >
                        {freeHasContent ? 'AI가 다듬어 이어 붙이기' : 'AI가 다듬어 넣기'}
                      </button>
                      <button className="primary small" disabled={!canUseAiRequest} onClick={() => applyFreeAction('ask')}>
                        AI에게 요청하기
                      </button>
                      <button className="ghost small" disabled={!freeHasContent} onClick={() => setFreeEditMode(true)}>
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

              {!freeEditMode && (
                <div className="history-card free-summary-card">
                  <h3>작성 요약</h3>
                  <div>
                    <span>방식</span>
                    <strong>{freeLastActionLabel}</strong>
                  </div>
                  <div>
                    <span>입력</span>
                    <strong>{poem.freeRequest || ''}</strong>
                  </div>
                </div>
              )}
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
