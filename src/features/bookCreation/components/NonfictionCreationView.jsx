import React, { useMemo, useState } from 'react';

const AGE_OPTIONS = ['미취학아동', '초등학교 고학년', '중·고등학생', '성인'];
const CATEGORY_OPTIONS = ['과학', '역사', '동물·자연', '생활', '경제·금융', '직업', '환경', '예술', '기술', '사회', '문화', '건강'];
const LEARNING_OPTIONS = [
  { key: 'summary', label: '핵심 정리', desc: '단원의 중요한 내용을 짧은 문장으로 정리해요.' },
  { key: 'terms', label: '용어 설명', desc: '본문 속 주요 낱말의 뜻을 쉽게 풀어 써요.' },
  { key: 'questions', label: '확인 질문', desc: '내용을 이해했는지 스스로 점검할 질문을 만들어요.' },
];

const CATEGORY_TONES = {
  과학: ['개념의 원리', '생활 속 사례', '더 생각해 볼 질문'],
  역사: ['시대 배경', '사건의 흐름', '오늘의 의미'],
  인물: ['인물 소개', '중요한 선택', '배울 점'],
  '동물·자연': ['관찰 포인트', '서로의 연결', '보호 방법'],
  생활: ['생활 속 문제', '실천 방법', '체크리스트'],
  '경제·금융': ['기본 개념', '돈의 흐름', '생활 사례'],
  직업: ['하는 일', '필요한 역량', '미래 모습'],
  환경: ['문제의 원인', '영향과 사례', '실천 방법'],
  예술: ['감상 포인트', '표현 방식', '작품 이야기'],
  기술: ['필요한 이유', '작동 원리', '활용 사례'],
  사회: ['사람들의 관계', '사회 문제', '함께 생각할 점'],
  문화: ['문화의 배경', '대표 사례', '비교해 보기'],
  건강: ['몸과 생활', '좋은 습관', '주의할 점'],
};

const initialSettings = {
  readerAge: '',
  category: '',
  topic: '',
  goal: '',
};

