import React, { useMemo, useState } from 'react';
import EssayModeStep from './components/EssayModeStep.jsx';
import EssaySettingStep from './components/EssaySettingStep.jsx';
import EssayWorkStep from './components/EssayWorkStep.jsx';
import EssayPreviewStep from './components/EssayPreviewStep.jsx';
import { ConfirmModal } from '../../../shared/components';
import {
  initialSettings,
  initialAnswers,
  HISTORY_LIMIT,
  QUESTIONS,
  createId,
  hasText,
  clean,
  joinText,
  polishText,
  makeOpeningEssay,
  makeGuidedEssayThrough,
  getGuidedSuggestion,
  makeFreeEssay,
  makeContinuation,
  reviseSelection,
  splitPages,
  getDisplayTitle,
} from './essayShared.js';

export default function EssayApp({ onSwitchGenre, initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const [view, setView] = useState(initialView);
  const [settings, setSettings] = useState(initialSettings);
  const [answers, setAnswers] = useState(initialAnswers);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [guidedComplete, setGuidedComplete] = useState(false);
  const [content, setContent] = useState('');
  const [workInput, setWorkInput] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [revisionRequest, setRevisionRequest] = useState('');
  const [freeEditMode, setFreeEditMode] = useState(false);
  const [guidedEditMode, setGuidedEditMode] = useState(false);
  const [freeUndoSnapshot, setFreeUndoSnapshot] = useState(null);
  const [freeRedoSnapshot, setFreeRedoSnapshot] = useState(null);
  const [variant, setVariant] = useState(0);
  const [activePreviewPage, setActivePreviewPage] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const title = getDisplayTitle(settings, answers, content);
  const pages = useMemo(() => splitPages(content), [content]);

  const recordHistory = (label, detail = '') => {
    setHistory((prev) => [{ id: createId(), label, detail, at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, HISTORY_LIMIT));
  };

  const updateContent = (next, label = '본문 수정', detail = '') => {
    setContent(next);
    recordHistory(label, detail);
  };

  const makeFreeSnapshot = () => ({
    content,
    workInput,
    title: settings.title,
  });

  const saveFreeUndoSnapshot = () => {
    if (settings.mode !== 'free') return;
    setFreeUndoSnapshot(makeFreeSnapshot());
    setFreeRedoSnapshot(null);
  };

  const restoreFreeSnapshot = (snapshot, label) => {
    if (!snapshot) return;
    setContent(snapshot.content || '');
    setWorkInput(snapshot.workInput || '');
    setSettings((prev) => ({ ...prev, title: snapshot.title || '' }));
    setSelectedText('');
    setRevisionRequest('');
    setFreeEditMode(false);
    setGuidedEditMode(false);
    recordHistory(label, '자유형 작업 상태 복원');
  };

  const undoFreeAction = () => {
    if (!freeUndoSnapshot) return;
    setFreeRedoSnapshot(makeFreeSnapshot());
    restoreFreeSnapshot(freeUndoSnapshot, '되돌리기');
    setFreeUndoSnapshot(null);
  };

  const redoFreeAction = () => {
    if (!freeRedoSnapshot) return;
    setFreeUndoSnapshot(makeFreeSnapshot());
    restoreFreeSnapshot(freeRedoSnapshot, '앞으로 가기');
    setFreeRedoSnapshot(null);
  };

  const closeFreeEditMode = () => {
    setFreeEditMode(false);
    setSelectedText('');
    setRevisionRequest('');
  };

  const resetEssay = () => {
    setAnswers(initialAnswers);
    setQuestionIndex(0);
    setGuidedComplete(false);
    setContent('');
    setWorkInput('');
    setSelectedText('');
    setRevisionRequest('');
    setFreeEditMode(false);
    setGuidedEditMode(false);
    setFreeUndoSnapshot(null);
    setFreeRedoSnapshot(null);
    setHistory([]);
    setVariant(0);
    setActivePreviewPage(0);
  };

  const startEssay = () => {
    saveFreeUndoSnapshot();
    const next = settings.mode === 'free'
      ? makeFreeEssay(settings, workInput, variant)
      : makeOpeningEssay(settings, answers, variant);
    updateContent(next, '에세이 시작', settings.mode === 'free' ? clean(workInput).slice(0, 40) : '질문 답변 기반');
    setWorkInput('');
    setVariant((prev) => prev + 1);
  };

  const writeGuidedStep = () => {
    const question = QUESTIONS[Math.min(questionIndex, QUESTIONS.length - 1)];
    if (!question) return;
    if (!question.optional && !hasText(answers[question.key])) return;
    const requiredReady = QUESTIONS.every((item) => item.optional || hasText(answers[item.key]));
    if (question.optional && !requiredReady) return;

    const next = makeGuidedEssayThrough(settings, answers, questionIndex, variant);
    updateContent(next, questionIndex === 0 ? '첫 문단 작성' : question.optional ? '에세이 완성' : '에세이 이어쓰기', question.label);
    setVariant((prev) => prev + 1);

    if (questionIndex >= QUESTIONS.length - 1) {
      setGuidedComplete(true);
      return;
    }
    setQuestionIndex((prev) => Math.min(QUESTIONS.length - 1, prev + 1));
  };

  const recommendGuidedAnswer = () => {
    const question = QUESTIONS[Math.min(questionIndex, QUESTIONS.length - 1)];
    if (!question) return;
    const suggestion = getGuidedSuggestion(settings, answers, questionIndex);
    setAnswers((prev) => ({
      ...prev,
      [question.key]: hasText(prev[question.key]) ? `${prev[question.key]}\n${suggestion}` : suggestion,
    }));
  };

  const appendRaw = () => {
    if (!hasText(workInput)) return;
    saveFreeUndoSnapshot();
    updateContent(joinText(content, workInput), hasText(content) ? '그대로 이어붙이기' : '그대로 넣기', clean(workInput).slice(0, 40));
    setWorkInput('');
  };

  const appendPolished = () => {
    if (!hasText(workInput)) return;
    saveFreeUndoSnapshot();
    updateContent(joinText(content, polishText(workInput)), hasText(content) ? '다듬어 이어붙이기' : '다듬어 넣기', clean(workInput).slice(0, 40));
    setWorkInput('');
  };

  const askAi = () => {
    saveFreeUndoSnapshot();
    if (!hasText(content)) {
      const next = makeFreeEssay(settings, workInput, variant);
      updateContent(next, 'AI에게 요청하기', clean(workInput).slice(0, 40) || '기본 설정으로 에세이 생성');
    } else {
      const next = makeContinuation(content, workInput, settings, variant);
      updateContent(joinText(content, next), 'AI 이어쓰기', clean(workInput).slice(0, 40) || '현재 흐름 이어쓰기');
    }
    setWorkInput('');
    setVariant((prev) => prev + 1);
  };

  const applyRevision = () => {
    if (!selectedText) return;
    const replacement = reviseSelection(selectedText, revisionRequest);
    if (!replacement) return;
    saveFreeUndoSnapshot();
    const next = content.replace(selectedText, replacement);
    updateContent(next, '수정하기', clean(revisionRequest).slice(0, 40));
    setSelectedText('');
    setRevisionRequest('');
    if (settings.mode === 'free') setFreeEditMode(false);
    if (settings.mode === 'guided') setGuidedEditMode(false);
  };

  const selectFromTextarea = (event) => {
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const text = value.slice(selectionStart, selectionEnd).trim();
    setSelectedText(text);
  };

  const goStep = (next) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createCoverUrl = (label, bookTitle) => `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#f3efff"/>
      <rect x="64" y="48" width="512" height="264" rx="28" fill="#ffffff" opacity="0.9"/>
      <text x="320" y="146" text-anchor="middle" font-size="42" font-weight="800" fill="#6d4aff">${label}</text>
      <text x="320" y="208" text-anchor="middle" font-size="28" font-weight="700" fill="#2f2859">${bookTitle || '상상서가'}</text>
    </svg>
  `)}`;

  const createCompletedBook = () => {
    const description = hasText(content)
      ? `${clean(content).slice(0, 180)}${clean(content).length > 180 ? '…' : ''}`
      : 'AI와 함께 완성한 에세이입니다.';

    return {
      id: `manual-essay-${Date.now()}`,
      title,
      author: settings.author || settings.authorName || '지우',
      category: '나만의 AI 창작',
      description,
      readingTime: `${Math.max(1, Math.ceil((content || '').length / 500))}분`,
      pages: Math.max(1, pages.length),
      magicLevel: 'Lv. 1',
      isPublic: true,
      coverUrl: createCoverUrl('ESSAY', title),
    };
  };

  const moveToMyBooks = () => {
    const book = createCompletedBook();
    const payload = {
      genre: 'essay',
      book,
      targetPage: 'my-library',
      targetTab: 'all-books',
      activeTab: 'all-books',
      targetComponent: 'AllBooksTab',
    };

    setShowCompleteModal(false);
    onBookComplete?.(book);
    onGoToMyBooks?.(payload);

    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('sangsang:my-library-active-tab', 'all-books');
      window.dispatchEvent(new CustomEvent('sangsang:book-completed', { detail: payload }));
      window.dispatchEvent(new CustomEvent('sangsang:go-to-my-books', { detail: payload }));
    }
  };

  return (
    <div className="app-shell essay-only-shell pt-4">
      <main className="workspace essay-workspace-root">
        {view === 'step1' && <EssayModeStep settings={settings} setSettings={setSettings} goStep={goStep} resetEssay={resetEssay} />}
        {view === 'step2' && <EssaySettingStep settings={settings} setSettings={setSettings} goStep={goStep} />}
        {view === 'step3' && (
          <EssayWorkStep
            settings={settings}
            setSettings={setSettings}
            answers={answers}
            setAnswers={setAnswers}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            guidedComplete={guidedComplete}
            content={content}
            title={title}
            workInput={workInput}
            setWorkInput={setWorkInput}
            startEssay={startEssay}
            writeGuidedStep={writeGuidedStep}
            recommendGuidedAnswer={recommendGuidedAnswer}
            appendRaw={appendRaw}
            appendPolished={appendPolished}
            askAi={askAi}
            selectedText={selectedText}
            setSelectedText={setSelectedText}
            revisionRequest={revisionRequest}
            setRevisionRequest={setRevisionRequest}
            freeEditMode={freeEditMode}
            setFreeEditMode={setFreeEditMode}
            guidedEditMode={guidedEditMode}
            setGuidedEditMode={setGuidedEditMode}
            freeUndoSnapshot={freeUndoSnapshot}
            freeRedoSnapshot={freeRedoSnapshot}
            undoFreeAction={undoFreeAction}
            redoFreeAction={redoFreeAction}
            closeFreeEditMode={closeFreeEditMode}
            applyRevision={applyRevision}
            selectFromTextarea={selectFromTextarea}
            goStep={goStep}
            resetEssay={resetEssay}
          />
        )}
        {view === 'step4' && (
          <EssayPreviewStep
            title={title}
            pages={pages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            goStep={goStep}
            setShowCompleteModal={setShowCompleteModal}
          />
        )}
      </main>

      <ConfirmModal
        isOpen={showCompleteModal}
        title="에세이집이 완성되었어요"
        message="내 서재의 내가 쓴 책에서 방금 만든 에세이를 확인할 수 있어요."
        cancelText="닫기"
        confirmText="내 서재로 이동"
        type="success"
        onClose={() => setShowCompleteModal(false)}
        onConfirm={moveToMyBooks}
      />
    </div>
  );
}
