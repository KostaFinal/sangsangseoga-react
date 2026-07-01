import React, { useEffect, useMemo, useRef, useState } from 'react';

const modeCards = [
  {
    key: 'choice',
    title: '선택형',
    subtitle: '준비된 선택지를 고르며 쉽게 시작',
    icon: '☑',
    recommend: '추천: 처음 쓰는 사람 · 빠르게 완성하고 싶은 사람',
    points: ['부담이 적어요', 'AI가 방향을 잡아줘요', '빠르게 시를 만들 수 있어요'],
  },
  {
    key: 'answer',
    title: '답변형(집중형)',
    subtitle: '질문에 답하며 생각을 구체화',
    icon: '💬',
    recommend: '추천: 아이디어는 있지만 정리가 어려운 사람',
    points: ['생각을 풀어내기 쉬워요', '몰입해서 만들 수 있어요', '내용이 더 구체적이에요'],
  },
  {
    key: 'free',
    title: '자유형',
    subtitle: '원하는 내용을 입력하고 필요한 만큼만 AI 도움 받기',
    icon: '✒',
    recommend: '추천: 내 문장을 살리면서 자유롭게 만들고 싶은 사람',
    points: ['질문 없이 바로 시작해요', '그대로 추가하거나 AI가 다듬어줘요', '원하는 부분만 요청할 수 있어요'],
  },
];

const basicOptions = {
  authorAge: ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'],
  readerAge: ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'],
  topic: ['꿈', '우정', '가족', '계절', '나', '용기', '추억', '바다'],
  style: ['자유시', '동시', '산문시'],
  length: ['짧게', '보통', '길게'],
  mood: ['따뜻함', '밝음', '차분함', '몽환적', '희망적'],
};

const choiceQuestions = [
  {
    key: 'speaker',
    label: '화자',
    question: '이 시의 화자는 누구인가요?',
    choices: ['내가 직접 말하는 화자', '누군가에게 전하는 화자', '사물의 입장에서 말하는 화자', '미래의 내가 말하는 화자', 'AI 추천'],
  },
  {
    key: 'subject',
    label: '소재',
    question: '시에 중심적으로 담고 싶은 소재는 무엇인가요?',
    choices: ['편지', '별', '창문', '길', 'AI 추천'],
  },
  {
    key: 'firstScene',
    label: '첫 장면',
    question: '시는 어떤 장면에서 시작하면 좋을까요?',
    choices: ['창밖을 바라보는 장면', '편지를 쓰는 장면', '길을 걷는 장면', '작은 사물을 발견하는 장면', 'AI 추천'],
  },
  {
    key: 'emotionChange',
    label: '정서 변화',
    question: '시가 진행되면서 정서는 어떻게 변화하면 좋을까요?',
    choices: ['불안에서 희망으로', '그리움에서 고마움으로', '외로움에서 위로로', '작은 생각에서 큰 깨달음으로', 'AI 추천'],
  },
  {
    key: 'ending',
    label: '마무리',
    question: '시의 마무리는 어떤 여운을 남기면 좋을까요?',
    choices: ['따뜻한 위로', '조용한 여운', '희망적인 마음', '짧고 인상적인 마무리', 'AI 추천'],
  },
];

const answerQuestions = [
  {
    key: 'speaker',
    label: '화자',
    question: '시의 화자를 입력해주세요.',
    placeholder: '예: 나 / 그리운 사람 / 바람 / 달빛 / 어린 시절의 나',
    optional: false,
  },
  {
    key: 'subject',
    label: '장면·사물',
    question: '시에 담을 장면이나 사물을 입력해주세요.',
    placeholder: '예: 창가에 스미는 달빛 / 비 오는 골목 / 흩어진 꽃잎 / 오래된 편지 / 새벽의 바다',
    optional: false,
  },
  {
    key: 'firstScene',
    label: '전하고 싶은 이야기',
    question: '시에서 가장 전하고 싶은 이야기를 입력해주세요.',
    placeholder: '예: 기다림 끝에도 마음은 남아 있다는 이야기 / 작은 빛이 어둠을 견디게 한다는 이야기',
    optional: false,
  },
  {
    key: 'emotionChange',
    label: '감정 흐름',
    question: '시의 감정 흐름을 입력해주세요.',
    placeholder: '예: 쓸쓸함에서 잔잔한 위로로 / 그리움에서 따뜻한 기억으로 / 불안함에서 희망으로',
    optional: false,
  },
  {
    key: 'ending',
    label: '독자의 마음',
    question: '독자가 시를 읽고 느꼈으면 하는 마음을 입력해주세요.',
    placeholder: '예: 오래 남는 여운 / 조용한 위로 / 누군가가 떠오르는 그리움 / 마음이 맑아지는 느낌',
    optional: false,
  },
  {
    key: 'requiredPhrase',
    label: '포함 단어·문장',
    question: '꼭 넣고 싶은 단어나 문장을 입력해주세요.',
    placeholder: '예: 달빛 / 바람의 편지 / 남겨진 이름 / 작은 별 하나 / “나는 아직 여기에 있어”',
    optional: true,
  },
];

