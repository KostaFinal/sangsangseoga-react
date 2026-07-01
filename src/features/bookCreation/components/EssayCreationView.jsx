import React, { useMemo, useState } from 'react';

const MODES = [
  {
    key: 'guided',
    title: '질문에 답하며 시작',
    badge: '추천',
    subtitle: '경험과 감정을 질문으로 정리한 뒤, AI와 이어 쓰는 방식이에요.',
    goodFor: '쓸 이야기는 있지만 어디서부터 정리할지 막막한 사람',
    points: ['처음에는 질문으로 글감을 모아요', '본문이 생기면 자유롭게 이어 쓸 수 있어요', '선택지는 보조 도움으로만 사용해요'],
  },
  {
    key: 'free',
    title: '자유롭게 시작',
    badge: '고급',
    subtitle: '내가 쓴 글감이나 요청을 바로 넣고, AI에게 정리·이어쓰기·수정을 맡겨요.',
    goodFor: '이미 쓰고 싶은 내용이 있거나 직접 흐름을 잡고 싶은 사람',
    points: ['사용자 입력을 그대로 넣을 수 있어요', 'AI가 에세이처럼 다듬어 줄 수 있어요', '긴 글도 계속 이어 붙이며 확장해요'],
  },
];

const AGE_OPTIONS = ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'];
const TONE_OPTIONS = ['따뜻하게', '담백하게', '솔직하게', '차분하게', '밝게'];
const THEME_OPTIONS = ['나의 하루', '가족', '친구', '꿈', '성장', '추억', '실패와 배움', '좋아하는 공간'];

const QUESTIONS = [
  {
    key: 'experience',
    label: '경험',
    question: '에세이에 담고 싶은 경험이나 이야기를 적어 주세요.',
    placeholder: '예: 비 오는 날 친구가 우산을 씌워준 일 / 처음 발표를 했던 날 / 가족과 늦게까지 이야기한 밤',
    optional: false,
  },
  {
    key: 'emotion',
    label: '감정',
    question: '그때 가장 크게 남은 감정을 적어 주세요.',
    placeholder: '예: 고마움 / 부끄러움 / 뿌듯함 / 아쉬움 / 괜찮아졌다는 느낌',
    optional: false,
  },
  {
    key: 'meaning',
    label: '생각',
    question: '그 경험을 지금 돌아보며 든 생각을 적어 주세요.',
    placeholder: '예: 작은 친절이 오래 기억된다는 것 / 실패해도 다시 시작할 수 있다는 것',
    optional: false,
  },
  {
    key: 'scene',
    label: '장면',
    question: '꼭 넣고 싶은 장면이나 문장을 적어 주세요.',
    placeholder: '예: 창문에 빗방울이 맺힌 장면 / 엄마가 웃으며 건넨 말 / 빈 운동장에 혼자 서 있던 순간',
    optional: false,
  },
  {
    key: 'readerFeeling',
    label: '독자의 마음',
    question: '독자가 읽고 어떤 마음을 느꼈으면 하는지 적어 주세요.',
    placeholder: '예: 조용한 위로 / 나도 해볼 수 있다는 용기 / 누군가가 떠오르는 따뜻함',
    optional: false,
  },
  {
    key: 'continueNote',
    label: '이어 쓸 내용',
    question: '이 에세이를 이어 쓸 때 더 담고 싶은 내용이 있다면 적어 주세요.',
    placeholder: '예: 친구와 화해한 장면을 더 넣고 싶어요 / 그 뒤에 달라진 마음을 이어 쓰고 싶어요',
    optional: true,
  },
];

const initialSettings = {
  mode: '',
  title: '',
  authorAge: '',
  readerAge: '',
  theme: '',
  tone: '',
  length: '',
};

const initialAnswers = QUESTIONS.reduce((acc, item) => ({ ...acc, [item.key]: '' }), {});

const HISTORY_LIMIT = 8;
const PAGE_LIMIT = 620;

function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function hasText(value) {
  return String(value || '').trim().length > 0;
}

function clean(value) {
  return String(value || '').trim();
}

function joinText(base, addition) {
  const a = clean(base);
  const b = clean(addition);
  if (!a) return b;
  if (!b) return a;
  return `${a}\n\n${b}`;
}

function smartTitle(settings, answers, content) {
  if (hasText(settings.title)) return settings.title.trim();
  const seed = clean(answers.experience) || clean(settings.theme) || clean(content).slice(0, 12) || '나의 에세이';
  const short = seed.replace(/[\n.?!,]/gu, ' ').split(' ').filter(Boolean).slice(0, 4).join(' ');
  return short ? `${short}에 대하여` : '나의 에세이';
}

