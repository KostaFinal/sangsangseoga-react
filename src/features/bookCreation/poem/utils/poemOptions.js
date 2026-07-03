export const modeCards = [
  {
    key: 'choice',
    title: '선택형',
    subtitle: '준비된 선택지를 고르며 쉽게 시작',
    icon: '☑',
    recommend: '추천: 처음 쓰는 사람 · 빠르게 완성하고 싶은 사람',
    points: ['부담이 적어요', 'AI가 방향을 잡아줘요', '빠르게 시를 만들 수 있어요'],
  },
  {
    key: 'answer',
    title: '답변형(집중형)',
    subtitle: '질문에 답하며 생각을 구체화',
    icon: '💬',
    recommend: '추천: 아이디어는 있지만 정리가 어려운 사람',
    points: ['생각을 풀어내기 쉬워요', '몰입해서 만들 수 있어요', '내용이 더 구체적이에요'],
  },
  {
    key: 'free',
    title: '자유형',
    subtitle: '원하는 내용을 입력하고 필요한 만큼만 AI 도움 받기',
    icon: '✒',
    recommend: '추천: 내 문장을 살리면서 자유롭게 만들고 싶은 사람',
    points: ['질문 없이 바로 시작해요', '그대로 추가하거나 AI가 다듬어줘요', '원하는 부분만 요청할 수 있어요'],
  },
];

export const basicOptions = {
  authorAge: ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'],
  readerAge: ['미취학아동', '초등학교 저학년', '초등학교 고학년', '중·고등학생', '성인'],
  topic: ['꿈', '우정', '가족', '계절', '나', '용기', '추억', '바다'],
  style: ['자유시', '동시', '산문시'],
  length: ['짧게', '보통', '길게'],
  mood: ['따뜻함', '밝음', '차분함', '몽환적', '희망적'],
};

export const defaultSettings = {
  mode: '',
  authorAge: '',
  readerAge: '',
  topic: '',
  style: '',
  length: '',
  mood: '',
};

export const defaultSelections = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
};

export const defaultAnswers = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
  requiredPhrase: '',
};

export const initialPoemBody = '아직 시가 없어요.\n오른쪽에서 내용을 입력하거나 AI에게 요청해 본문을 추가해 주세요.';