const defaultSettings = {
  mode: '',
  authorAge: '',
  readerAge: '',
  topic: '',
  style: '',
  length: '',
  mood: '',
};

const defaultSelections = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
};

const defaultAnswers = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
  requiredPhrase: '',
};

const initialPoemBody = '아직 시가 없어요.\n오른쪽에서 내용을 입력하거나 AI에게 요청해 본문을 추가해 주세요.';

const createPoem = (order = 1) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  title: '아직 제목이 없어요',
  content: initialPoemBody,
  order,
  selections: { ...defaultSelections },
  answers: { ...defaultAnswers },
  freeRequest: '',
  generationSource: '',
  coverReady: false,
  illustrationReady: false,
});

function splitPoemContent(content) {
  const lines = String(content || '').split('\n');
  const pages = [];
  const maxLinesPerPage = 10;

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage).join('\n').trim());
  }

  return pages.length ? pages : [''];
}

function createPreviewPages(poems) {
  const sortedPoems = [...poems].sort((a, b) => a.order - b.order);

  return sortedPoems.flatMap((poem) => (
    splitPoemContent(poem.content).map((content, index) => ({
      pageNumber: 0,
      poemId: poem.id,
      title: poem.title,
      content,
      isContinued: index > 0,
      coverReady: poem.coverReady,
      illustrationReady: poem.illustrationReady,
    }))
  )).map((page, index) => ({ ...page, pageNumber: index + 1 }));
}

function cleanAiValue(value) {
  return String(value || '').replace(/^AI 추천:\s*/u, '').trim();
}

function getAiChoiceRecommendation(key, settings) {
  const topic = settings.topic || '꿈';
  const style = settings.style || '자유시';

  const recommendations = {
    speaker: style === '동시' ? '어린 내가 직접 말하는 화자' : '미래의 내가 지금의 나에게 말하는 화자',
    subject: topic === '바다' ? '파도' : topic === '가족' ? '따뜻한 식탁' : topic === '우정' ? '함께 걷는 길' : '작은 불빛',
    firstScene: style === '산문시' ? '오래된 사진을 바라보는 장면' : '창밖으로 빛이 들어오는 장면',
    emotionChange: topic === '추억' ? '그리움에서 고마움으로' : '망설임에서 희망으로',
    ending: style === '동시' ? '밝고 따뜻한 응원' : '조용하지만 오래 남는 여운',
  };

  return `AI 추천: ${recommendations[key] || '시와 어울리는 방향'}`;
}

function getBasicRecommendation(key, settings) {
  if (key === 'topic') {
    if (settings.style === '동시') return '우정';
    if (settings.style === '산문시') return '추억';
    return '꿈';
  }

  if (key === 'mood') {
    if (settings.style === '산문시') return '차분함';
    if (settings.topic === '용기') return '희망적';
    return '따뜻함';
  }

  return '';
}

