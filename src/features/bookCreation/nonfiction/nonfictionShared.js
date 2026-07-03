export const AGE_OPTIONS = ['미취학아동', '초등학교 고학년', '중·고등학생', '성인'];
export const CATEGORY_OPTIONS = ['과학', '역사', '동물·자연', '생활', '경제·금융', '직업', '환경', '예술', '기술', '사회', '문화', '건강'];
export const LEARNING_OPTIONS = [
  { key: 'summary', label: '핵심 정리', desc: '단원의 중요한 내용을 짧은 문장으로 정리해요.' },
  { key: 'terms', label: '용어 설명', desc: '본문 속 주요 낱말의 뜻을 쉽게 풀어 써요.' },
  { key: 'questions', label: '확인 질문', desc: '내용을 이해했는지 스스로 점검할 질문을 만들어요.' },
];

export const CATEGORY_TONES = {
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

export const initialSettings = {
  readerAge: '',
  category: '',
  topic: '',
  goal: '',
};

export const emptyUnit = (index = 0, title = '제목 없음') => ({
  id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${index}`,
  title,
  content: '',
  image: null,
  learning: null,
  opened: 'body',
});

export function clean(value) {
  return String(value || '').trim();
}

export function hasText(value) {
  return clean(value).length > 0;
}

export function short(text, length = 56) {
  const value = clean(text);
  if (value.length <= length) return value;
  return `${value.slice(0, length)}...`;
}

export function subjectOf(settings, fallback = '') {
  return clean(settings.topic) || clean(fallback).replace(/^\d+\.\s*/u, '') || `${settings.category || '교육·지식'} 주제`;
}

export function outlineTitles(settings) {
  const subject = subjectOf(settings, settings.category);
  const tones = CATEGORY_TONES[settings.category] || ['주제 소개', '핵심 개념', '사례로 이해하기'];
  return [
    `1. ${subject}을 왜 알아야 할까요?`,
    `2. ${tones[0]}를 차근차근 살펴봐요`,
    `3. ${tones[1]}로 더 쉽게 이해해요`,
    `4. ${tones[2]}를 통해 생각을 넓혀요`,
  ];
}

export function createBody(settings, unitTitle, extra = '') {
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

export function polishBody(content, settings) {
  const body = clean(content);
  if (!body) return body;
  const age = settings.readerAge || '독자';
  const guide = age.includes('초등') || age.includes('미취학')
    ? '조금 더 쉽게 말하면, 어려운 내용을 작은 단계로 나누고 가까운 예시와 연결하면 이해하기 좋아요.'
    : '조금 더 자연스럽게 정리하면, 개념의 의미와 실제 사례가 이어지도록 문단의 흐름을 잡는 것이 좋아요.';
  return `${body}\n\n${guide}`;
}

export function addExample(content, settings, unitTitle) {
  const subject = subjectOf(settings, unitTitle);
  const base = clean(content) || createBody(settings, unitTitle);
  return `${base}\n\n예시로 보면, ${subject}은 교실, 집, 동네처럼 익숙한 공간에서도 찾아볼 수 있어요. 독자가 알고 있는 장면에서 출발하면 새로운 개념도 덜 어렵게 느껴집니다.`;
}

export function makeLearning(settings, unit, selectedParts = LEARNING_OPTIONS.map((option) => option.key)) {
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

export function makeImage(settings, unit, request, type) {
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

export function splitPages(content) {
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
