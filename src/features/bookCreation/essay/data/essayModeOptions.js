export const essayModeOptions = [
  {
    key: 'guided',
    title: '선택+답변형',
    subtitle: '질문과 선택지를 따라가며 에세이의 방향을 정해요.',
    badge: '추천',
  },
  {
    key: 'free',
    title: '자유형',
    subtitle: '내가 쓴 내용을 바탕으로 자유롭게 에세이를 시작해요.',
    badge: '자유',
  },
];

export const MODES = [
  {
    key: 'guided',
    title: '질문에 답하며 시작',
    badge: '추천',
    subtitle: '경험과 감정을 질문으로 정리한 뒤, AI가 에세이 초안을 완성해요.',
    goodFor: '쓸 이야기는 있지만 어디서부터 정리할지 막막한 사람',
    points: ['질문으로 글감을 차근차근 모아요', '답변을 바탕으로 AI가 에세이 초안을 작성해요', '완성된 글은 수정하거나 다시 만들 수 있어요'],
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