function getGeneratedPoemText(settings, poem, mode, variant = 0) {
  const source = mode === 'answer' ? poem.answers || defaultAnswers : poem.selections || defaultSelections;
  const speaker = cleanAiValue(source.speaker) || '내가 직접 말하는 화자';
  const subject = cleanAiValue(source.subject) || settings.topic || '꿈';
  const firstScene = cleanAiValue(source.firstScene) || '창밖을 바라보는 장면';
  const emotionChange = cleanAiValue(source.emotionChange) || '불안에서 희망으로';
  const ending = cleanAiValue(source.ending) || '조용한 여운';
  const requiredPhrase = String(poem.answers?.requiredPhrase || '').trim();
  const freeRequest = String(poem.freeRequest || '').trim();
  const topic = settings.topic || subject || '꿈';
  const mood = settings.mood || '따뜻함';
  const style = settings.style || '자유시';
  const length = settings.length || '보통';

  if (mode === 'free') {
    const requestLine = freeRequest || `${topic}을 중심으로 ${mood} 분위기의 ${style}`;
    const extra = length === '길게'
      ? '\n\n나는 그 문장을 오래 바라보다\n마음 한쪽에 작은 불을 켜요\n아직 끝나지 않은 이야기가\n천천히 내일 쪽으로 걸어가요'
      : length === '보통'
        ? '\n\n그리고 나는 알아요\n작은 마음도 한 권의 책이 될 수 있다는 걸'
        : '';

    return `${requestLine}\n\n그 안에서 나는\n아직 이름 붙이지 못한 마음을 꺼내요\n\n바람은 조용히 지나가고\n문장은 천천히 빛을 얻어요${extra}`;
  }

  const opening = `${firstScene}에서\n${speaker}는 ${subject}을 바라봐요`;
  const middle = `${mood} 마음이 조용히 번지고\n${topic}은 한 줄의 빛처럼 남아요`;
  const shift = `처음의 마음은\n${emotionChange} 천천히 움직여요`;
  const required = requiredPhrase ? `\n\n${requiredPhrase}` : '';
  const end = `${ending}을 남기며\n${subject}은 오래도록 마음에 머물러요`;

  const normalExtra = variant % 2 === 0 ? '' : `\n\n말하지 못한 마음도\n시가 되면 조금은 가까워져요`;
  const longExtra = `\n\n하루의 가장자리에서\n나는 다시 ${subject}의 이름을 불러요\n작고 희미했던 마음은\n어느새 내 안의 길이 되고\n그 길 끝에는 아직 도착하지 않은\n따뜻한 내일이 서 있어요`;
  const extra = length === '길게' ? longExtra : length === '보통' ? normalExtra : '';

  return `${opening}\n\n${middle}\n\n${shift}${required}\n\n${end}${extra}`;
}

function getTitleIdeas(settings, poem) {
  const selections = poem?.selections || defaultSelections;
  const answers = poem?.answers || defaultAnswers;
  const isFree = settings.mode === 'free';
  const topic = settings.topic || (isFree ? '나의 시' : '꿈');
  const mood = settings.mood || '따뜻한';
  const image = cleanAiValue(selections.subject || answers.subject) || (isFree ? '문장' : topic);
  return [`${topic}을 담은 ${image}`, `${mood} ${topic}`, `${image}이 남은 자리`, `작은 ${topic}의 이름`];
}

function getContentBase(content) {
  return String(content || '') === initialPoemBody ? '' : String(content || '');
}

function joinPoemText(base, addition) {
  const cleanBase = getContentBase(base).trim();
  const cleanAddition = String(addition || '').trim();
  if (!cleanBase) return cleanAddition || initialPoemBody;
  if (!cleanAddition) return cleanBase;
  return `${cleanBase}\n\n${cleanAddition}`;
}

function polishFreeInput(text) {
  const cleaned = String(text || '')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n')
    .replace(/친구은/g, '친구는')
    .replace(/꿈은은/g, '꿈은')
    .replace(/마음이이/g, '마음이');

  if (!cleaned) return '';

  return cleaned
    .split('\n')
    .map((line) => line
      .replace(/너무너무/g, '아주')
      .replace(/좋았다/g, '좋았어요')
      .replace(/했다/g, '했어요'))
    .join('\n');
}

function getFreeRequestedText(request, settings, variant = 0) {
  const cleanRequest = String(request || '').trim();
  const topic = settings.topic || '마음';
  const isPartial = /(첫|한 연|한연|장면|일부|마지막|도입|마무리|구절|문장)/u.test(cleanRequest);
  const baseSubject = cleanRequest || `${topic}을 주제로 한 시`;

  if (isPartial) {
    return `${baseSubject}\n\n작은 빛이 문틈으로 들어오고\n나는 그 앞에서 마음을 천천히 펼쳐요\n아직 다 쓰지 못한 말들이\n조용히 첫 장면이 되어 앉아요`;
  }

  const alt = variant % 2 === 0
    ? ['창가에 앉은 마음이', '오래 접어 둔 말을 꺼내고', '바람은 그 문장을 받아', '멀리 있는 내일에게 건네요']
    : ['아직 이름 없는 마음 하나가', '하얀 종이 위에 내려앉고', '나는 그 마음을 따라', '천천히 빛나는 길을 걸어요'];

  return `${baseSubject}\n\n${alt.join('\n')}\n\n처음엔 작고 희미했지만\n끝내 사라지지 않는 마음처럼\n오늘의 시는 조용히 남아\n나를 다시 앞으로 데려가요`;
}

