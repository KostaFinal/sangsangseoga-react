import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS } from '../data/essayQuestions.js';
import {
  hasText,
  clean,
  joinText,
  makeOpeningEssay,
  getGuidedSuggestion,
  makeFreeEssay,
  makeContinuation,
  reviseSelection,
  splitPages,
  getDisplayTitle,
} from '../utils/essayTextUtils.js';
import { generateEssay, rewriteEssaySelection, toReaderAge, translateEssayContent, translateEssayTitle } from '../services/essayCreationService.js';
import { publishBook } from '../../../../api/bookApi.js';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const title = aiTitle || getDisplayTitle(settings, answers, content);

  // splitPages()는 실제 DOM에 글자를 그려 보며 페이지를 나누기 때문에, content가 바뀔 때마다
  // (자유 수정 중 매 타이핑마다) 바로 돌리면 느려질 수 있다. 타이핑이 잠깐 멈췄을 때만
  // 다시 계산해서 입력 반응성을 지킨다.
  const [debouncedContent, setDebouncedContent] = useState(content);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 300);
    return () => clearTimeout(timer);
  }, [content]);
  const pages = useMemo(() => splitPages(debouncedContent), [debouncedContent]);

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
    setAiTitle('');
    setGenerationNotice('');
  };

  const selectEssayMode = (mode) => {
    resetEssay();
    setSettings({
      ...createInitialSettings(),
      mode,
    });
  };

  const writeGuidedStep = async () => {
    const requiredReady = QUESTIONS.every((item) => item.optional || hasText(answers[item.key]));
    if (!requiredReady) return;

    setIsGenerating(true);
    setGenerationNotice('');

    const response = await generateEssay({ settings, answers, content: '', workInput: '', isContinuation: false });

    let next;
    if (response.ok) {
      next = response.content;
      setAiTitle(response.title || '');
    } else {
      next = makeOpeningEssay(settings, answers, variant);
      setGenerationNotice('AI 응답을 불러오지 못해 기본 문장으로 채웠어요.');
    }

    updateContent(next);
    setGuidedComplete(true);
    setQuestionIndex(QUESTIONS.length - 1);
    setSelectedText('');
    setRevisionRequest('');
    setGuidedEditMode(false);
    setWorkInput('');
    setVariant((prev) => prev + 1);
    setIsGenerating(false);
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

  const askAi = async () => {
    saveFreeUndoSnapshot();
    const isContinuation = hasText(content);

    setIsGenerating(true);
    setGenerationNotice('');

    const response = await generateEssay({ settings, answers, content, workInput, isContinuation });

    if (response.ok) {
      if (isContinuation) {
        updateContent(joinText(content, response.content));
      } else {
        updateContent(response.content);
        setAiTitle(response.title || '');
      }
    } else {
      setGenerationNotice('AI 응답을 불러오지 못해 기본 문장으로 채웠어요.');
      if (isContinuation) {
        const next = makeContinuation(content, workInput, settings, variant);
        updateContent(joinText(content, next));
      } else {
        const next = makeFreeEssay(settings, workInput, variant);
        updateContent(next);
      }
    }

    setWorkInput('');
    setVariant((prev) => prev + 1);
    setIsGenerating(false);
  };

  const applyRevision = async () => {
    if (!selectedText || !revisionRequest.trim()) return;
    saveFreeUndoSnapshot();

    setIsGenerating(true);
    setGenerationNotice('');

    const response = await rewriteEssaySelection({ settings, selectedText, editRequest: revisionRequest });

    let replacement = response.ok ? response.revisedText : '';
    if (!replacement) {
      replacement = reviseSelection(selectedText, revisionRequest);
      if (!response.ok) setGenerationNotice('AI 응답을 불러오지 못해 기본 문장으로 다듬었어요.');
    }

    if (replacement) {
      updateContent(content.replace(selectedText, replacement));
      setSelectedText('');
      setRevisionRequest('');
    }

    setIsGenerating(false);
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

  const buildPublishPayload = async () => {
    // description은 본문 발췌가 아니라 작품 소개문이다. 실제 에세이 내용을 그대로 잘라 넣지 않는다.
    const description = `주제: ${settings.theme || '자유 주제'} / 톤: ${settings.tone || '담백하게'}`;
    const readerAge = toReaderAge(settings.authorAge);
    const titleEn = await translateEssayTitle(title);

    // 페이지별 영어 번역(content_text_en)을 채운다. 예전에는 Promise.all로 페이지를 한꺼번에
    // 병렬 요청했는데, 에세이가 최소 10페이지 분량으로 길어지면서 한 번에 10개 넘는 번역
    // 요청이 Gemini에 동시에 몰려 503(과부하)이 뜨고 재시도까지 겹쳐 실패하는 일이 생겼다.
    // 순서대로 하나씩 번역해서 동시 요청 수를 늘 1개로 유지한다.
    const translatedPages = [];
    for (let index = 0; index < pages.length; index += 1) {
      const text = pages[index];
      const translated = await translateEssayContent(text);
      translatedPages.push({
        pageNo: index + 1,
        title: index === 0 ? title : '',
        titleEn: index === 0 ? titleEn : '',
        contentTextKo: text,
        contentTextEn: translated.text,
        contentFontSizeEn: translated.fontSize,
        imageUrl: null,
      });
    }

    return {
      bookType: 'ESSAY',
      authorAgeGroup: readerAge,
      readerAgeGroup: readerAge,
      creationMode: settings.mode === 'free' ? 'FREE' : 'GUIDED',
      title,
      description,
      confirmedSettings: JSON.stringify(settings),
      coverImageUrl: coverImage?.url || null,
      pages: translatedPages,
    };
  };

  const moveToMyBooks = async () => {
    setIsSaving(true);
    setSaveError('');

    let requestBody;
    let bookId;

    try {
      requestBody = await buildPublishPayload();
      const response = await publishBook(requestBody);
      bookId = response.data?.data?.bookId;
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || '책 저장에 실패했습니다. 다시 시도해 주세요.');
      setIsSaving(false);
      return;
    }

    const book = { id: bookId, title: requestBody.title, coverUrl: requestBody.coverImageUrl };
    const payload = {
      genre: 'essay',
      book,
      targetPage: 'my-library',
      targetTab: 'all-books',
      activeTab: 'all-books',
      targetComponent: 'AllBooksTab',
    };

    setIsSaving(false);
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
    updateContent,
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
    isGenerating,
    generationNotice,
    coverImage,
    setCoverImage,
    isSaving,
    saveError,
  };
}
