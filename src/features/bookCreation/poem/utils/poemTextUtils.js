const defaultAnswers = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
  requiredPhrase: '',
};

const initialPoemBody = '아직 시가 없어요.\n오른쪽에서 내용을 입력하거나 AI에게 요청해 본문을 추가해 주세요.';

export const createPoem = (order = 1) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  title: '아직 제목이 없어요',
  content: initialPoemBody,
  order,
  answers: { ...defaultAnswers },
  freeRequest: '',
  generationSource: '',
  coverReady: false,
  illustrationReady: false,
});

export function splitPoemContent(content) {
  const lines = String(content || '').split('\n');
  const pages = [];
  const maxLinesPerPage = 10;

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage).join('\n').trim());
  }

  return pages.length ? pages : [''];
}

export function createPreviewPages(poems) {
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

export function cleanAiValue(value) {
  return String(value || '').replace(/^AI 추천:\s*/u, '').trim();
}

export function getBasicRecommendation(key, settings) {
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

export function getGeneratedPoemText(settings, poem, mode, variant = 0) {
  const source = poem.answers || defaultAnswers;
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

export function getTitleIdeas(settings, poem) {
  const answers = poem?.answers || defaultAnswers;
  const isFree = settings.mode === 'free';
  const topic = settings.topic || (isFree ? '나의 시' : '꿈');
  const mood = settings.mood || '따뜻한';
  const image = cleanAiValue(answers.subject) || (isFree ? '문장' : topic);
  return [`${topic}을 담은 ${image}`, `${mood} ${topic}`, `${image}이 남은 자리`, `작은 ${topic}의 이름`];
}

export function getContentBase(content) {
  return String(content || '') === initialPoemBody ? '' : String(content || '');
}

export function joinPoemText(base, addition) {
  const cleanBase = getContentBase(base).trim();
  const cleanAddition = String(addition || '').trim();
  if (!cleanBase) return cleanAddition || initialPoemBody;
  if (!cleanAddition) return cleanBase;
  return `${cleanBase}\n\n${cleanAddition}`;
}

export function polishFreeInput(text) {
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

export function getFreeRequestedText(request, settings, variant = 0) {
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

export function getFreeContinuationText(currentContent, request, settings, variant = 0) {
  const cleanRequest = String(request || '').trim();
  const direction = cleanRequest || '현재 시의 분위기와 흐름을 이어서 다음 연을 써줘';
  const topic = settings.topic || '마음';
  const endings = variant % 2 === 0
    ? [`그래서 나는 ${topic}의 이름을`, '조금 더 다정하게 불러 보아요', '끝난 줄 알았던 문장 뒤에서', '다음 마음이 천천히 피어나요']
    : ['그 길의 끝에서 나는', '아직 남은 말을 발견해요', '작은 숨처럼 이어진 문장이', '다음 연의 문을 열어 줘요'];

  return `${direction}\n\n${endings.join('\n')}`;
}

export function getFreeRevisionText(selectedText, request) {
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


export function getAnswerRevisionText(selectedText, request) {
  const selected = String(selectedText || '').trim();
  const cleanRequest = String(request || '').trim();
  if (!selected || !cleanRequest) return '';

  if (cleanRequest.includes('간결') || cleanRequest.includes('줄여')) {
    return selected
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join('\n');
  }

  if (cleanRequest.includes('풍성') || cleanRequest.includes('늘려')) {
    return `${selected}
달빛과 바람이 그 마음을 천천히 감싸요`;
  }

  if (cleanRequest.includes('감정')) {
    return `${selected}
말하지 못한 마음이 조용히 흔들려요`;
  }

  if (cleanRequest.includes('리듬')) {
    return `${selected}
천천히 흐르고
다시 조용히 머물러요`;
  }

  if (cleanRequest.includes('자연스럽') || cleanRequest.includes('어색')) {
    return selected.replace(/\s+/g, ' ').trim();
  }

  if (cleanRequest.includes('시적') || cleanRequest.includes('비유') || cleanRequest.includes('달빛')) {
    return `${selected}
달빛 같은 마음이 조용히 번져요`;
  }

  if (cleanRequest.includes('여운')) {
    return `${selected}
그 끝에 오래 남는 여운이 머물러요`;
  }

  if (cleanRequest.includes('따뜻')) {
    return `${selected}
따뜻한 숨결처럼 마음에 닿아요`;
  }

  return `${selected}
잔잔한 물결처럼 마음에 스며요`;
}