function getFreeContinuationText(currentContent, request, settings, variant = 0) {
  const cleanRequest = String(request || '').trim();
  const direction = cleanRequest || '현재 시의 분위기와 흐름을 이어서 다음 연을 써줘';
  const topic = settings.topic || '마음';
  const endings = variant % 2 === 0
    ? [`그래서 나는 ${topic}의 이름을`, '조금 더 다정하게 불러 보아요', '끝난 줄 알았던 문장 뒤에서', '다음 마음이 천천히 피어나요']
    : ['그 길의 끝에서 나는', '아직 남은 말을 발견해요', '작은 숨처럼 이어진 문장이', '다음 연의 문을 열어 줘요'];

  return `${direction}\n\n${endings.join('\n')}`;
}

function getFreeRevisionText(selectedText, request) {
  const selected = String(selectedText || '').trim();
  const cleanRequest = String(request || '').trim();
  if (!selected || !cleanRequest) return '';

  const polished = polishFreeInput(selected);

  if (cleanRequest.includes('짧')) {
    return polished.split('\n').slice(0, 2).join('\n');
  }

  if (cleanRequest.includes('비유')) {
    return `${polished}\n달빛처럼 천천히 번지는 마음으로`;
  }

  if (cleanRequest.includes('따뜻')) {
    return `${polished}\n따뜻한 숨결처럼 오래 마음에 머물러요`;
  }

  if (cleanRequest.includes('오타') || cleanRequest.includes('어색')) {
    return polished;
  }

  return `${polished}\n${cleanRequest.replace(/해줘|바꿔줘|수정해줘/g, '').trim()} 느낌이 자연스럽게 남도록 다듬었어요`;
}
export default function PoemApp({ onSwitchGenre, initialView = 'home' }) {
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
      setCurrentView(event.state?.view || 'home');
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

  const completeAndMove = () => {
    setShowCompleteModal(false);
    setCurrentView('library');
  };

  return (
    <div className="app-frame pt-4">
      <main className="workspace">
        {['home', 'fairy', 'novel', 'essay', 'knowledge', 'friends'].includes(currentView) && <Home currentView={currentView} setCurrentView={requestViewChange} />}
        {currentView === 'step1' && (
          <StepOne settings={settings} setSettings={setSettings} setCurrentView={setCurrentView} />
        )}
        {currentView === 'step2' && (
          <StepTwo
            settings={settings}
            setSettings={setSettings}
            setCurrentView={setCurrentView}
            requestViewChange={requestViewChange}
          />
        )}
        {currentView === 'step3' && (
          <StepThree
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
          <StepFour
            previewPages={previewPages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            updatePoemById={updatePoemById}
            requestViewChange={requestViewChange}
            setShowCompleteModal={setShowCompleteModal}
          />
        )}
        {currentView === 'library' && <Library poems={poems} previewPages={previewPages} setCurrentView={setCurrentView} />}
      </main>

      {showBackModal && (
        <Modal
          title="이전 단계로 이동할까요?"
          desc="현재 시의 선택 내용과 만들어진 시가 초기화될 수 있어요. 확인을 누르면 내용을 지우고 이전 단계로 이동해요."
          cancelText="취소"
          confirmText="확인"
          onCancel={cancelBack}
          onConfirm={confirmBack}
        />
      )}

      {showCompleteModal && (
        <Modal
          title="책이 완성되었어요!"
          desc="내 서재의 책 목록에서 방금 만든 시집을 확인할 수 있어요."
          cancelText="닫기"
          confirmText="확인"
          onCancel={() => setShowCompleteModal(false)}
          onConfirm={completeAndMove}
          celebration
        />
      )}

    </div>
  );
}

function HeaderNav({ currentView, setCurrentView, onSwitchGenre }) {
  const menu = [
    ['fairy', '동화'],
    ['novel', '소설'],
    ['step1', '시'],
    ['essay', '에세이'],
    ['knowledge', '교육·지식'],
    ['friends', '친구의 서재'],
    ['library', '내 서재'],
  ];

  const isPoemFlow = ['poem-intro', 'step1', 'step2', 'step3', 'step4'].includes(currentView);

  return (
    <nav className="header-nav" aria-label="주요 메뉴">
      {menu.map(([key, label]) => {
        const active = label === '시' ? isPoemFlow : currentView === key;

        return (
          <button key={label} className={active ? 'active' : ''} onClick={() => { if (label === '에세이' && onSwitchGenre) onSwitchGenre('essay'); else if (label === '교육·지식' && onSwitchGenre) onSwitchGenre('nonfiction'); else setCurrentView(key); }}>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function Home({ currentView, setCurrentView }) {
  const labels = {
    home: ['상상서가 작업실', 'AI와 함께 책을 만드는 보라빛 편집 공간입니다.'],
    fairy: ['동화 서가', '장면과 삽화를 함께 구성하는 동화 제작 메뉴입니다.'],
    novel: ['소설 서가', '인물과 사건을 쌓아 긴 이야기를 만드는 공간입니다.'],
    essay: ['에세이 서가', '경험과 감정을 문장으로 다듬는 공간입니다.'],
    knowledge: ['교육·지식 서가', '정보를 체계적으로 정리해 지식 책으로 만드는 공간입니다.'],
    friends: ['친구의 서재', '다른 작가의 작품을 둘러보고 영감을 얻는 공간입니다.'],
  };
  const [title, desc] = labels[currentView] || labels.home;

  return (
    <section className="home-page editor-home">
      <div className="home-copy">
        <span className="step-badge">AI Book Workspace</span>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
        <button className="primary" onClick={() => setCurrentView('step1')}>시 만들기 시작</button>
      </div>
      <div className="home-preview-card" aria-label="편집기 미리보기">
        <div className="home-preview-toolbar"><span /><span /><span /></div>
        <div className="home-preview-body">
          <aside>
            <i />
            <i />
            <i />
          </aside>
          <article>
            <strong>상상서가</strong>
            <p>선택한 장면과 분위기가 한 편의 시로 정리돼요.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function StepOne({ settings, setSettings, setCurrentView }) {
  return (
    <section className="step-page">
      <FlowStepper active={1} />
      <div className="mode-grid">
        {modeCards.map((mode) => (
          <button
            key={mode.key}
            className={`mode-select-card ${settings.mode === mode.key ? 'selected' : ''}`}
            onClick={() => setSettings((prev) => ({ ...prev, mode: mode.key }))}
          >
            <span className="mode-icon">{mode.icon}</span>
            <h3>{mode.title}</h3>
            <p>{mode.subtitle}</p>
            <em>{mode.recommend}</em>
            <ul>{mode.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <strong>이 방식으로 시작</strong>
          </button>
        ))}
      </div>
      <div className="bottom-actions step-one-actions">
        <button className="primary" disabled={!settings.mode} onClick={() => setCurrentView('step2')}>다음</button>
      </div>
    </section>
  );
}

function StepTwo({ settings, setSettings, setCurrentView, requestViewChange }) {
  const commonRows = [
    ['authorAge', '작가 연령대', '시를 쓰는 사람의 연령대를 골라주세요.', basicOptions.authorAge, true],
    ['readerAge', '독자 연령대', '시를 읽을 사람의 연령대를 골라주세요.', basicOptions.readerAge, false],
  ];
  const guidedRows = [
    ['topic', '주제', '시에서 가장 중심이 되는 단어예요.', basicOptions.topic, true],
    ['style', '형식', '시의 기본 모양을 정해요.', basicOptions.style, true],
    ['length', '길이', '시가 어느 정도 분량이면 좋을지 정해요.', basicOptions.length, true],
    ['mood', '분위기', '원하는 경우 시의 온도와 색깔을 더해요.', basicOptions.mood, false],
  ];
  const rows = settings.mode === 'free' ? commonRows : [...commonRows, ...guidedRows];
  const isFilled = (value) => String(value || '').trim().length > 0;
  const canGoNext = rows.every(([key, , , , required]) => !required || isFilled(settings[key]));
  const applyAiRecommendation = (key) => {
    const recommendation = getBasicRecommendation(key, settings);
    if (!recommendation) return;
    setSettings((prev) => ({ ...prev, [key]: recommendation }));
  };
  const updateTextValue = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const keywordPlaceholders = {
    topic: '예: 오래된 친구와 다시 만나는 순간',
    mood: '예: 담담하지만 따뜻하게',
  };

  return (
    <section className="step-page compact-page">
      <FlowStepper active={2} />
      <div className="basic-form-card">
        <div className="settings-group visual-settings">
          {rows.map(([key, label, helper, options, required]) => (
            <div className="setting-row" key={key}>
              <div>
                <strong>{label}<em>{required ? '필수' : '선택'}</em></strong>
                <span>{helper}</span>
              </div>
              <div className={['topic', 'mood'].includes(key) ? 'keyword-option-control' : ''}>
                {['topic', 'mood'].includes(key) && (
                  <input
                    value={settings[key] || ''}
                    onChange={(event) => updateTextValue(key, event.target.value)}
                    placeholder={keywordPlaceholders[key]}
                  />
                )}
                <div className="option-button-grid">
                  {options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      data-long={option.length >= 6 ? 'true' : undefined}
                      className={settings[key] === option ? 'selected' : ''}
                      onClick={() => setSettings((prev) => ({ ...prev, [key]: prev[key] === option && !required ? '' : option }))}
                    >
                      {option}
                    </button>
                  ))}
                  {['topic', 'mood'].includes(key) && (
                    <button
                      type="button"
                      className="ai-recommend-option"
                      onClick={() => applyAiRecommendation(key)}
                    >
                      AI 추천
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bottom-actions">
        <button className="ghost" onClick={() => requestViewChange('step1')}>이전</button>
        <button className="primary" disabled={!canGoNext} onClick={() => setCurrentView('step3')}>다음</button>
      </div>
    </section>
  );
}

function StepThree({
  settings,
  selections,
  answers,
  poem,
  poems,
  activePoem,
  setActivePoem,
  updatePoem,
  questionIndex,
  setQuestionIndex,
  selectChoice,
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
  const mode = settings.mode || 'choice';
  const isChoiceMode = mode === 'choice';
  const isAnswerMode = mode === 'answer';
  const isFreeMode = mode === 'free';
  const questions = isAnswerMode ? answerQuestions : choiceQuestions;
  const safeQuestionIndex = Math.min(questionIndex, questions.length - 1);
  const q = questions[safeQuestionIndex];
  const [choiceEditMode, setChoiceEditMode] = useState(false);
  const [choiceSelectedText, setChoiceSelectedText] = useState('');
  const [answerEditMode, setAnswerEditMode] = useState(false);
  const [answerSelectedText, setAnswerSelectedText] = useState('');
  const [answerEditRequest, setAnswerEditRequest] = useState('');
  const [freeAction, setFreeAction] = useState('raw');
  const [freeEditMode, setFreeEditMode] = useState(false);
  const [freeSelectedText, setFreeSelectedText] = useState('');
  const [freeEditRequest, setFreeEditRequest] = useState('');
  const [freeUndoSnapshot, setFreeUndoSnapshot] = useState(null);
  const [freeRedoSnapshot, setFreeRedoSnapshot] = useState(null);
  const choiceReady = choiceQuestions.every((item) => selections[item.key]);
  const answerReady = answerQuestions.every((item) => item.optional || String(answers[item.key] || '').trim());
  const freeInputReady = String(poem.freeRequest || '').trim().length > 0;
  const freeBaseContent = getContentBase(poem.content);
  const freeHasContent = freeBaseContent.trim().length > 0;
  const canUseRawFreeAction = freeInputReady;
  const canUseAiRequest = true;
  const poemGenerated = getContentBase(poem.content).trim().length > 0;
  const choiceGenerated = isChoiceMode && poemGenerated;

  const updateAnswer = (value) => {
    const nextAnswers = { ...answers, [q.key]: value };
    updateCurrentPoemAnswers(nextAnswers);
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
    setFreeEditMode(false);
  };

  const closeFreeEditMode = () => {
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
  };

  useEffect(() => {
    setChoiceEditMode(false);
    setChoiceSelectedText('');
    setAnswerEditMode(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setFreeEditMode(false);
    setFreeSelectedText('');
    setFreeEditRequest('');
    setFreeUndoSnapshot(null);
    setFreeRedoSnapshot(null);
  }, [poem.id, mode]);

  const handlePoemTextSelect = (event) => {
    if (!choiceEditMode && !answerEditMode && !freeEditMode) return;
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number' || start === end) return;
    const selectedText = target.value.slice(start, end);

    if (choiceEditMode) {
      setChoiceSelectedText(selectedText);
    }

    if (answerEditMode) {
      setAnswerSelectedText(selectedText);
    }

    if (freeEditMode) {
      setFreeSelectedText(selectedText);
    }
  };

  const makeChoiceEditText = (type) => {
    const selected = choiceSelectedText.trim();
    if (!selected) return '';

    if (type === 'poetic') {
      return `${selected}
처럼 마음에 오래 남는 빛`;
    }

    if (type === 'polish') {
      return selected
        .replace(/\s+/g, ' ')
        .replace(/은는/g, '은')
        .replace(/이가/g, '이')
        .trim();
    }

    const subject = cleanAiValue(selections.subject) || settings.topic || '꿈';
    const ending = cleanAiValue(selections.ending) || settings.mood || '조용한 여운';
    return `${subject}이 ${ending}처럼 남도록 ${selected}을 다시 바라봐요`;
  };

  const applyChoiceEdit = (type) => {
    const selected = choiceSelectedText;
    if (!selected) return;
    const edited = makeChoiceEditText(type);
    if (!edited) return;
    updatePoem({ content: poem.content.replace(selected, edited) });
    setChoiceSelectedText('');
  };

  const closeChoiceEditMode = () => {
    setChoiceEditMode(false);
    setChoiceSelectedText('');
  };

  const makeAnswerEditText = () => {
    const selected = answerSelectedText.trim();
    const request = answerEditRequest.trim();
    if (!selected || !request) return '';

    if (request.includes('비유') || request.includes('달빛')) {
      return `${selected}
달빛 같은 마음이 조용히 번져요`;
    }

    if (request.includes('여운')) {
      return `${selected}
그 끝에 오래 남는 여운이 머물러요`;
    }

    if (request.includes('따뜻')) {
      return `${selected}
따뜻한 숨결처럼 마음에 닿아요`;
    }

    return `${selected}
잔잔한 물결처럼 마음에 스며요`;
  };

  const applyAnswerEdit = () => {
    const selected = answerSelectedText;
    if (!selected || !answerEditRequest.trim()) return;
    const edited = makeAnswerEditText();
    if (!edited) return;
    updatePoem({ content: poem.content.replace(selected, edited) });
    setAnswerSelectedText('');
    setAnswerEditRequest('');
    setAnswerEditMode(false);
  };

  const closeAnswerEditMode = () => {
    setAnswerEditMode(false);
    setAnswerSelectedText('');
    setAnswerEditRequest('');
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
      <FlowStepper active={3} />

      <div className={`editor-grid ${((choiceEditMode && isChoiceMode) || (answerEditMode && isAnswerMode) || isFreeEditing) ? 'edit-mode-grid' : ''}`}>
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
          {isChoiceMode && (
            <>
              <div className={`question-card ${choiceEditMode ? 'edit-active-card' : ''}`}>
                {choiceEditMode ? (
                  <div className="edit-mode-panel focused-edit-panel">
                    <div className="edit-mode-head">
                      <span>수정하기</span>
                      <strong>시 본문에서 바꾸고 싶은 부분을 드래그해 주세요.</strong>
                    </div>
                    <span className="edit-section-label">드래그한 부분</span>
                    <div className={`selected-edit-text ${choiceSelectedText ? '' : 'empty'}`}>
                      {choiceSelectedText || '수정하고 싶은 문장이나 구절을 드래그해 주세요.'}
                    </div>
                    <span className="edit-section-label edit-button-label">수정 방식</span>
                    <div className="mini-nav edit-actions">
                      <button className="primary small" disabled={!choiceSelectedText} onClick={() => applyChoiceEdit('poetic')}>더 시적으로</button>
                      <button className="primary small" disabled={!choiceSelectedText} onClick={() => applyChoiceEdit('polish')}>어색한 표현 수정</button>
                      <button className="primary small" disabled={!choiceSelectedText} onClick={() => applyChoiceEdit('partial')}>수정하기</button>
                      <button className="ghost small" onClick={closeChoiceEditMode}>닫기</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="question-head">
                      <span>질문 {safeQuestionIndex + 1} / {choiceQuestions.length}</span>
                      <strong>{q.label}</strong>
                    </div>
                    <h3>{q.question}</h3>
                    <div className="choice-list">
                      {q.choices.map((choice, index) => {
                        const isAiButton = index === q.choices.length - 1;
                        const selected = isAiButton ? String(selections[q.key] || '').startsWith('AI 추천:') : selections[q.key] === choice;

                        return (
                          <button key={choice} className={selected ? 'selected' : ''} onClick={() => selectChoice(choice)}>
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mini-nav">
                      <button className="ghost small" disabled={safeQuestionIndex === 0} onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}>이전</button>
                      <button className="primary small" disabled={!choiceGenerated && !choiceReady} onClick={() => (choiceGenerated ? setChoiceEditMode(true) : makePoem({ selections }))}>
                        {choiceGenerated ? '수정하기' : '시 만들기'}
                      </button>
                      <button className="ghost small" onClick={resetStep3}>초기화</button>
                      <button className="primary small" onClick={() => (choiceGenerated ? makePoem({ selections }) : makeAll())}>
                        {choiceGenerated ? 'AI 전체 재생성' : 'AI 전체 만들기'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {!choiceEditMode && (
                <div className="history-card">
                  <h3>선택 히스토리</h3>
                  {choiceQuestions.map((item) => (
                    <div key={item.key}>
                      <span>{item.label}</span>
                      <strong>{selections[item.key] || ''}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

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
                      placeholder="예: 더 잔잔한 표현으로 바꿔줘 / 달빛 같은 비유를 넣어줘 / 마지막에 여운이 남게 바꿔줘 / 감정을 더 따뜻하게 다듬어줘"
                      onChange={(event) => setAnswerEditRequest(event.target.value)}
                    />
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
                    <div className="mini-nav">
                      <button className="ghost small" disabled={safeQuestionIndex === 0} onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}>이전</button>
                      {poemGenerated ? (
                        <button className="primary small" onClick={() => setAnswerEditMode(true)}>수정하기</button>
                      ) : safeQuestionIndex < answerQuestions.length - 1 ? (
                        <button className="primary small" disabled={!q.optional && !String(answers[q.key] || '').trim()} onClick={goNextAnswer}>다음</button>
                      ) : (
                        <button className="primary small" disabled={!answerReady} onClick={makeAnswerPoem}>시 만들기</button>
                      )}
                      <button className="ghost small" onClick={resetStep3}>초기화</button>
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
        <button className="ghost" onClick={() => requestViewChange('step2')}>이전</button>
        <button className="primary" disabled={!poemGenerated} onClick={() => setCurrentView('step4')}>다음</button>
      </div>
    </section>
  );
}

function StepFour({ previewPages, activePreviewPage, setActivePreviewPage, updatePoemById, requestViewChange, setShowCompleteModal }) {
  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const leftPage = previewPages[spreadStart];
  const rightPage = previewPages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((previewPages.length - 1) / 2) * 2);
  const canGoPrev = spreadStart > 0;
  const canGoNext = spreadStart < maxStart;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActivePreviewPage(Math.max(0, spreadStart - 2));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActivePreviewPage(Math.min(maxStart, spreadStart + 2));
  };

  return (
    <section className="essay-preview-page poem-preview-page">
      <div className="essay-studio-top">
        <FlowStepper active={4} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview poem-book-preview">
          <button type="button" className="page-turn prev" onClick={goPrev} disabled={!canGoPrev} aria-label="이전 페이지">‹</button>
          <article className="essay-book-page left poem-book-page">
            {leftPage ? (
              <>
                {!leftPage.isContinued && <h2>{leftPage.title}</h2>}
                <p>{leftPage.content}</p>
                <span>{leftPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">빈 페이지</p>
            )}
          </article>
          <article className="essay-book-page right poem-book-page">
            {rightPage ? (
              <>
                {!rightPage.isContinued && rightPage.poemId !== leftPage?.poemId && <h2>{rightPage.title}</h2>}
                <p>{rightPage.content}</p>
                <span>{rightPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">다음 페이지 없음</p>
            )}
          </article>
          <button type="button" className="page-turn next" onClick={goNext} disabled={!canGoNext} aria-label="다음 페이지">›</button>
        </div>
        <aside className="essay-preview-side poem-preview-side">
          <h2>이미지 생성</h2>
          <div className="essay-image-box">
            <strong>표지·삽화 이미지</strong>
            <p>표지나 삽화가 필요하면 현재 시의 분위기를 바탕으로 생성할 수 있어요.</p>
            <button type="button" className="essay-soft" onClick={() => leftPage && updatePoemById(leftPage.poemId, { coverReady: true })}>표지 이미지 생성</button>
            <button type="button" className="essay-soft" onClick={() => leftPage && updatePoemById(leftPage.poemId, { illustrationReady: true })}>현재 쪽 삽화 생성</button>
          </div>
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => requestViewChange('step3')}>이전</button>
        <button type="button" className="essay-primary" onClick={() => setShowCompleteModal(true)}>완성하기</button>
      </div>
    </section>
  );
}

function Library({ poems, previewPages, setCurrentView }) {
  return (
    <section className="library-page">
      <div className="library-head">
        <div>
          <p>내 서재 &gt; 책 목록</p>
          <h1>완성된 책 목록</h1>
        </div>
        <button className="primary" onClick={() => setCurrentView('step1')}>새 시 만들기</button>
      </div>
      <div className="book-list">
        <article className="finished-book">
          <div className="finished-cover">詩</div>
          <div>
            <span>시집 · 완성됨</span>
            <h2>{poems[0]?.title || '나의 첫 시집'}</h2>
            <p>{poems.length}편의 시, {previewPages.length}개의 미리보기 페이지가 저장되었어요.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function StepTitle({ step, title, desc }) {
  return (
    <div className="step-title">
      <span>{String(step).padStart(2, '0')}</span>
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
    </div>
  );
}

function FlowStepper({ active }) {
  const steps = ['방식 선택', '기본 설정', '시 만들기', '미리보기'];
  return (
    <ol className="essay-flow poem-flow" aria-label="시 제작 단계">
      {steps.map((step, index) => (
        <li key={step} className={index + 1 === active ? 'active' : ''}>
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  );
}

function Modal({ title, desc, cancelText, confirmText, onCancel, onConfirm, celebration }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        {celebration && <div className="party">🎉</div>}
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
        <div>
          <button className="ghost" onClick={onCancel}>{cancelText}</button>
          <button className="primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </section>
    </div>
  );
}