function polishText(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/gu, ' '))
    .filter(Boolean)
    .map((line) => line
      .replace(/친구은/gu, '친구는')
      .replace(/가족은은/gu, '가족은')
      .replace(/너무너무/gu, '아주')
      .replace(/\s+([,.!?])/gu, '$1'))
    .join('\n\n');
}

function makeOpeningEssay(settings, answers, variant = 0) {
  const tone = settings.tone || '따뜻하게';
  const theme = settings.theme || '나의 이야기';
  const experience = clean(answers.experience) || theme;
  const emotion = clean(answers.emotion) || '오래 남은 마음';
  const meaning = clean(answers.meaning) || '평범한 순간도 나를 조금씩 바꾼다는 것';
  const scene = clean(answers.scene) || '그날의 공기와 표정';
  const readerFeeling = clean(answers.readerFeeling) || '조용한 위로';
  const continueNote = clean(answers.continueNote);
  const intro = variant % 2 === 0
    ? `처음에는 ${experience}이 이렇게 오래 마음에 남을 줄 몰랐다.`
    : `${scene}을 떠올리면, 그때의 마음이 아직도 천천히 되살아난다.`;
  const body = `${tone} 적어 보자면, 그 순간의 나는 ${emotion}을 가장 크게 느끼고 있었다. 겉으로는 별일 아닌 듯 지나갔지만, 마음속에서는 오래 접어 둔 종이가 다시 펼쳐지는 것처럼 여러 생각이 일어났다.`;
  const insight = `지금 돌아보면 그 경험은 내게 ${meaning}을 알려 주었다. 그래서 이 글은 거창한 결론보다, 한 사람이 자기 마음을 조금 더 선명하게 바라보는 기록에 가깝다.`;
  const note = continueNote ? `\n\n앞으로 이어 쓴다면 ${continueNote}에 대해서도 더 천천히 적어 보고 싶다.` : '';
  const reader = `이 글을 읽는 사람에게는 ${readerFeeling}이 남았으면 한다.`;
  return `${intro}\n\n${body}\n\n${insight}${note}\n\n${reader}`;
}


function makeGuidedParagraph(settings, answers, stepIndex, variant = 0) {
  const tone = settings.tone || '따뜻하게';
  const theme = settings.theme || '나의 이야기';
  const experience = clean(answers.experience) || theme;
  const emotion = clean(answers.emotion) || '그때의 마음';
  const meaning = clean(answers.meaning) || '그 경험이 내게 남긴 생각';
  const scene = clean(answers.scene) || '그날의 장면';
  const readerFeeling = clean(answers.readerFeeling) || '조용한 공감';

  if (stepIndex === 0) {
    return variant % 2 === 0
      ? `처음에는 ${experience}이 내 마음에 이렇게 오래 남을 줄 몰랐다. 그 일은 아주 큰 사건처럼 시작된 것은 아니었지만, 시간이 지날수록 자꾸만 다시 떠오르는 기억이 되었다. 나는 그 순간을 떠올릴 때마다 그때의 나와 지금의 내가 조용히 마주 앉아 있는 것 같은 기분이 든다.`
      : `${experience}에 대해 쓰려고 하니, 가장 먼저 그날의 공기와 마음이 함께 떠오른다. 지나고 보면 평범했던 순간도 글로 옮기면 전혀 다른 의미를 갖게 된다. 이 에세이는 그 기억을 다시 꺼내어 내가 왜 아직도 그 일을 붙잡고 있는지 천천히 살펴보는 글이다.`;
  }

  if (stepIndex === 1) {
    return `그때 내 안에 가장 크게 남은 감정은 ${emotion}이었다. 그 마음은 한순간에 사라지지 않고, 며칠이 지나도 마음 한쪽에 작게 남아 있었다. 누군가에게는 별일 아닌 감정처럼 보일 수도 있지만, 나에게는 그 경험을 다시 생각하게 만드는 가장 선명한 흔적이었다.`;
  }

  if (stepIndex === 2) {
    return `지금 돌아보면 나는 그 일을 통해 ${meaning}을 생각하게 되었다. 당시에는 미처 알지 못했던 마음도 시간이 지나고 나서야 조금씩 이해되었다. 그래서 이 경험은 단순히 지나간 일이 아니라, 내가 나를 더 잘 알게 되는 작은 계기가 되었다.`;
  }

  if (stepIndex === 3) {
    return `특히 마음에 남아 있는 것은 ${scene}이다. 그 장면은 기억 속에서 아주 선명하게 남아, 글의 한가운데에 조용히 놓이고 싶어 한다. 나는 그 장면을 떠올릴 때마다 말로 다 설명하지 못했던 마음까지 함께 되살아나는 것을 느낀다.`;
  }

  if (stepIndex === 4) {
    return `이 글을 읽는 사람에게는 ${readerFeeling}이 남았으면 한다. 내 이야기가 누군가에게 거창한 답이 되지는 않더라도, 자신의 마음을 다시 들여다보는 작은 계기가 되었으면 좋겠다. 결국 이 에세이는 한 가지 경험을 통해 지나간 마음을 이해하고, 그 마음을 조금 더 따뜻하게 보내 주려는 기록이다.`;
  }

  return '';
}

