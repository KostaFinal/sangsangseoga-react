import React from 'react';

const defaultOptions = [
  {
    key: 'guided',
    title: '선택+답변형',
    subtitle: '질문과 선택지를 따라가며 글감을 정리해요.',
    badge: '추천',
  },
  {
    key: 'free',
    title: '자유형',
    subtitle: '내가 쓴 내용을 바탕으로 자유롭게 시작해요.',
    badge: '자유',
  },
];

export default function ModeSelectSection({
  options = defaultOptions,
  selectedMode,
  onSelectMode,
  wrapperClassName = 'essay-mode-grid two-mode-grid',
  buttonClassName = 'essay-mode-card',
}) {
  return (
    <div className={wrapperClassName}>
      {options.map((mode) => (
        <button
          key={mode.key}
          type="button"
          className={`${buttonClassName} ${selectedMode === mode.key ? 'selected' : ''}`}
          onClick={() => onSelectMode(mode.key)}
        >
          {/* {mode.badge && <span>{mode.badge}</span>} */}
          <h2>{mode.title}</h2>
          <p>{mode.subtitle}</p>
        </button>
      ))}
    </div>
  );
}
