export const choiceQuestions = [
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

export const answerQuestions = [
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