function applyGuidedContinueNote(baseContent, continueNote, settings) {
  const base = clean(baseContent);
  const note = clean(continueNote);
  if (!note) return base;

  const wantsWholeRevision = /전체|수정|다듬|문체|분위기|톤|따뜻|담백|솔직|차분|밝|자연|짧|길|정리/gu.test(note);
  if (wantsWholeRevision) {
    const tone = settings.tone || '자연스럽게';
    const paragraphs = base.split(/\n\s*\n/gu).filter(Boolean);
    if (!paragraphs.length) return note;
    const lastIndex = paragraphs.length - 1;
    paragraphs[lastIndex] = `${paragraphs[lastIndex]} ${tone} 정리하면, 이 글은 ${note.replace(/해줘|해주세요|수정|다듬|전체|문체|분위기|톤/gu, '').trim() || '사용자가 더 담고 싶은 마음'}까지 자연스럽게 품는 방향으로 마무리된다.`;
    return paragraphs.join('\n\n');
  }

  return joinText(base, `마지막으로 덧붙이고 싶은 이야기가 있다. ${note} 이 내용까지 더하고 나니, 이 경험은 단순히 지나간 일이 아니라 지금의 나에게도 이어지는 마음처럼 느껴진다.`);
}

function makeGuidedEssayThrough(settings, answers, throughIndex, variant = 0) {
  const lastRequiredIndex = Math.min(throughIndex, 4);
  const paragraphs = [];
  for (let index = 0; index <= lastRequiredIndex; index += 1) {
    const question = QUESTIONS[index];
    if (!question || !hasText(answers[question.key])) continue;
    paragraphs.push(makeGuidedParagraph(settings, answers, index, variant));
  }
  const base = paragraphs.join('\n\n');
  if (throughIndex >= 5) return applyGuidedContinueNote(base, answers.continueNote, settings);
  return base;
}

function getGuidedSuggestion(settings, answers, questionIndex) {
  const theme = clean(settings.theme) || '내가 겪은 일';
  const tone = clean(settings.tone) || '따뜻하게';
  const suggestions = [
    `${theme}와 관련해서 아직도 기억나는 일이 있어요. 그때는 평범하게 지나간 줄 알았지만, 시간이 지나고 보니 제 마음에 오래 남은 경험이었어요.`,
    '처음에는 당황스럽고 서툴렀지만, 시간이 지날수록 고마움과 아쉬움이 함께 남았어요.',
    '지금 돌아보면 그 일은 저에게 작은 마음도 쉽게 지나치지 말아야 한다는 걸 알려 준 경험이었어요.',
    '그날의 표정, 주변의 분위기, 누군가가 건넨 짧은 말이 아직도 선명하게 기억나요.',
    '읽는 사람이 제 이야기를 통해 조용한 위로와 다시 시작할 수 있다는 마음을 느꼈으면 좋겠어요.',
    `전체적으로 ${tone} 이어지면 좋겠고, 마지막에는 그 뒤로 조금 달라진 제 마음도 자연스럽게 담겼으면 좋겠어요.`,
  ];
  return suggestions[Math.min(questionIndex, suggestions.length - 1)];
}

