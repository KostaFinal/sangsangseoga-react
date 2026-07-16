import { splitTextToFitBox } from '../../../library/utils/textFitting.js';
import { TEXT_ONLY_BODY_BOX, TEXT_ONLY_TEXT_STYLE } from '../../../library/utils/mapBookPages.js';

export function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function hasText(value) {
  return String(value || '').trim().length > 0;
}

export function clean(value) {
  return String(value || '').trim();
}

export function joinText(base, addition) {
  const a = clean(base);
  const b = clean(addition);
  if (!a) return b;
  if (!b) return a;
  return `${a}\n\n${b}`;
}

export function smartTitle(settings, answers, content) {
  if (hasText(settings.title)) return settings.title.trim();
  const seed = clean(answers.experience) || clean(settings.theme) || clean(content).slice(0, 12) || '나의 에세이';
  const short = seed.replace(/[\n.?!,]/gu, ' ').split(' ').filter(Boolean).slice(0, 4).join(' ');
  return short ? `${short}에 대하여` : '나의 에세이';
}

export function polishText(text) {
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

export function makeOpeningEssay(settings, answers, variant = 0) {
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
  const note = continueNote ? `\n\n추가로 ${continueNote}에 대해서도 더 담아 보고 싶다.` : '';
  const reader = `이 글을 읽는 사람에게는 ${readerFeeling}이 남았으면 한다.`;
  return `${intro}\n\n${body}\n\n${insight}${note}\n\n${reader}`;
}


export function getGuidedSuggestion(settings, answers, questionIndex) {
  const theme = clean(settings.theme) || '내가 겪은 일';
  const tone = clean(settings.tone) || '따뜻하게';
  const suggestions = [
    `${theme}와 관련해서 아직도 기억나는 일이 있어요. 그때는 평범하게 지나간 줄 알았지만, 시간이 지나고 보니 제 마음에 오래 남은 경험이었어요.`,
    '처음에는 당황스럽고 서툴렀지만, 시간이 지날수록 고마움과 아쉬움이 함께 남았어요.',
    '지금 돌아보면 그 일은 저에게 작은 마음도 쉽게 지나치지 말아야 한다는 걸 알려 준 경험이었어요.',
    '그날의 표정, 주변의 분위기, 누군가가 건넨 짧은 말이 아직도 선명하게 기억나요.',
    '읽는 사람이 제 이야기를 통해 조용한 위로와 다시 시작할 수 있다는 마음을 느꼈으면 좋겠어요.',
    `전체적으로 ${tone} 정리되면 좋겠고, 마지막에는 그 뒤로 조금 달라진 제 마음도 자연스럽게 담겼으면 좋겠어요.`,
  ];
  return suggestions[Math.min(questionIndex, suggestions.length - 1)];
}

export function makeFreeEssay(settings, source, variant = 0) {
  const tone = settings.tone || '담백하게';
  const theme = settings.theme || '나의 이야기';
  const userSource = clean(source) || `${theme}에 대해 에세이로 쓰고 싶다.`;
  const first = variant % 2 === 0
    ? `나는 이 이야기를 오래 마음속에만 두고 있었다.`
    : `어떤 기억은 지나간 뒤에야 비로소 문장이 된다.`;
  return `${first}\n\n${polishText(userSource)}\n\n${tone} 다시 바라보면, 이 이야기는 단순한 사건이 아니라 그때의 나를 설명하는 작은 단서처럼 느껴진다. 나는 그 안에서 무엇을 붙잡고 있었는지, 또 무엇을 놓아도 되는지 천천히 생각해 보게 된다.\n\n그래서 이 글은 완벽한 결론을 향해 달려가기보다, 마음이 머물렀던 자리를 하나씩 짚어 보는 기록으로 이어진다.`;
}

export function makeContinuation(content, request, settings, variant = 0) {
  const tone = settings.tone || '따뜻하게';
  const direction = clean(request) || '지금 본문의 흐름을 자연스럽게 이어 써 주세요.';
  const next = variant % 2 === 0
    ? `그 일을 조금 더 생각해 보면, 내가 붙잡고 있었던 것은 사건 자체보다 그때의 마음이었다. ${tone} 말하자면, 나는 그 순간을 통해 내가 무엇에 흔들리고 무엇으로 다시 일어서는지 알게 되었다.`
    : `시간이 지나자 그 기억은 조금 다른 표정으로 다가왔다. 처음에는 불편하고 서툴렀던 마음도, 다시 바라보니 나를 이해하는 데 필요한 한 조각이었다.`;
  return `${direction}\n\n${next}`;
}

export function reviseSelection(selectedText, request) {
  const target = polishText(selectedText);
  const req = clean(request);
  if (!target) return '';
  if (!req) return target;
  if (/짧|간결/gu.test(req)) return target.split(/\n\n/gu).slice(0, 1).join('\n\n');
  if (/솔직|진솔/gu.test(req)) return `${target}\n\n그때의 마음을 꾸미지 않고 바라보면, 나는 사실 조금 흔들리고 있었고 그 흔들림까지도 내 이야기의 일부였다.`;
  if (/풍성|늘려/gu.test(req)) return `${target}\n\n그 순간을 조금 더 오래 들여다보면, 사건보다 마음의 결이 먼저 떠오른다. 지나간 시간 속에서 내가 붙잡고 있던 감정과 생각이 천천히 선명해진다.`;
  if (/생각|깊/gu.test(req)) return `${target}\n\n돌아보면 그 일은 단순히 지나간 경험이 아니라, 내가 무엇을 소중하게 여기고 있었는지 알려 준 작은 기준이 되었다.`;
  if (/구체|장면|자세|생생/gu.test(req)) return `${target}\n\n그 순간의 공기, 표정, 작은 소리까지 떠올리자 기억은 훨씬 선명한 장면으로 되살아났다.`;
  if (/따뜻/gu.test(req)) return `${target}\n\n그 기억은 시간이 지나도 차갑게 식지 않고, 오히려 나를 조용히 안아 주는 마음으로 남았다.`;
  if (/담백|자연|오타|어색/gu.test(req)) return target;
  return `${target}\n\n${req.replace(/해줘|바꿔줘|수정해줘/gu, '').trim()} 느낌이 자연스럽게 남도록 다듬었다.`;
}


// 에세이 본문을 리더 페이지 본문 박스(TEXT_ONLY_BODY_BOX)에 실제로 맞춰서 여러 페이지로
// 나눈다. 글자 수 어림값 대신 실제 DOM 측정으로 자르기 때문에, 글씨를 가장 크게 봐도
// 박스를 넘치지 않는다(그래서 리더는 스크롤 없이 다음 페이지로만 넘어가면 된다).
export function splitPages(content) {
  const text = clean(content);
  if (!text) return ['아직 작성된 본문이 없어요.'];
  return splitTextToFitBox(text, { ...TEXT_ONLY_BODY_BOX, ...TEXT_ONLY_TEXT_STYLE });
}

export function getDisplayTitle(settings, answers, content) {
  return smartTitle(settings, answers, content);
}