const emptyUnit = (index = 0, title = '제목 없음') => ({
  id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${index}`,
  title,
  content: '',
  image: null,
  learning: null,
  opened: 'body',
});

function clean(value) {
  return String(value || '').trim();
}

function hasText(value) {
  return clean(value).length > 0;
}

function short(text, length = 56) {
  const value = clean(text);
  if (value.length <= length) return value;
  return `${value.slice(0, length)}...`;
}

function subjectOf(settings, fallback = '') {
  return clean(settings.topic) || clean(fallback).replace(/^\d+\.\s*/u, '') || `${settings.category || '교육·지식'} 주제`;
}

function outlineTitles(settings) {
  const subject = subjectOf(settings, settings.category);
  const tones = CATEGORY_TONES[settings.category] || ['주제 소개', '핵심 개념', '사례로 이해하기'];
  return [
    `1. ${subject}을 왜 알아야 할까요?`,
    `2. ${tones[0]}를 차근차근 살펴봐요`,
    `3. ${tones[1]}로 더 쉽게 이해해요`,
    `4. ${tones[2]}를 통해 생각을 넓혀요`,
  ];
}

function createBody(settings, unitTitle, extra = '') {
  const subject = subjectOf(settings, unitTitle);
  const age = settings.readerAge || '독자';
  const category = settings.category || '교육·지식';
  const goal = clean(settings.goal) || `${age}이 ${subject}을 자신의 말로 설명할 수 있게 하는 것`;
  const easyGuide = age.includes('초등') || age.includes('미취학')
    ? '어려운 단어는 짧게 풀고, 주변에서 볼 수 있는 예시로 설명해요.'
    : age.includes('중·고')
      ? '개념의 원리와 실제 사례를 함께 보여 주어 이해의 흐름을 잡아요.'
      : '핵심 개념, 배경, 활용 사례를 균형 있게 정리해 깊이 있게 읽을 수 있도록 구성해요.';
  const request = clean(extra);
  const add = request ? `\n\n요청한 방향: ${request}\n이 요청을 바탕으로 본문을 더 구체적인 사례와 연결해 확장할 수 있어요.` : '';
  return `${subject}은 ${category} 책에서 독자가 꼭 이해하면 좋은 주제예요. 먼저 이 내용이 왜 필요한지, 우리 생활과 어떤 관련이 있는지부터 살펴보면 훨씬 자연스럽게 읽을 수 있어요.\n\n이 단원에서는 ${subject}의 핵심 개념을 쉬운 흐름으로 정리합니다. ${easyGuide}\n\n예를 들어 단순히 정의만 설명하기보다, 원인과 과정, 결과를 차례대로 보여 주면 독자가 내용을 외우지 않고 이해할 수 있어요.\n\n이 단원의 목표는 ${goal}입니다.${add}`;
}

function polishBody(content, settings) {
  const body = clean(content);
  if (!body) return body;
  const age = settings.readerAge || '독자';
  const guide = age.includes('초등') || age.includes('미취학')
    ? '조금 더 쉽게 말하면, 어려운 내용을 작은 단계로 나누고 가까운 예시와 연결하면 이해하기 좋아요.'
    : '조금 더 자연스럽게 정리하면, 개념의 의미와 실제 사례가 이어지도록 문단의 흐름을 잡는 것이 좋아요.';
  return `${body}\n\n${guide}`;
}

function addExample(content, settings, unitTitle) {
  const subject = subjectOf(settings, unitTitle);
  const base = clean(content) || createBody(settings, unitTitle);
  return `${base}\n\n예시로 보면, ${subject}은 교실, 집, 동네처럼 익숙한 공간에서도 찾아볼 수 있어요. 독자가 알고 있는 장면에서 출발하면 새로운 개념도 덜 어렵게 느껴집니다.`;
}

function makeLearning(settings, unit, selectedParts = LEARNING_OPTIONS.map((option) => option.key)) {
  const subject = subjectOf(settings, unit.title);
  const firstSentence = clean(unit.content).split(/[.!?。\n]/u).find(Boolean) || `${subject}의 핵심을 이해해요`;
  const selected = new Set(selectedParts);
  const learning = {};
  if (selected.has('summary')) {
    learning.summary = [
      `${subject}의 핵심 개념을 한 문장으로 설명할 수 있어요.`,
      short(firstSentence, 64),
      '사례와 연결해 생각하면 내용을 더 오래 기억할 수 있어요.',
    ];
  }
  if (selected.has('terms')) {
    learning.terms = [
      { word: subject.split(' ')[0] || subject, desc: '이 단원에서 가장 중심이 되는 말이에요.' },
      { word: settings.category || '지식', desc: '이 주제가 속한 분야예요.' },
      { word: '사례', desc: '개념을 실제 상황으로 이해하게 도와주는 예시예요.' },
    ];
  }
  if (selected.has('questions')) {
    learning.questions = [
      `${subject}을 한 문장으로 설명하면 어떻게 말할 수 있을까요?`,
      `우리 주변에서 ${subject}과 연결되는 장면을 하나 찾아볼까요?`,
    ];
  }
  return learning;
}

function makeImage(settings, unit, request, type) {
  const subject = subjectOf(settings, unit.title);
  const imageType = type || '개념 그림';
  const prompt = clean(request) || `${subject}을 설명하는 ${imageType}`;
  const title = short(subject, 22);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4f0ff"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7764e8"/>
        <stop offset="100%" stop-color="#a073ff"/>
      </linearGradient>
    </defs>
    <rect width="900" height="560" rx="44" fill="url(#bg)"/>
    <circle cx="738" cy="122" r="88" fill="#ded5ff" opacity=".85"/>
    <circle cx="158" cy="434" r="98" fill="#f0eaff" opacity=".92"/>
    <rect x="108" y="92" width="684" height="360" rx="36" fill="#fff" stroke="#dfd7fb" stroke-width="4"/>
    <path d="M185 350 C252 252 324 286 396 190 C470 92 560 188 632 130" fill="none" stroke="url(#ink)" stroke-width="18" stroke-linecap="round" opacity=".82"/>
    <circle cx="185" cy="350" r="22" fill="#7764e8"/>
    <circle cx="396" cy="190" r="22" fill="#8f7aff"/>
    <circle cx="632" cy="130" r="22" fill="#a073ff"/>
    <rect x="182" y="392" width="190" height="22" rx="11" fill="#e6e0ff"/>
    <rect x="416" y="392" width="302" height="22" rx="11" fill="#eee9ff"/>
    <text x="450" y="62" text-anchor="middle" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="25" font-weight="900" fill="#5d5588">${title}</text>
    <text x="450" y="505" text-anchor="middle" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="28" font-weight="900" fill="#6d5be5">${imageType}</text>
  </svg>`;
  return {
    type: imageType,
    prompt,
    caption: `그림. ${prompt}`,
    linkedText: `${subject}을 설명하는 본문과 연결된 이미지예요.`,
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
}

function splitPages(content) {
  const text = clean(content);
  if (!text) return ['아직 작성된 본문이 없어요.'];
  const paragraphs = text.split(/\n\s*\n/u).filter(Boolean);
  const pages = [];
  let current = '';
  paragraphs.forEach((paragraph) => {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > 520 && current) {
      pages.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  });
  if (current) pages.push(current);
  return pages;
}

export default function NonfictionApp({ onSwitchGenre, initialView = 'step1' }) {
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

  return (
    <div className="app-frame nf-card-shell pt-4">
      <main className="workspace nf-card-main">
        {['fairy', 'novel', 'friends'].includes(view) && <PlaceholderPage view={view} />}
        {view === 'library' && <LibraryPage bookTitle={bookTitle} units={units} go={go} />}
        {view === 'step1' && (
          <DirectionStep
            settings={settings}
            changeSettings={changeSettings}
            isReady={isReady}
            go={go}
            resetAll={resetAll}
          />
        )}
        {view === 'step2' && (
          <OutlineStep
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
          <UnitStep
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
          <PreviewStep
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
        <AiModal
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
        <ImageModal
          imageRequest={imageRequest}
          setImageRequest={setImageRequest}
          imageType={imageType}
          setImageType={setImageType}
          addImage={addImage}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'learning' && (
        <LearningModal addLearning={addLearning} onClose={() => setModal(null)} />
      )}
      {modal === 'tools' && (
        <ToolsModal
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
        <SimpleModal
          title="교육·지식 책이 완성되었어요"
          desc="단원 카드로 만든 본문과 이미지, 마무리 요소가 함께 저장돼요."
          onClose={() => setCompleteOpen(false)}
        >
          <div className="nf-card-modal-actions">
            <button type="button" className="nf-card-ghost" onClick={() => setCompleteOpen(false)}>닫기</button>
            <button type="button" className="nf-card-primary" onClick={() => { setCompleteOpen(false); go('library'); }}>내 서재로 이동</button>
          </div>
        </SimpleModal>
      )}
    </div>
  );
}

function HeaderNav({ view, setView, onSwitchGenre }) {
  const items = [
    ['fairy', '동화'],
    ['novel', '소설'],
    ['poem', '시'],
    ['essay', '에세이'],
    ['knowledge', '교육·지식'],
    ['friends', '친구의 서재'],
    ['library', '내 서재'],
  ];
  const isKnowledge = ['step1', 'step2', 'step3', 'step4', 'knowledge'].includes(view);
  return (
    <nav className="header-nav" aria-label="주요 메뉴">
      {items.map(([key, label]) => {
        const active = label === '교육·지식' ? isKnowledge : view === key;
        const click = () => {
          if (label === '시' && onSwitchGenre) onSwitchGenre('poem');
          else if (label === '에세이' && onSwitchGenre) onSwitchGenre('essay');
          else if (label === '교육·지식' && onSwitchGenre) onSwitchGenre('nonfiction');
          else setView(key);
        };
        return <button key={label} type="button" className={active ? 'active' : ''} onClick={click}>{label}</button>;
      })}
    </nav>
  );
}

function FlowPills({ active }) {
  const steps = ['방향 정하기', '목차 만들기', '내용 만들기', '미리보기'];
  return (
    <ol className="nf-card-flow" aria-label="교육·지식 제작 단계">
      {steps.map((step, index) => (
        <li key={step} className={active === index + 1 ? 'active' : active > index + 1 ? 'done' : ''}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}

function DirectionStep({ settings, changeSettings, isReady, go, resetAll }) {
  return (
    <section className="nf-card-page nf-card-direction">
      <FlowPills active={1} />
      <div className="nf-card-hero-panel">
        <div className="nf-card-hero-copy">
          <h1>어떤 책을 만들까요?</h1>
          <p>읽을 사람과 분야만 먼저 정해 주세요. 다음 단계에서 AI가 책의 흐름을 카드로 제안해요.</p>
        </div>
        <div className="nf-card-start-card">
          <ChoiceGroup title="독자 나이대" required value={settings.readerAge} options={AGE_OPTIONS} onPick={(value) => changeSettings('readerAge', value)} />
          <ChoiceGroup title="세부 장르" required value={settings.category} options={CATEGORY_OPTIONS} onPick={(value) => changeSettings('category', value)} />
          <label className="nf-card-field">
            <span>다루고 싶은 주제 <em>선택</em></span>
            <input value={settings.topic} onChange={(event) => changeSettings('topic', event.target.value)} placeholder="예: 초등학생을 위한 생태계 이야기" />
          </label>
          <label className="nf-card-field">
            <span>책의 목표 <em>선택</em></span>
            <input value={settings.goal} onChange={(event) => changeSettings('goal', event.target.value)} placeholder="예: 먹이사슬과 생태계 균형을 이해하기" />
          </label>
          <div className="nf-card-form-actions">
            <button type="button" className="nf-card-ghost" onClick={resetAll}>초기화</button>
            <button type="button" className="nf-card-primary" disabled={!isReady} onClick={() => go('step2')}>책 만들기</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChoiceGroup({ title, required, value, options, onPick }) {
  return (
    <div className="nf-card-choice-group">
      <div className="nf-card-label">{title}{required && <em>필수</em>}</div>
      <div className="nf-card-chip-wrap">
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function OutlineStep({ settings, bookTitle, setBookTitle, units, setUnits, createOutline, addUnit, removeUnit, setActiveIndex, go }) {
  return (
    <section className="nf-card-page nf-card-outline-page">
      <FlowPills active={2} />
      <PageHead
        title="책의 흐름을 카드로 잡아요"
        desc="본문을 쓰기 전에 목차 순서를 먼저 정해요. 마음에 들지 않으면 바로 고치거나 다시 만들 수 있어요."
      />
      <div className="nf-card-outline-board">
        <div className="nf-card-title-line">
          <label>
            <span>책 제목</span>
            <input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} />
          </label>
          <button type="button" className="nf-card-primary" onClick={createOutline}>AI 목차 만들기</button>
        </div>
        <div className="nf-card-outline-cards">
          {units.map((unit, index) => (
            <article key={unit.id} className="nf-card-outline-card">
              <div className="nf-card-number">{index + 1}</div>
              <textarea value={unit.title} onChange={(event) => setUnits((prev) => prev.map((item, idx) => idx === index ? { ...item, title: event.target.value } : item))} />
              <button type="button" disabled={units.length <= 1} onClick={() => removeUnit(index)} aria-label="단원 삭제">−</button>
            </article>
          ))}
          <button type="button" className="nf-card-add-unit" onClick={addUnit}>+ 목차 추가</button>
        </div>
      </div>
      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step1')}>이전</button>
        <button type="button" className="nf-card-primary" onClick={() => { setActiveIndex(0); go('step3'); }}>작성하기</button>
      </div>
    </section>
  );
}

function PageHead({ kicker, title, desc }) {
  return (
    <div className="nf-card-page-head">
      {kicker && <span>{kicker}</span>}
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}

function UnitStep({ units, activeIndex, setActiveIndex, activeUnit, updateUnit, setModal, go, hasAnyContent }) {
  return (
    <section className="nf-card-page nf-card-unit-page">
      <FlowPills active={3} />
      <PageHead
        title="내용을 차근차근 완성해요"
        desc="본문을 쓰고, 필요한 이미지와 마무리를 선택해 책의 형태로 다듬어 보세요."
      />

      <div className="nf-card-unit-nav">
        {units.map((unit, index) => (
          <button type="button" key={unit.id} className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)}>
            <span>{index + 1}</span>
            <strong>{short(unit.title, 28)}</strong>
          </button>
        ))}
      </div>

      <div className="nf-card-unit-shell">
        <div className="nf-card-unit-focus">
          <div className="nf-card-unit-top">
            <div>
              <span>현재 목차 {activeIndex + 1} / {units.length}</span>
              <input value={activeUnit.title} onChange={(event) => updateUnit({ title: event.target.value }, false)} />
            </div>
          </div>

          <AccordionCard
            title="본문 작성"
            desc="직접 쓰거나 AI 도움으로 단원 본문을 만들어요."
            open={activeUnit.opened === 'body'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'body' ? '' : 'body' }, false)}
            actionLabel="본문 만들기"
            onAction={() => setModal('ai')}
          >
            <textarea
              className="nf-card-body-editor"
              value={activeUnit.content}
              onChange={(event) => updateUnit({ content: event.target.value }, false)}
              placeholder="본문을 직접 쓰거나, 버튼을 눌러 AI 도움을 받아 보세요."
            />
          </AccordionCard>

          <AccordionCard
            title="이미지"
            desc="필요한 이미지를 추가해보세요."
            open={activeUnit.opened === 'image'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'image' ? '' : 'image' }, false)}
            actionLabel={activeUnit.image ? '이미지 삭제' : '이미지 추가'}
            onAction={() => activeUnit.image ? updateUnit({ image: null, opened: 'image' }) : setModal('image')}
          >
            {activeUnit.image ? <ImageCard image={activeUnit.image} /> : <EmptyBlock text="이미지 추가를 누르면 AI에게 이미지 생성 요청을 보낼 수 있어요." />}
          </AccordionCard>

          <AccordionCard
            title="마무리"
            desc="핵심 정리, 용어 설명, 확인 질문을 본문 끝에 넣어요."
            open={activeUnit.opened === 'learning'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'learning' ? '' : 'learning' }, false)}
            actionLabel="마무리 추가"
            onAction={() => setModal('learning')}
          >
            {activeUnit.learning ? <LearningCard learning={activeUnit.learning} /> : <EmptyBlock text="마무리 만들기를 누르면 단원 끝에 들어갈 학습 요소가 자동으로 만들어져요." />}
          </AccordionCard>
        </div>

      </div>

      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step2')}>이전</button>
        <button type="button" className="nf-card-primary" disabled={!hasAnyContent} onClick={() => go('step4')}>미리보기로 이동</button>
      </div>
    </section>
  );
}

function AccordionCard({ title, desc, open, onOpen, actionLabel, onAction, children }) {
  return (
    <article className={`nf-card-accordion ${open ? 'open' : ''}`}>
      <header>
        <button type="button" onClick={onOpen}>
          <span>⌄</span>
          <strong>{title}</strong>
          <em>{desc}</em>
        </button>
        {open && <button type="button" className="nf-card-mini primary" onClick={onAction}>{actionLabel}</button>}
      </header>
      {open && <div className="nf-card-accordion-body">{children}</div>}
    </article>
  );
}

function EmptyBlock({ text }) {
  return <div className="nf-card-empty-block">{text}</div>;
}

function ImageCard({ image }) {
  return (
    <div className="nf-card-image-box">
      <img src={image.url} alt={image.caption} />
      <strong>{image.caption}</strong>
      <p>{image.linkedText}</p>
    </div>
  );
}

function LearningCard({ learning }) {
  const hasSummary = learning.summary?.length > 0;
  const hasTerms = learning.terms?.length > 0;
  const hasQuestions = learning.questions?.length > 0;

  return (
    <div className="nf-card-learning-box">
      {hasSummary && (
        <section>
          <h3>핵심 정리</h3>
          <ol>{learning.summary.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>
      )}
      {hasTerms && (
        <section>
          <h3>용어 설명</h3>
          <dl>{learning.terms.map((item) => <React.Fragment key={item.word}><dt>{item.word}</dt><dd>{item.desc}</dd></React.Fragment>)}</dl>
        </section>
      )}
      {hasQuestions && (
        <section>
          <h3>확인 질문</h3>
          <ul>{learning.questions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
    </div>
  );
}

function PreviewStep({ bookTitle, units, activeIndex, setActiveIndex, go, openComplete }) {
  const active = units[activeIndex] || units[0];
  return (
    <section className="nf-card-page nf-card-preview-page">
      <FlowPills active={4} />
      <PageHead
        title="책처럼 이어지는지 확인해요"
        desc="본문, 이미지, 마무리 요소가 자연스럽게 배치되는지 마지막으로 확인해 주세요."
      />
      <div className="nf-card-preview-shell">
        <aside className="nf-card-preview-tabs">
          <strong>{bookTitle}</strong>
          {units.map((unit, index) => (
            <button type="button" key={unit.id} className={activeIndex === index ? 'active' : ''} onClick={() => setActiveIndex(index)}>
              <span>{index + 1}</span>{short(unit.title, 34)}
            </button>
          ))}
        </aside>
        <div className="nf-card-book-spread">
          <article>
            <h2>{active?.title}</h2>
            <p>{active?.pages?.[0]}</p>
            {active?.image && <PreviewImage image={active.image} />}
          </article>
          <article>
            {active?.pages?.[1] ? <p>{active.pages[1]}</p> : <p className="nf-card-muted">다음 내용은 단원 채우기 화면에서 이어 쓸 수 있어요.</p>}
            {active?.learning && <LearningCard learning={active.learning} />}
          </article>
        </div>
      </div>
      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step3')}>이전</button>
        <button type="button" className="nf-card-primary" onClick={openComplete}>완성하기</button>
      </div>
    </section>
  );
}

function PreviewImage({ image }) {
  return (
    <figure className="nf-card-preview-image">
      <img src={image.url} alt={image.caption} />
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

function AiModal({ unit, aiRequest, setAiRequest, makeBody, polish, example, onClose }) {
  return (
    <SimpleModal title="본문 작성" desc="현재 단원에 필요한 내용을 AI에게 요청해 보세요. 요청 없이 바로 생성해도 괜찮아요." onClose={onClose} wide>
      <textarea className="nf-card-modal-textarea" value={aiRequest} onChange={(event) => setAiRequest(event.target.value)} placeholder="예: 먹이사슬을 초등학생이 이해하기 쉽게 설명해 줘" />
      <div className="nf-card-modal-actions three">
        <button type="button" className="nf-card-ghost" disabled={!hasText(unit.content)} onClick={polish}>쉽게 다듬기</button>
        <button type="button" className="nf-card-ghost" onClick={example}>예시 추가</button>
        <button type="button" className="nf-card-primary" onClick={makeBody}>{hasText(unit.content) ? '본문 다시 만들기' : '본문 만들기'}</button>
      </div>
    </SimpleModal>
  );
}

function ImageModal({ imageRequest, setImageRequest, imageType, setImageType, addImage, onClose }) {
  const types = ['개념 그림', '구조도', '단계도', '비교 그림'];
  return (
    <SimpleModal title="이미지 추가" desc="본문을 설명해 줄 이미지를 AI에게 요청해요. 이미지는 현재 단원의 이미지 영역에 들어가요." onClose={onClose} wide>
      <textarea className="nf-card-modal-textarea" value={imageRequest} onChange={(event) => setImageRequest(event.target.value)} placeholder="예: 먹이사슬의 흐름을 한눈에 보여주는 쉬운 그림" />
      <div className="nf-card-type-row">
        {types.map((type) => <button type="button" key={type} className={imageType === type ? 'selected' : ''} onClick={() => setImageType(type)}>{type}</button>)}
      </div>
      <div className="nf-card-modal-actions">
        <button type="button" className="nf-card-primary" onClick={addImage}>AI 이미지 생성 요청</button>
      </div>
    </SimpleModal>
  );
}

function LearningModal({ addLearning, onClose }) {
  const [selectedParts, setSelectedParts] = useState([]);
  const togglePart = (key) => {
    setSelectedParts((prev) => (
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    ));
  };

  return (
    <SimpleModal title="마무리 만들기" desc="필요한 항목을 골라 단원 끝에 붙일 마무리를 만들어요." onClose={onClose}>
      <div className="nf-card-learning-options">
        {LEARNING_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.key}
            className={selectedParts.includes(option.key) ? 'selected' : ''}
            aria-pressed={selectedParts.includes(option.key)}
            onClick={() => togglePart(option.key)}
          >
            <strong>{option.label}</strong>
            <span>{option.desc}</span>
          </button>
        ))}
      </div>
      <div className="nf-card-modal-actions">
        <button type="button" className="nf-card-primary" disabled={!selectedParts.length} onClick={() => addLearning(selectedParts)}>마무리 만들기</button>
      </div>
    </SimpleModal>
  );
}

function ToolsModal({ canUndo, canRedo, undo, redo, resetUnit, removeImage, hasImage, onClose }) {
  return (
    <SimpleModal title="단원 도구" desc="자주 쓰지 않는 기능은 이곳에 모아 두었어요." onClose={onClose}>
      <div className="nf-card-tool-list">
        <button type="button" disabled={!canUndo} onClick={undo}>되돌리기</button>
        <button type="button" disabled={!canRedo} onClick={redo}>앞으로</button>
        <button type="button" onClick={resetUnit}>현재 단원 비우기</button>
        <button type="button" disabled={!hasImage} onClick={removeImage}>이미지 제거</button>
      </div>
    </SimpleModal>
  );
}

function SimpleModal({ title, desc, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`nf-card-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <button type="button" className="nf-card-modal-close" onClick={onClose}>×</button>
        <h3>{title}</h3>
        <p>{desc}</p>
        {children}
      </div>
    </div>
  );
}

function LibraryPage({ bookTitle, units, go }) {
  const count = units.filter((unit) => hasText(unit.content)).length;
  return (
    <section className="essay-hero nf-card-placeholder">
      <div>
        <span className="essay-kicker">내 서재</span>
        <h1>{bookTitle}</h1>
        <p>작성된 단원 {count}개가 저장되었어요. 작업 화면으로 돌아가 이어서 수정할 수 있어요.</p>
        <button type="button" className="essay-primary" onClick={() => go('step3')}>작업 화면으로 돌아가기</button>
      </div>
      <div className="essay-hero-card"><strong>교육·지식 책</strong><p>단원 카드로 조립한 책입니다.</p></div>
    </section>
  );
}

function PlaceholderPage({ view }) {
  const labels = {
    fairy: ['동화 서가', '장면과 삽화를 함께 구성하는 동화 제작 메뉴입니다.'],
    novel: ['소설 서가', '인물과 사건을 쌓아 긴 이야기를 만드는 공간입니다.'],
    friends: ['친구의 서재', '다른 작가의 작품을 둘러보고 영감을 얻는 공간입니다.'],
  };
  const [title, desc] = labels[view] || ['상상서가', 'AI와 함께 책을 만드는 공간입니다.'];
  return (
    <section className="essay-hero nf-card-placeholder">
      <div>
        <span className="essay-kicker">상상서가</span>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="essay-hero-card"><strong>준비 중인 메뉴</strong><p>현재 요청에서는 교육·지식 화면을 중심으로 구성했어요.</p></div>
    </section>
  );
}
