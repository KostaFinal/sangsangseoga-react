import React from 'react';

export default function NonfictionFlowPills({ active }) {
  const steps = ['방향 정하기', '목차 만들기', '내용 만들기', '미리보기'];
  return (
    <ol className="nf-card-flow" aria-label="교육·지식 제작 단계">
      {steps.map((step, index) => (
        <li key={step} className={active === index + 1 ? 'active' : active > index + 1 ? 'done' : ''}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
