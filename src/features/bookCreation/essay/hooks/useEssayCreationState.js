import { useMemo, useState } from 'react';
import { QUESTIONS } from '../data/essayQuestions.js';
import {
  hasText,
  clean,
  joinText,
  polishText,
  makeOpeningEssay,
  getGuidedSuggestion,
  makeFreeEssay,
  makeContinuation,
  reviseSelection,
  splitPages,
  getDisplayTitle,
} from '../utils/essayTextUtils.js';

const createInitialSettings = () => ({
  mode: '',
  title: '',
  authorAge: '',
  theme: '',
  tone: '',
  length: '',
});

const createInitialAnswers = () => QUESTIONS.reduce((acc, item) => ({ ...acc, [item.key]: '' }), {});

export default function useEssayCreationState({ initialView = 'step1', onGoToMyBooks, onBookComplete } = {}) {
  const [view, setView] = useState(initialView);
  const [settings, setSettings] = useState(() => createInitialSettings());
  const [answers, setAnswers] = useState(() => createInitialAnswers());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [guidedComplete, setGuidedComplete] = useState(false);
  const [content, setContent] = useState('');
  const [workInput, setWorkInput] = useState('');
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

  const updateContent = (next) => {
    setContent(next);
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
    setAnswers(createInitialAnswers());
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
    setVariant(0);
    setActivePreviewPage(0);
  };

  const selectEssayMode = (mode) => {
    resetEssay();
    setSettings({
      ...createInitialSettings(),
      mode,
    });
  };

  const writeGuidedStep = () => {
    const requiredReady = QUESTIONS.every((item) => item.optional || hasText(answers[item.key]));
    if (!requiredReady) return;

    const next = makeOpeningEssay(settings, answers, variant);
    updateContent(next);
    setGuidedComplete(true);
    setQuestionIndex(QUESTIONS.length - 1);
    setSelectedText('');
    setRevisionRequest('');
    setGuidedEditMode(false);
    setWorkInput('');
    setVariant((prev) => prev + 1);
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
    updateContent(joinText(content, workInput));
    setWorkInput('');
  };

  const appendPolished = () => {
    if (!hasText(workInput)) return;
    saveFreeUndoSnapshot();
    updateContent(joinText(content, polishText(workInput)));
    setWorkInput('');
  };

  const askAi = () => {
    saveFreeUndoSnapshot();
    if (!hasText(content)) {
      const next = makeFreeEssay(settings, workInput, variant);
      updateContent(next);
    } else {
      const next = makeContinuation(content, workInput, settings, variant);
      updateContent(joinText(content, next));
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
    updateContent(next);
    setSelectedText('');
    setRevisionRequest('');
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

  return {
    view,
    settings,
    setSettings,
    answers,
    setAnswers,
    questionIndex,
    setQuestionIndex,
    guidedComplete,
    content,
    title,
    pages,
    workInput,
    setWorkInput,
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
    activePreviewPage,
    setActivePreviewPage,
    showCompleteModal,
    setShowCompleteModal,
    writeGuidedStep,
    recommendGuidedAnswer,
    appendRaw,
    appendPolished,
    askAi,
    undoFreeAction,
    redoFreeAction,
    closeFreeEditMode,
    applyRevision,
    selectFromTextarea,
    goStep,
    resetEssay,
    selectEssayMode,
    moveToMyBooks,
  };
}
