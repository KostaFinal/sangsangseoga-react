import React from 'react';

export default function PoemFlowStepper({ active }) {
  const steps = ['방식 및 기본 설정', '시 만들기', '미리보기'];
  return (
    <ol className="essay-flow poem-flow" aria-label="시 제작 단계">
      {steps.map((step, index) => (
        <li key={step} className={index + 1 === active ? 'active' : ''}>
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  );
}
