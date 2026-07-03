import React, { useEffect, useMemo, useRef, useState } from 'react';
import PoemModeStep from './components/PoemModeStep.jsx';
import PoemSettingStep from './components/PoemSettingStep.jsx';
import PoemWorkStep from './components/PoemWorkStep.jsx';
import PoemPreviewStep from './components/PoemPreviewStep.jsx';
import { ConfirmModal } from '../../../shared/components';
import {
  defaultSettings,
  defaultSelections,
  defaultAnswers,
  choiceQuestions,
  createPoem,
  createPreviewPages,
  getAiChoiceRecommendation,
  getGeneratedPoemText,
  getTitleIdeas,
} from './poemShared.js';

export default function PoemApp({ onSwitchGenre, initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const [currentView, setCurrentView] = useState(initialView);
  const [settings, setSettings] = useState(defaultSettings);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [variant, setVariant] = useState(0);
  const [poems, setPoems] = useState([createPoem(1)]);
  const [activePoem, setActivePoem] = useState(0);
  const [activePreviewPage, setActivePreviewPage] = useState(0);
  const [showBackModal, setShowBackModal] = useState(false);
  const [pendingView, setPendingView] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const historyReadyRef = useRef(false);
  const isPopNavigationRef = useRef(false);

  const poem = poems[activePoem] || poems[0];
  const selections = poem?.selections || defaultSelections;
  const answers = poem?.answers || defaultAnswers;
  const previewPages = useMemo(() => createPreviewPages(poems), [poems]);
  const titleIdeas = useMemo(() => getTitleIdeas(settings, poem), [settings, poem]);
  const guardedSteps = ['step2', 'step3', 'step4'];
  const shouldGuardNavigation = guardedSteps.includes(currentView);

  useEffect(() => {
    window.history.replaceState({ view: currentView }, '', window.location.href);
    historyReadyRef.current = true;

    const handlePopState = (event) => {
      isPopNavigationRef.current = true;
      setShowBackModal(false);
      setPendingView(null);
      setCurrentView(event.state?.view || 'step1');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!historyReadyRef.current) return;
    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      return;
    }

    window.history.pushState({ view: currentView }, '', window.location.href);
  }, [currentView]);

  useEffect(() => {
    if (!shouldGuardNavigation) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldGuardNavigation]);

  useEffect(() => {
    setActivePreviewPage((prev) => Math.min(prev, Math.max(0, previewPages.length - 1)));
  }, [previewPages.length]);

  const updatePoem = (patch) => {
    setPoems((prev) => prev.map((item, index) => (index === activePoem ? { ...item, ...patch } : item)));
  };

  const updatePoemById = (poemId, patch) => {
    setPoems((prev) => prev.map((item) => (item.id === poemId ? { ...item, ...patch } : item)));
  };

  const makePoem = (nextPatch = {}, options = {}) => {
    const nextPoem = { ...poem, ...nextPatch };
    const text = getGeneratedPoemText(settings, nextPoem, settings.mode || 'choice', variant);
    const title = poem.title === '아직 제목이 없어요' ? getTitleIdeas(settings, nextPoem)[0] : poem.title;
    updatePoem({
      ...nextPatch,
      title,
      content: text,
      generationSource: options.generationSource || settings.mode || 'choice',
    });
    setVariant((v) => v + 1);
  };

  const makeBasicOnlyPoem = () => {
    const basePoem = {
      ...poem,
      selections: { ...defaultSelections },
      answers: { ...defaultAnswers },
      freeRequest: '',
    };
    const text = getGeneratedPoemText(settings, basePoem, settings.mode || 'choice', variant);
    const title = poem.title === '아직 제목이 없어요' ? getTitleIdeas(settings, basePoem)[0] : poem.title;
    updatePoem({ title, content: text, generationSource: 'basic' });
    setVariant((v) => v + 1);
  };

  const updateCurrentPoemSelections = (nextSelections) => {
    updatePoem({ selections: nextSelections });
  };

  const updateCurrentPoemAnswers = (nextAnswers) => {
    updatePoem({ answers: nextAnswers });
  };

  const updateCurrentPoemFreeRequest = (freeRequest) => {
    updatePoem({ freeRequest });
  };

  const selectChoice = (value) => {
    const key = choiceQuestions[questionIndex].key;
    const nextValue = value === 'AI 추천' ? getAiChoiceRecommendation(key, settings) : value;
    const nextSelections = { ...selections, [key]: nextValue };
    updateCurrentPoemSelections(nextSelections);
    if (questionIndex < choiceQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const makeAll = () => {
    makeBasicOnlyPoem();
  };

  const resetStep3 = () => {
    setQuestionIndex(0);
    setPoems([createPoem(1)]);
    setActivePoem(0);
    setActivePreviewPage(0);
  };

  const requestViewChange = (nextView) => {
    if (nextView === currentView) return;

    if (currentView === 'step4' && nextView === 'step3') {
      setCurrentView(nextView);
      return;
    }

    if (shouldGuardNavigation) {
      setPendingView(nextView);
      setShowBackModal(true);
      return;
    }

    setCurrentView(nextView);
  };

  const confirmBack = () => {
    resetStep3();
    setShowBackModal(false);
    setCurrentView(pendingView || 'step2');
    setPendingView(null);
  };

  const cancelBack = () => {
    setShowBackModal(false);
    setPendingView(null);
  };

  const addPoem = () => {
    const nextOrder = poems.length + 1;
    const next = createPoem(nextOrder);
    next.title = `새 시 ${nextOrder}`;
    setPoems((prev) => [...prev, next]);
    setActivePoem(poems.length);
    setQuestionIndex(0);
  };

  const deletePoem = () => {
    if (poems.length === 1) {
      return;
    }
    setPoems((prev) => prev
      .filter((_, index) => index !== activePoem)
      .map((item, index) => ({ ...item, order: index + 1 })));
    setActivePoem((prev) => Math.max(0, prev - 1));
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
    const joinedContent = poems.map((item) => item.content).filter(Boolean).join('\n\n');
    const bookTitle = poems.length > 1 ? `${poems[0]?.title || '나의 시'} 외 ${poems.length - 1}편` : poems[0]?.title || '나의 시집';
    const description = joinedContent
      ? `${joinedContent.slice(0, 180)}${joinedContent.length > 180 ? '…' : ''}`
      : `${poems.length}편의 시가 담긴 시집입니다.`;

    return {
      id: `manual-poem-${Date.now()}`,
      title: bookTitle,
      author: settings.author || settings.authorName || '지우',
      category: '나만의 AI 창작',
      description,
      readingTime: `${Math.max(1, Math.ceil(joinedContent.length / 400))}분`,
      pages: Math.max(1, previewPages.length),
      magicLevel: 'Lv. 1',
      isPublic: true,
      coverUrl: createCoverUrl('POEM', bookTitle),
    };
  };

  const completeAndMove = () => {
    const book = createCompletedBook();
    const payload = {
      genre: 'poem',
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
    <div className="app-frame pt-4">
      <main className="workspace">
        {currentView === 'step1' && (
          <PoemModeStep settings={settings} setSettings={setSettings} setCurrentView={setCurrentView} />
        )}
        {currentView === 'step2' && (
          <PoemSettingStep
            settings={settings}
            setSettings={setSettings}
            setCurrentView={setCurrentView}
            requestViewChange={requestViewChange}
          />
        )}
        {currentView === 'step3' && (
          <PoemWorkStep
            settings={settings}
            selections={selections}
            answers={answers}
            poem={poem}
            poems={poems}
            activePoem={activePoem}
            setActivePoem={setActivePoem}
            updatePoem={updatePoem}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            selectChoice={selectChoice}
            updateCurrentPoemAnswers={updateCurrentPoemAnswers}
            updateCurrentPoemFreeRequest={updateCurrentPoemFreeRequest}
            makePoem={makePoem}
            makeAll={makeAll}
            variant={variant}
            setVariant={setVariant}
            resetStep3={resetStep3}
            titleIdeas={titleIdeas}
            addPoem={addPoem}
            deletePoem={deletePoem}
            setCurrentView={setCurrentView}
            requestViewChange={requestViewChange}
          />
        )}
        {currentView === 'step4' && (
          <PoemPreviewStep
            previewPages={previewPages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            updatePoemById={updatePoemById}
            requestViewChange={requestViewChange}
            setShowCompleteModal={setShowCompleteModal}
          />
        )}
      </main>

      
      <ConfirmModal
        isOpen={showBackModal}
        title="이전 단계로 이동할까요?"
        message="현재 시의 선택 내용과 만들어진 시가 초기화될 수 있어요. 확인을 누르면 내용을 지우고 이전 단계로 이동해요."
        cancelText="취소"
        confirmText="확인"
        type="danger"
        onClose={cancelBack}
        onConfirm={confirmBack}
      />
      

      <ConfirmModal
          isOpen={showCompleteModal}
          title="책이 완성되었어요!"
          message="내 서재의 내가 쓴 책에서 방금 만든 시집을 확인할 수 있어요."
          cancelText="닫기"
          confirmText="확인"
          type="success"
          onClose={() => setShowCompleteModal(false)}
          onConfirm={completeAndMove}
      />
    </div>
  );
}