function makeFreeEssay(settings, source, variant = 0) {
  const tone = settings.tone || '담백하게';
  const theme = settings.theme || '나의 이야기';
  const userSource = clean(source) || `${theme}에 대해 에세이로 쓰고 싶다.`;
  const first = variant % 2 === 0
    ? `나는 이 이야기를 오래 마음속에만 두고 있었다.`
    : `어떤 기억은 지나간 뒤에야 비로소 문장이 된다.`;
  return `${first}\n\n${polishText(userSource)}\n\n${tone} 다시 바라보면, 이 이야기는 단순한 사건이 아니라 그때의 나를 설명하는 작은 단서처럼 느껴진다. 나는 그 안에서 무엇을 붙잡고 있었는지, 또 무엇을 놓아도 되는지 천천히 생각해 보게 된다.\n\n그래서 이 글은 완벽한 결론을 향해 달려가기보다, 마음이 머물렀던 자리를 하나씩 짚어 보는 기록으로 이어진다.`;
}

function makeContinuation(content, request, settings, variant = 0) {
  const tone = settings.tone || '따뜻하게';
  const direction = clean(request) || '지금 본문의 흐름을 자연스럽게 이어 써 주세요.';
  const next = variant % 2 === 0
    ? `그 일을 조금 더 생각해 보면, 내가 붙잡고 있었던 것은 사건 자체보다 그때의 마음이었다. ${tone} 말하자면, 나는 그 순간을 통해 내가 무엇에 흔들리고 무엇으로 다시 일어서는지 알게 되었다.`
    : `시간이 지나자 그 기억은 조금 다른 표정으로 다가왔다. 처음에는 불편하고 서툴렀던 마음도, 다시 바라보니 나를 이해하는 데 필요한 한 조각이었다.`;
  return `${direction}\n\n${next}`;
}

function reviseSelection(selectedText, request) {
  const target = polishText(selectedText);
  const req = clean(request);
  if (!target) return '';
  if (!req) return target;
  if (/짧|간결/gu.test(req)) return target.split(/\n\n/gu).slice(0, 1).join('\n\n');
  if (/구체|장면|자세/gu.test(req)) return `${target}\n\n그 순간의 공기, 표정, 작은 소리까지 떠올리자 기억은 훨씬 선명한 장면으로 되살아났다.`;
  if (/따뜻/gu.test(req)) return `${target}\n\n그 기억은 시간이 지나도 차갑게 식지 않고, 오히려 나를 조용히 안아 주는 마음으로 남았다.`;
  if (/담백|자연|오타|어색/gu.test(req)) return target;
  return `${target}\n\n${req.replace(/해줘|바꿔줘|수정해줘/gu, '').trim()} 느낌이 자연스럽게 남도록 다듬었다.`;
}

function splitPages(content) {
  const text = clean(content);
  if (!text) return ['아직 작성된 본문이 없어요.'];
  const paragraphs = text.split(/\n\s*\n/gu).filter(Boolean);
  const pages = [];
  let current = '';
  paragraphs.forEach((paragraph) => {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= PAGE_LIMIT) {
      current = next;
      return;
    }
    if (current) pages.push(current.trim());
    if (paragraph.length <= PAGE_LIMIT) {
      current = paragraph;
      return;
    }
    for (let i = 0; i < paragraph.length; i += PAGE_LIMIT) {
      pages.push(paragraph.slice(i, i + PAGE_LIMIT).trim());
    }
    current = '';
  });
  if (current) pages.push(current.trim());
  return pages.length ? pages : ['아직 작성된 본문이 없어요.'];
}

function getDisplayTitle(settings, answers, content) {
  return smartTitle(settings, answers, content);
}

