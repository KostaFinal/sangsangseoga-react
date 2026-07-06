export const answerQuestions = [
  {
    key: 'speaker',
    label: '화자',
    question: '시의 화자를 입력해주세요.',
    placeholder: '예: 나 / 어린 시절의 나 / 그리움 속의 사람 / 자연',
    choices: ['나', '어린 시절의 나', '그리움 속의 사람', '자연'],
    optional: false,
  },
  {
    key: 'subject',
    label: '장면·사물',
    question: '시에 담을 장면이나 사물을 입력해주세요.',
    placeholder: '예: 달빛 / 비 오는 거리 / 흔들리는 꽃 / 바다',
    choices: ['달빛', '비 오는 거리', '흔들리는 꽃', '바다'],
    optional: false,
  },
  {
    key: 'firstScene',
    label: '전하고 싶은 이야기',
    question: '시에서 가장 전하고 싶은 이야기를 입력해주세요.',
    placeholder: '예: 그리움 / 위로 / 기다림 / 희망',
    choices: ['그리움', '위로', '기다림', '희망'],
    optional: false,
  },
  {
    key: 'emotionChange',
    label: '감정 흐름',
    question: '시의 감정 흐름을 입력해주세요.',
    placeholder: '예: 쓸쓸함에서 따뜻함으로 / 그리움에서 위로로 / 외로움에서 희망으로',
    choices: ['쓸쓸함에서 따뜻함으로', '그리움에서 위로로', '외로움에서 희망으로', '담담하게 머무르기'],
    optional: false,
  },
  {
    key: 'ending',
    label: '독자의 마음',
    question: '독자가 시를 읽고 느꼈으면 하는 마음을 입력해주세요.',
    placeholder: '예: 잔잔한 여운 / 조용한 위로 / 아련한 그리움 / 따뜻한 울림',
    choices: ['잔잔한 여운', '조용한 위로', '아련한 그리움', '따뜻한 울림'],
    optional: false,
  },
  {
    key: 'requiredPhrase',
    label: '포함 단어·문장',
    question: '꼭 넣고 싶은 단어나 문장을 입력해주세요.',
    placeholder: '예: 달빛 / 바람 / 괜찮아질 거야 / 아직 너를 기억해',
    choices: ['달빛', '바람', '괜찮아질 거야', '아직 너를 기억해'],
    optional: true,
  },
];

export const POEM_EDIT_DIRECTION_CHOICES = [
  { label: '더 시적으로', request: '더 시적으로 다듬어줘' },
  { label: '더 간결하게', request: '내용을 더 간결하게 줄여줘' },
  { label: '더 풍성하게', request: '이미지와 표현을 조금 더 풍성하게 늘려줘' },
  { label: '감정 더 살리기', request: '감정이 더 잘 느껴지게 수정해줘' },
  { label: '리듬감 있게', request: '시의 리듬감이 더 살아나게 다듬어줘' },
  { label: '더 자연스럽게', request: '어색한 표현을 자연스럽게 다듬어줘' },
];
