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
