import React from 'react';

export default function EssaySettingRow({ title, required = false, helper, options, value, onPick }) {
  return (
    <div className="essay-option-row">
      <div>
        <strong>{title}{required && <em>필수</em>}</strong>
        <small>{helper}</small>
      </div>
      <div className="essay-chip-grid">
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}
