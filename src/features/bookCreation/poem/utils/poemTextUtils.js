import { splitTextToFitBox } from '../../../library/utils/textFitting.js';
import { POEM_CONTENT_BOX, POEM_TEXT_STYLE, buildPoemTitleHtml } from '../../../library/utils/mapBookPages.js';

const defaultAnswers = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
  requiredPhrase: '',
};

const initialPoemBody = '아직 시가 없어요.\n내용을 입력해주세요.';

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

// 한 줄이 targetLineLength보다 길면 단어(공백) 경계에서 줄바꿈을 넣는다. 한국어는 보통
// 어절 단위로 공백이 있어서, 그 공백에서만 끊으면 단어 중간이 잘리지 않는다.
function wrapLongLine(line, targetLineLength) {
  const tokens = line.split(/(\s+)/);
  const wrapped = [];
  let current = '';

  tokens.forEach((token) => {
    if (current.trim() && (current + token).trim().length > targetLineLength) {
      wrapped.push(current.trim());
      current = token.replace(/^\s+/, '');
    } else {
      current += token;
    }
  });
  if (current.trim()) wrapped.push(current.trim());

  return wrapped.length ? wrapped.join('\n') : line;
}

// 자유형 등에서 AI가 줄바꿈 없이 한 줄로 쭉 이어진 시를 돌려줄 때를 대비한 안전장치.
// 이미 줄이 짧게(연/행으로) 나뉘어 있으면 그대로 두고, targetLineLength를 넘는 줄만
// 공백 경계에서 자동으로 끊어 준다.
export function ensureLineBreaks(content, targetLineLength = 22) {
  const raw = String(content || '');
  if (!raw.trim()) return raw;

  return raw
    .split('\n')
    .map((line) => (line.length > targetLineLength ? wrapLongLine(line, targetLineLength) : line))
    .join('\n');
}

// 시 한 편의 본문을 리더 페이지 박스(POEM_CONTENT_BOX)에 실제로 맞춰서 여러 페이지로
// 나눈다. 첫 페이지는 제목이 같은 박스 안에 같이 들어가니 title을 넘겨서 그만큼의
// 자리를 미리 빼고 계산한다. 이렇게 나눈 조각은 리더에서(글씨를 가장 크게 봐도) 절대
// 박스를 넘치지 않아서 스크롤 없이 다음 페이지로만 넘어가면 된다.
export function splitPoemContent(content, title = '') {
  const titleHtml = buildPoemTitleHtml(title);
  return splitTextToFitBox(content, {
    ...POEM_CONTENT_BOX,
    ...POEM_TEXT_STYLE,
    titleHtml,
  });
}

export function createPreviewPages(poems) {
  const sortedPoems = [...poems].sort((a, b) => a.order - b.order);
  const pages = [];
  // 시가 한 편뿐이면 구분할 필요가 없으니 구분 페이지 자체를 안 만든다.
  // 두 편 이상이면 각 시(첫 번째 포함) 시작 전에 "제N편"만 보여주는 구분 페이지를 끼운다.
  const showDividers = sortedPoems.length > 1;

  sortedPoems.forEach((poem, poemIndex) => {
    if (showDividers) {
      pages.push({
        poemId: poem.id,
        title: `제${poemIndex + 1}편`,
        content: '',
        isDivider: true,
        isContinued: false,
        coverReady: poem.coverReady,
        illustrationReady: poem.illustrationReady,
      });
    }

    splitPoemContent(poem.content, poem.title).forEach((content, index) => {
      pages.push({
        poemId: poem.id,
        // 한 편이 여러 페이지로 나뉠 때 제목은 그 시의 첫 페이지에만 실어서, 이어지는
        // 페이지에서 제목이 반복되지 않게 한다(리더에 나갈 때랑 같은 규칙).
        title: index === 0 ? poem.title : null,
        content,
        isDivider: false,
        isContinued: index > 0,
        coverReady: poem.coverReady,
        illustrationReady: poem.illustrationReady,
      });
    });
  });

  return pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
}

export function cleanAiValue(value) {
  return String(value || '').replace(/^AI 추천:\s*/u, '').trim();
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