export default function EssayApp({ onSwitchGenre, initialView = 'step1' }) {
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

  return (
    <div className="app-shell essay-only-shell pt-4">
      <main className="workspace essay-workspace-root">
        {['home', 'fairy', 'novel', 'essay', 'knowledge', 'friends'].includes(view) && <Home view={view} setView={goStep} />}
        {view === 'step1' && <ModeStep settings={settings} setSettings={setSettings} goStep={goStep} resetEssay={resetEssay} />}
        {view === 'step2' && <SettingStep settings={settings} setSettings={setSettings} goStep={goStep} />}
        {view === 'step3' && (
          <StudioStep
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
          <PreviewStep
            title={title}
            pages={pages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            goStep={goStep}
            setShowCompleteModal={setShowCompleteModal}
          />
        )}
        {view === 'library' && <Library title={title} content={content} pages={pages} goStep={goStep} />}
      </main>

      {showCompleteModal && (
        <Modal
          title="에세이집이 완성되었어요"
          desc="내 서재에서 방금 만든 에세이를 확인할 수 있어요."
          cancelText="닫기"
          confirmText="내 서재로 이동"
          onCancel={() => setShowCompleteModal(false)}
          onConfirm={() => { setShowCompleteModal(false); goStep('library'); }}
        />
      )}
    </div>
  );
}

function HeaderNav({ view, setView, onSwitchGenre }) {
  const isEssayFlow = ['step1', 'step2', 'step3', 'step4', 'essay'].includes(view);
  const items = [
    ['fairy', '동화'],
    ['novel', '소설'],
    ['poem', '시'],
    ['step1', '에세이'],
    ['knowledge', '교육·지식'],
    ['friends', '친구의 서재'],
    ['library', '내 서재'],
  ];
  return (
    <nav className="header-nav" aria-label="주요 메뉴">
      {items.map(([key, label]) => {
        const active = label === '에세이' ? isEssayFlow : view === key;
        return (
          <button
            key={label}
            type="button"
            className={active ? 'active' : ''}
            onClick={() => { if (label === '시' && onSwitchGenre) onSwitchGenre('poem'); else if (label === '교육·지식' && onSwitchGenre) onSwitchGenre('nonfiction'); else setView(key); }}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function Home({ view, setView }) {
  const labels = {
    home: ['상상서가 작업실', 'AI와 함께 책을 만드는 보라빛 편집 공간입니다.'],
    fairy: ['동화 서가', '장면과 삽화를 함께 구성하는 동화 제작 메뉴입니다.'],
    novel: ['소설 서가', '인물과 사건을 쌓아 긴 이야기를 만드는 공간입니다.'],
    essay: ['에세이 서가', '경험과 생각을 문장으로 다듬는 에세이 제작 공간입니다.'],
    knowledge: ['교육·지식 서가', '정보를 체계적으로 정리해 지식 책으로 만드는 공간입니다.'],
    friends: ['친구의 서재', '다른 작가의 작품을 둘러보고 영감을 얻는 공간입니다.'],
  };
  const [title, desc] = labels[view] || labels.home;
  return (
    <section className="essay-hero">
      <div>
        <span className="essay-kicker">Essay Studio</span>
        <h1>{title}</h1>
        <p>{desc}</p>
        <button type="button" className="essay-primary" onClick={() => setView('step1')}>에세이 만들기 시작</button>
      </div>
      <div className="essay-hero-card">
        <strong>내용만 계속 쓰면 돼요</strong>
        <p>문단 정리와 페이지 나누기는 AI와 미리보기 단계에서 자연스럽게 처리돼요.</p>
      </div>
    </section>
  );
}

function Flow({ active }) {
  const items = ['방식 선택', '기본 설정', '에세이 작업', '미리보기'];
  return (
    <ol className="essay-flow" aria-label="에세이 제작 단계">
      {items.map((item, index) => <li key={item} className={index + 1 === active ? 'active' : ''}>{index + 1}. {item}</li>)}
    </ol>
  );
}

function ModeStep({ settings, setSettings, goStep, resetEssay }) {
  return (
    <section className="essay-step-page">
      <Flow active={1} />
      <div className="essay-mode-grid two-mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            type="button"
            className={`essay-mode-card ${settings.mode === mode.key ? 'selected' : ''}`}
            onClick={() => { resetEssay(); setSettings({ ...initialSettings, mode: mode.key }); }}
          >
            <span>{mode.badge}</span>
            <h2>{mode.title}</h2>
            <p>{mode.subtitle}</p>
            <em>{mode.goodFor}</em>
            <ul>{mode.points.map((point) => <li key={point}>{point}</li>)}</ul>
          </button>
        ))}
      </div>
      <div className="essay-bottom-actions">
        <button type="button" className="essay-primary" disabled={!settings.mode} onClick={() => goStep('step2')}>다음</button>
      </div>
    </section>
  );
}

function SettingStep({ settings, setSettings, goStep }) {
  const required = hasText(settings.authorAge);
  const isGuided = settings.mode === 'guided';
  const select = (key, value, requiredField = false) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === value && !requiredField ? '' : value }));
  };
  const change = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <section className="essay-step-page">
      <Flow active={2} />
      <div className="essay-setting-card">
        <OptionRow title="작가 연령대" required helper="에세이를 쓰는 사람의 연령대예요." options={AGE_OPTIONS} value={settings.authorAge} onPick={(value) => select('authorAge', value, true)} />
        <OptionRow title="독자 연령대" helper="읽을 사람을 정하면 문장 난이도와 설명이 맞춰져요." options={AGE_OPTIONS} value={settings.readerAge} onPick={(value) => select('readerAge', value)} />
        {isGuided && (
          <>
            <KeywordInputRow
              title="주제"
              helper="직접 입력하거나 자주 쓰는 키워드를 선택할 수 있어요."
              placeholder="예: 오래된 친구와 멀어진 이야기"
              options={THEME_OPTIONS}
              value={settings.theme}
              onChange={(value) => change('theme', value)}
              onPick={(value) => select('theme', value)}
            />
            <KeywordInputRow
              title="문체·분위기"
              helper="직접 입력하거나 원하는 글의 느낌을 선택할 수 있어요."
              placeholder="예: 담담하지만 따뜻하게"
              options={TONE_OPTIONS}
              value={settings.tone}
              onChange={(value) => change('tone', value)}
              onPick={(value) => select('tone', value)}
            />
          </>
        )}
      </div>
      <div className="essay-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => goStep('step1')}>이전</button>
        <button type="button" className="essay-primary" disabled={!required} onClick={() => goStep('step3')}>작업실로 이동</button>
      </div>
    </section>
  );
}

