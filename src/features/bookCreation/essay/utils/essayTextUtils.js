import { PAGE_LIMIT } from './essayOptions.js';
import { QUESTIONS } from './essayQuestions.js';

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
  const note = continueNote ? `\n\n앞으로 이어 쓴다면 ${continueNote}에 대해서도 더 천천히 적어 보고 싶다.` : '';
  const reader = `이 글을 읽는 사람에게는 ${readerFeeling}이 남았으면 한다.`;
  return `${intro}\n\n${body}\n\n${insight}${note}\n\n${reader}`;
}


export function makeGuidedParagraph(settings, answers, stepIndex, variant = 0) {
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

export function applyGuidedContinueNote(baseContent, continueNote, settings) {
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

export function makeGuidedEssayThrough(settings, answers, throughIndex, variant = 0) {
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

export function getGuidedSuggestion(settings, answers, questionIndex) {
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
  if (/구체|장면|자세/gu.test(req)) return `${target}\n\n그 순간의 공기, 표정, 작은 소리까지 떠올리자 기억은 훨씬 선명한 장면으로 되살아났다.`;
  if (/따뜻/gu.test(req)) return `${target}\n\n그 기억은 시간이 지나도 차갑게 식지 않고, 오히려 나를 조용히 안아 주는 마음으로 남았다.`;
  if (/담백|자연|오타|어색/gu.test(req)) return target;
  return `${target}\n\n${req.replace(/해줘|바꿔줘|수정해줘/gu, '').trim()} 느낌이 자연스럽게 남도록 다듬었다.`;
}

export function splitPages(content) {
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

export function getDisplayTitle(settings, answers, content) {
  return smartTitle(settings, answers, content);
}
