import { QUESTIONS } from './essayQuestions.js';

export const MODES = [
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

export const AGE_OPTIONS = ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'];
export const TONE_OPTIONS = ['따뜻하게', '담백하게', '솔직하게', '차분하게', '밝게'];
export const THEME_OPTIONS = ['나의 하루', '가족', '친구', '꿈', '성장', '추억', '실패와 배움', '좋아하는 공간'];

export const initialSettings = {
  mode: '',
  title: '',
  authorAge: '',
  readerAge: '',
  theme: '',
  tone: '',
  length: '',
};

export const initialAnswers = QUESTIONS.reduce((acc, item) => ({ ...acc, [item.key]: '' }), {});

export const HISTORY_LIMIT = 8;
export const PAGE_LIMIT = 620;