function OptionRow({ title, required = false, helper, options, value, onPick }) {
  return (
    <div className="essay-option-row">
      <div>
        <strong>{title}{required && <em>필수</em>}</strong>
        <small>{helper}</small>
      </div>
      <div className="essay-chip-grid">
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function KeywordInputRow({ title, helper, placeholder, options, value, onChange, onPick }) {
  return (
    <div className="essay-option-row essay-keyword-row">
      <div>
        <strong>{title}</strong>
        <small>{helper}</small>
      </div>
      <div className="essay-keyword-control">
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        <div className="essay-chip-grid">
          {options.map((option) => (
            <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudioStep(props) {
  const {
    settings,
    setSettings,
    answers,
    setAnswers,
    questionIndex,
    setQuestionIndex,
    guidedComplete,
    content,
    title,
    workInput,
    setWorkInput,
    startEssay,
    writeGuidedStep,
    recommendGuidedAnswer,
    appendRaw,
    appendPolished,
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
    resetEssay,
  } = props;
  const isGuided = settings.mode === 'guided';
  const isFree = settings.mode === 'free';
  const currentQuestion = QUESTIONS[Math.min(questionIndex, QUESTIONS.length - 1)];
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const currentAnswerReady = currentQuestion.optional || hasText(answers[currentQuestion.key]);
  const allRequiredReady = QUESTIONS.every((item) => item.optional || hasText(answers[item.key]));
  const hasContent = hasText(content);
  const showQuestions = isGuided && !guidedComplete;
  const canStartGuided = isLastQuestion && allRequiredReady;

  const goNextQuestion = () => {
    if (!currentAnswerReady) return;
    writeGuidedStep();
  };

  const summaryMemo = (
    <div className="essay-ai-card essay-summary-card">
      <h2>작성 요약</h2>
      <p>{isGuided ? '질문에 답할 때마다 에세이 본문이 한 문단씩 이어져요.' : '현재 에세이 작성에 참고되는 정보예요.'}</p>
      <div className="essay-source-box">
        <strong>{isGuided ? '질문 답변' : '작성 정보'}</strong>
        {isGuided ? (
          <dl className="essay-answer-summary-list">
            <div><dt>경험</dt><dd>{answers.experience || '아직 입력 전'}</dd></div>
            <div><dt>감정</dt><dd>{answers.emotion || '아직 입력 전'}</dd></div>
            <div><dt>생각</dt><dd>{answers.meaning || '아직 입력 전'}</dd></div>
            <div><dt>장면</dt><dd>{answers.scene || '아직 입력 전'}</dd></div>
            <div><dt>독자의 마음</dt><dd>{answers.readerFeeling || '아직 입력 전'}</dd></div>
          </dl>
        ) : (
          <dl>
            <div><dt>방식</dt><dd>자유형</dd></div>
            <div><dt>작가</dt><dd>{settings.authorAge || '-'}</dd></div>
            <div><dt>독자</dt><dd>{settings.readerAge || '미지정'}</dd></div>
            <div><dt>본문</dt><dd>{hasContent ? `${content.length.toLocaleString()}자 작성됨` : '아직 작성 전'}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );

  return (
    <section className="essay-studio-page">
      <div className="essay-studio-top">
        <Flow active={3} />
      </div>

      <div className={`essay-studio-layout ${isFree ? 'free-layout' : ''} ${isGuided ? 'guided-layout' : ''}`}>

        <section className="essay-editor-panel">
          <div className="essay-editor-title-row">
            <label>
              <span>제목</span>
              <input value={settings.title || title} onChange={(event) => setSettings((prev) => ({ ...prev, title: event.target.value }))} placeholder="제목을 입력하거나 AI 추천 제목을 사용하세요." />
            </label>
            <button type="button" className="essay-soft essay-title-button" onClick={() => setSettings((prev) => ({ ...prev, title }))}>AI 제목 추천</button>
          </div>
          <textarea
            className="essay-main-textarea"
            value={content}
            readOnly
            onSelect={selectFromTextarea}
            placeholder="아직 본문이 없어요. 오른쪽 패널에서 글감을 입력하거나 질문에 답한 뒤 에세이를 시작해 주세요."
          />
          <div className="essay-editor-foot">
            <span>{content.length.toLocaleString()}자</span>
            <span>{splitPages(content).length}쪽 예상</span>
            {selectedText && <span>선택됨: {selectedText.slice(0, 18)}{selectedText.length > 18 ? '…' : ''}</span>}
          </div>
        </section>

        <aside className="essay-ai-panel">
          {showQuestions ? (
            <div className="essay-ai-card essay-guided-question-card">
              <div className="question-progress"><span>{questionIndex + 1}</span> / {QUESTIONS.length}</div>
              <h2>{currentQuestion.question}{currentQuestion.optional && <span className="optional-inline"> (선택)</span>}</h2>
              <textarea
                value={answers[currentQuestion.key]}
                onChange={(event) => setAnswers((prev) => ({ ...prev, [currentQuestion.key]: event.target.value }))}
                placeholder={currentQuestion.placeholder}
              />
              <div className="essay-panel-actions essay-guided-nav-actions">
                <button type="button" className="essay-ghost" disabled={questionIndex === 0} onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}>이전</button>
                {!isLastQuestion && <button type="button" className="essay-primary" disabled={!currentAnswerReady} onClick={goNextQuestion}>다음</button>}
                {isLastQuestion && <button type="button" className="essay-primary" disabled={!canStartGuided} onClick={writeGuidedStep}>에세이 작성</button>}
                <button type="button" className="essay-ghost danger" onClick={resetEssay}>초기화</button>
                <button type="button" className="essay-soft" onClick={recommendGuidedAnswer}>AI 추천</button>
              </div>
            </div>
          ) : (
            <div className={`essay-ai-card ${(freeEditMode && isFree) || (guidedEditMode && isGuided) ? 'essay-edit-active-card' : ''}`}>
              {((freeEditMode && isFree) || (guidedEditMode && isGuided)) ? (
                <div className="essay-edit-mode-panel">
                  <div className="essay-edit-mode-head">
                    <span>수정하기</span>
                    <strong>에세이 본문에서 바꾸고 싶은 부분을 드래그한 뒤 수정 요청을 입력하세요.</strong>
                  </div>
                  <span className="essay-edit-section-label">드래그한 부분</span>
                  <div className={`selected-preview ${selectedText ? '' : 'empty'}`}>
                    {selectedText || '수정하고 싶은 문장이나 문단을 드래그해 주세요.'}
                  </div>
                  <span className="essay-edit-section-label">수정 요청</span>
                  <textarea
                    value={revisionRequest}
                    onChange={(event) => setRevisionRequest(event.target.value)}
                    placeholder="예: 이 부분을 더 따뜻하게 바꿔 주세요. / 문장을 조금 더 자연스럽게 다듬어 주세요."
                  />
                  <div className="essay-panel-actions essay-edit-actions">
                    <button type="button" className="essay-primary" disabled={!selectedText || !revisionRequest} onClick={applyRevision}>수정하기</button>
                    <button type="button" className="essay-ghost" onClick={() => { if (isFree) closeFreeEditMode(); if (isGuided) { setGuidedEditMode(false); setSelectedText(''); setRevisionRequest(''); } }}>닫기</button>
                  </div>
                </div>
              ) : (
                <>
                  {isGuided && hasContent ? (
                    <div className="essay-guided-after-create">
                      <h2>에세이가 작성되었어요.</h2>
                      <p>본문에서 수정하고 싶은 부분을 드래그한 뒤 수정하기 버튼을 눌러 주세요.</p>
                      <button type="button" className="essay-primary" onClick={() => { setGuidedEditMode(true); setRevisionRequest(''); }}>수정하기</button>
                      <button type="button" className="essay-soft" onClick={resetEssay}>다시 만들기</button>
                    </div>
                  ) : (
                    <>
                      <h2>{hasContent ? '다음에 이어 쓸 내용을 입력해 주세요.' : '글감이나 요청을 입력해 주세요.'}</h2>
                      <textarea
                        value={workInput}
                        onChange={(event) => setWorkInput(event.target.value)}
                        placeholder={hasContent ? '예: 그때 느꼈던 감정을 더 자세히 이어 써 주세요.' : '예: 친구와 다툰 뒤 미안한 마음이 들었던 일을 에세이로 쓰고 싶어요.'}
                      />
                      <div className={`essay-panel-actions ${isFree ? 'essay-free-action-bar' : 'vertical'}`}>
                        <button type="button" className="essay-soft" disabled={!hasText(workInput)} onClick={appendRaw}>{hasContent ? '그대로 이어붙이기' : '그대로 넣기'}</button>
                        <button type="button" className="essay-soft" disabled={!hasText(workInput)} onClick={appendPolished}>{hasContent ? 'AI가 다듬어 이어붙이기' : 'AI가 다듬어 넣기'}</button>
                        {isFree && (
                          <>
                            <button type="button" className="essay-primary" onClick={askAi}>AI에게 요청하기</button>
                            <button type="button" className="essay-ghost" disabled={!hasContent} onClick={() => { setFreeEditMode(true); setRevisionRequest(''); }}>수정하기</button>
                          </>
                        )}
                      </div>
                      {isFree && (
                        <div className="essay-free-management">
                          <button type="button" className="essay-ghost" disabled={!freeUndoSnapshot} onClick={undoFreeAction}>되돌리기</button>
                          <button type="button" className="essay-ghost" disabled={!freeRedoSnapshot} onClick={redoFreeAction}>앞으로 가기</button>
                          <button type="button" className="essay-ghost danger" onClick={resetEssay}>초기화</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {summaryMemo}

        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => goStep('step2')}>이전</button>
        <button type="button" className="essay-primary" disabled={!hasContent} onClick={() => goStep('step4')}>미리보기로 이동</button>
      </div>
    </section>
  );
}

function PreviewStep({ title, pages, activePreviewPage, setActivePreviewPage, goStep, setShowCompleteModal }) {
  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const left = pages[spreadStart];
  const right = pages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((pages.length - 1) / 2) * 2);
  return (
    <section className="essay-preview-page">
      <div className="essay-studio-top">
        <Flow active={4} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview">
          <button type="button" className="page-turn prev" disabled={spreadStart === 0} onClick={() => setActivePreviewPage(Math.max(0, spreadStart - 2))}>‹</button>
          <article className="essay-book-page left">
            {spreadStart === 0 && <h2>{title}</h2>}
            <p>{left}</p>
            <span>{spreadStart + 1}</span>
          </article>
          <article className="essay-book-page right">
            {right ? <p>{right}</p> : <p className="empty-page">다음 페이지 없음</p>}
            <span>{right ? spreadStart + 2 : ''}</span>
          </article>
          <button type="button" className="page-turn next" disabled={spreadStart >= maxStart} onClick={() => setActivePreviewPage(Math.min(maxStart, spreadStart + 2))}>›</button>
        </div>
        <aside className="essay-preview-side">
          <h2>이미지 생성</h2>
          <div className="essay-image-box">
            <strong>표지·삽화 이미지</strong>
            <p>표지나 삽화가 필요하면 현재 페이지의 분위기를 바탕으로 생성할 수 있어요.</p>
            <button type="button" className="essay-soft">표지 이미지 생성</button>
            <button type="button" className="essay-soft">현재 쪽 삽화 생성</button>
          </div>
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => goStep('step3')}>이전</button>
        <button type="button" className="essay-primary" onClick={() => setShowCompleteModal(true)}>완성하기</button>
      </div>
    </section>
  );
}

function Library({ title, content, pages, goStep }) {
  return (
    <section className="essay-step-page essay-library-page-clean">
      <div className="essay-library-card">
        <strong>{title}</strong>
        <p>{hasText(content) ? content.slice(0, 180) : '아직 작성된 에세이가 없어요.'}{content.length > 180 ? '…' : ''}</p>
        <span>{pages.length}쪽</span>
      </div>
      <div className="essay-bottom-actions">
        <button type="button" className="essay-primary" onClick={() => goStep('step3')}>작업실로 돌아가기</button>
      </div>
    </section>
  );
}

function Modal({ title, desc, cancelText, confirmText, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="confirm-modal">
        <h2>{title}</h2>
        <p>{desc}</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onCancel}>{cancelText}</button>
          <button type="button" className="primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
