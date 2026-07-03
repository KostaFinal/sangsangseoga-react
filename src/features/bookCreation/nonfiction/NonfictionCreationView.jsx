import React, { useMemo, useState } from 'react';
import NonfictionSettingStep from './components/NonfictionSettingStep.jsx';
import NonfictionOutlineStep from './components/NonfictionOutlineStep.jsx';
import NonfictionWorkStep from './components/NonfictionWorkStep.jsx';
import NonfictionPreviewStep from './components/NonfictionPreviewStep.jsx';
import NonfictionAiModal from './components/NonfictionAiModal.jsx';
import NonfictionImageModal from './components/NonfictionImageModal.jsx';
import NonfictionLearningModal from './components/NonfictionLearningModal.jsx';
import NonfictionToolsModal from './components/NonfictionToolsModal.jsx';
import NonfictionSimpleModal from './components/NonfictionSimpleModal.jsx';
import NonfictionPlaceholderPage from './components/NonfictionPlaceholderPage.jsx';
import {
  initialSettings,
  emptyUnit,
  hasText,
  outlineTitles,
  createBody,
  polishBody,
  addExample,
  makeLearning,
  makeImage,
  splitPages,
  subjectOf,
} from './nonfictionShared.js';

export default function NonfictionApp({ onSwitchGenre, initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const [view, setView] = useState(initialView === 'home' ? 'step1' : initialView);
  const [settings, setSettings] = useState(initialSettings);
  const [bookTitle, setBookTitle] = useState('새 교육·지식 책');
  const [units, setUnits] = useState([emptyUnit(0)]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modal, setModal] = useState(null);
  const [aiRequest, setAiRequest] = useState('');
  const [imageRequest, setImageRequest] = useState('');
  const [imageType, setImageType] = useState('개념 그림');
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [completeOpen, setCompleteOpen] = useState(false);

  const activeUnit = units[activeIndex] || units[0];
  const isReady = hasText(settings.readerAge) && hasText(settings.category);
  const hasAnyContent = units.some((unit) => hasText(unit.content));
  const previewUnits = useMemo(() => units.map((unit) => ({ ...unit, pages: splitPages(unit.content) })), [units]);

  const snapshot = () => ({ units, activeIndex, bookTitle });
  const saveHistory = () => {
    setHistory((prev) => [...prev.slice(-9), snapshot()]);
    setFuture([]);
  };

  const restore = (snap, direction) => {
    if (!snap) return;
    if (direction === 'undo') setFuture((prev) => [...prev, snapshot()]);
    if (direction === 'redo') setHistory((prev) => [...prev, snapshot()]);
    setUnits(snap.units);
    setActiveIndex(Math.min(snap.activeIndex, snap.units.length - 1));
    setBookTitle(snap.bookTitle);
  };

  const go = (next) => {
    setView(next);
    setModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeSettings = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const updateUnit = (patch, keepHistory = true) => {
    if (keepHistory) saveHistory();
    setUnits((prev) => prev.map((unit, index) => (index === activeIndex ? { ...unit, ...patch } : unit)));
  };

  const createOutline = () => {
    saveHistory();
    const titles = outlineTitles(settings);
    setBookTitle(`${subjectOf(settings, settings.category)} 지식책`);
    setUnits(titles.map((title, index) => ({ ...emptyUnit(index, title), opened: index === 0 ? 'body' : 'body' })));
    setActiveIndex(0);
  };

  const addUnit = () => {
    saveHistory();
    const next = emptyUnit(units.length, `${units.length + 1}. 제목 없음`);
    setUnits((prev) => [...prev, next]);
    setActiveIndex(units.length);
  };

  const removeUnit = (index) => {
    if (units.length <= 1) return;
    saveHistory();
    setUnits((prev) => prev.filter((_, idx) => idx !== index));
    setActiveIndex((prev) => Math.max(0, Math.min(prev, units.length - 2)));
  };

  const makeBody = () => {
    updateUnit({ content: createBody(settings, activeUnit.title, aiRequest), opened: 'body' });
    setAiRequest('');
    setModal(null);
  };

  const polish = () => {
    updateUnit({ content: polishBody(activeUnit.content || createBody(settings, activeUnit.title), settings), opened: 'body' });
    setModal(null);
  };

  const example = () => {
    updateUnit({ content: addExample(activeUnit.content, settings, activeUnit.title), opened: 'body' });
    setModal(null);
  };

  const addImage = () => {
    updateUnit({ image: makeImage(settings, activeUnit, imageRequest, imageType), opened: 'image' });
    setImageRequest('');
    setModal(null);
  };

  const addLearning = (selectedParts) => {
    updateUnit({ learning: makeLearning(settings, activeUnit, selectedParts), opened: 'learning' });
    setModal(null);
  };

  const resetUnit = () => {
    updateUnit({ content: '', image: null, learning: null, opened: 'body' });
    setModal(null);
  };

  const resetAll = () => {
    setSettings(initialSettings);
    setBookTitle('새 교육·지식 책');
    setUnits([emptyUnit(0)]);
    setActiveIndex(0);
    setModal(null);
    setAiRequest('');
    setImageRequest('');
    setHistory([]);
    setFuture([]);
    go('step1');
  };

  const createCoverUrl = (label, title) => `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#f3efff"/>
      <rect x="64" y="48" width="512" height="264" rx="28" fill="#ffffff" opacity="0.9"/>
      <text x="320" y="146" text-anchor="middle" font-size="42" font-weight="800" fill="#6d4aff">${label}</text>
      <text x="320" y="208" text-anchor="middle" font-size="28" font-weight="700" fill="#2f2859">${title || '상상서가'}</text>
    </svg>
  `)}`;

  const createCompletedBook = () => {
    const completedUnits = units.filter((unit) => hasText(unit.content));
    const joinedContent = completedUnits.map((unit) => `${unit.title} ${unit.content}`).join('\n\n');
    const description = joinedContent
      ? `${joinedContent.slice(0, 180)}${joinedContent.length > 180 ? '…' : ''}`
      : `${settings.category || '교육·지식'} 주제로 완성한 지식책입니다.`;
    const pageCount = previewUnits.reduce((sum, unit) => sum + Math.max(1, unit.pages?.length || 0), 0);

    return {
      id: `manual-nonfiction-${Date.now()}`,
      title: bookTitle,
      author: settings.author || settings.authorName || '지우',
      category: '나만의 AI 창작',
      description,
      readingTime: `${Math.max(1, Math.ceil(joinedContent.length / 550))}분`,
      pages: Math.max(1, pageCount),
      magicLevel: 'Lv. 1',
      isPublic: true,
      coverUrl: createCoverUrl('KNOWLEDGE', bookTitle),
    };
  };

  const completeAndMoveToMyBooks = () => {
    const book = createCompletedBook();
    const payload = {
      genre: 'nonfiction',
      book,
      targetPage: 'my-library',
      targetTab: 'all-books',
      activeTab: 'all-books',
      targetComponent: 'AllBooksTab',
    };

    setCompleteOpen(false);
    onBookComplete?.(book);
    onGoToMyBooks?.(payload);

    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('sangsang:my-library-active-tab', 'all-books');
      window.dispatchEvent(new CustomEvent('sangsang:book-completed', { detail: payload }));
      window.dispatchEvent(new CustomEvent('sangsang:go-to-my-books', { detail: payload }));
    }
  };

  return (
    <div className="app-frame nf-card-shell pt-4">
      <main className="workspace nf-card-main">
        {['fairy', 'novel', 'friends'].includes(view) && <NonfictionPlaceholderPage view={view} />}
        {view === 'step1' && (
          <NonfictionSettingStep
            settings={settings}
            changeSettings={changeSettings}
            isReady={isReady}
            go={go}
            resetAll={resetAll}
          />
        )}
        {view === 'step2' && (
          <NonfictionOutlineStep
            settings={settings}
            bookTitle={bookTitle}
            setBookTitle={setBookTitle}
            units={units}
            setUnits={setUnits}
            createOutline={createOutline}
            addUnit={addUnit}
            removeUnit={removeUnit}
            setActiveIndex={setActiveIndex}
            go={go}
          />
        )}
        {view === 'step3' && (
          <NonfictionWorkStep
            units={units}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            activeUnit={activeUnit}
            updateUnit={updateUnit}
            setModal={setModal}
            go={go}
            hasAnyContent={hasAnyContent}
          />
        )}
        {view === 'step4' && (
          <NonfictionPreviewStep
            bookTitle={bookTitle}
            units={previewUnits}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            go={go}
            openComplete={() => setCompleteOpen(true)}
          />
        )}
      </main>

      {modal === 'ai' && (
        <NonfictionAiModal
          unit={activeUnit}
          aiRequest={aiRequest}
          setAiRequest={setAiRequest}
          makeBody={makeBody}
          polish={polish}
          example={example}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'image' && (
        <NonfictionImageModal
          imageRequest={imageRequest}
          setImageRequest={setImageRequest}
          imageType={imageType}
          setImageType={setImageType}
          addImage={addImage}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'learning' && (
        <NonfictionLearningModal addLearning={addLearning} onClose={() => setModal(null)} />
      )}
      {modal === 'tools' && (
        <NonfictionToolsModal
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          undo={() => {
            const snap = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            restore(snap, 'undo');
            setModal(null);
          }}
          redo={() => {
            const snap = future[future.length - 1];
            setFuture((prev) => prev.slice(0, -1));
            restore(snap, 'redo');
            setModal(null);
          }}
          resetUnit={resetUnit}
          removeImage={() => updateUnit({ image: null, opened: 'image' })}
          hasImage={Boolean(activeUnit?.image)}
          onClose={() => setModal(null)}
        />
      )}
      {completeOpen && (
        <NonfictionSimpleModal
          title="교육·지식 책이 완성되었어요"
          desc="단원 카드로 만든 본문과 이미지, 마무리 요소가 함께 저장돼요."
          onClose={() => setCompleteOpen(false)}
        >
          <div className="nf-card-modal-actions">
            <button type="button" className="nf-card-ghost" onClick={() => setCompleteOpen(false)}>닫기</button>
            <button type="button" className="nf-card-primary" onClick={completeAndMoveToMyBooks}>내 서재로 이동</button>
          </div>
        </NonfictionSimpleModal>
      )}
    </div>
  );
}
