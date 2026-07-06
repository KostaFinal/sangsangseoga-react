export const QUESTIONS = [
  {
    key: 'experience',
    label: '경험',
    question: '에세이에 담고 싶은 경험이나 이야기를 적어 주세요.',
    placeholder: '예: 비 오는 날 친구가 우산을 씌워준 일 / 처음 발표를 했던 날 / 가족과 늦게까지 이야기한 밤',
    choices: ['나의 성장', '관계의 변화', '잊지 못한 하루', '새로운 시작'],
    optional: false,
  },
  {
    key: 'emotion',
    label: '감정',
    question: '그때 가장 크게 남은 감정을 적어 주세요.',
    placeholder: '예: 고마움 / 부끄러움 / 뿌듯함 / 아쉬움 / 괜찮아졌다는 느낌',
    choices: ['후회', '고마움', '불안', '설렘'],
    optional: false,
  },
  {
    key: 'meaning',
    label: '생각',
    question: '그 경험을 지금 돌아보며 든 생각을 적어 주세요.',
    placeholder: '예: 작은 친절이 오래 기억된다는 것 / 실패해도 다시 시작할 수 있다는 것',
    choices: ['나를 조금 더 이해하게 됐다', '당연한 건 없다고 느꼈다', '시간이 지나야 보이는 게 있었다', '다시 해보고 싶다는 마음이 들었다'],
    optional: false,
  },
  {
    key: 'scene',
    label: '장면',
    question: '꼭 넣고 싶은 장면이나 문장을 적어 주세요.',
    placeholder: '예: 창문에 빗방울이 맺힌 장면 / 엄마가 웃으며 건넨 말 / 빈 운동장에 혼자 서 있던 순간',
    choices: ['혼자 걸어가던 길', '말하지 못한 한마디', '아직 기억나는 표정', '그날의 공기'],
    optional: false,
  },
  {
    key: 'readerFeeling',
    label: '독자의 마음',
    question: '독자가 읽고 어떤 마음을 느꼈으면 하는지 적어 주세요.',
    placeholder: '예: 조용한 위로 / 나도 해볼 수 있다는 용기 / 누군가가 떠오르는 따뜻함',
    choices: ['조용한 위로', '따뜻한 공감', '잔잔한 여운', '다시 시작할 용기'],
    optional: false,
  },
  {
    key: 'continueNote',
    label: '추가 내용',
    question: '이 에세이에 추가로 담고 싶은 내용이 있다면 적어 주세요.',
    placeholder: '예: 친구와 화해한 장면을 더 넣고 싶어요 / 그 뒤에 달라진 마음도 담고 싶어요',
    choices: ['그 후의 변화', '앞으로의 다짐', '아직 남은 마음', '전하지 못한 말'],
    optional: true,
  },
];

export const ESSAY_EDIT_DIRECTION_CHOICES = [
  { label: '더 자연스럽게', request: '어색한 표현을 자연스럽게 다듬어줘' },
  { label: '더 진솔하게', request: '감정이 더 솔직하게 느껴지도록 수정해줘' },
  { label: '더 간결하게', request: '내용을 더 간결하게 줄여줘' },
  { label: '더 풍성하게', request: '경험과 생각이 더 풍성하게 드러나도록 늘려줘' },
  { label: '생각 더 깊게', request: '돌아보며 든 생각이 더 깊게 느껴지도록 수정해줘' },
  { label: '장면 더 생생하게', request: '장면이 더 구체적이고 생생하게 느껴지도록 수정해줘' },
];
