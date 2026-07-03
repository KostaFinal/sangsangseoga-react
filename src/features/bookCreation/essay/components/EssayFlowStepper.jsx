import React from 'react';

export default function EssayFlowStepper({ active }) {
  const items = ['방식 선택', '기본 설정', '에세이 작업', '미리보기'];
  return (
    <ol className="essay-flow" aria-label="에세이 제작 단계">
      {items.map((item, index) => <li key={item} className={index + 1 === active ? 'active' : ''}>{index + 1}. {item}</li>)}
    </ol>
  );
}
