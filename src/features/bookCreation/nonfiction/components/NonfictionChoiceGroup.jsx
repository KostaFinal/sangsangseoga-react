import React from 'react';

export default function NonfictionChoiceGroup({ title, required, value, options, onPick }) {
  return (
    <div className="nf-card-choice-group">
      <div className="nf-card-label">{title}{required && <em>필수</em>}</div>
      <div className="nf-card-chip-wrap">
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}
