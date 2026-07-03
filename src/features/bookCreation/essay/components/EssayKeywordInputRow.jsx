import React from 'react';

export default function EssayKeywordInputRow({ title, helper, placeholder, options, value, onChange, onPick }) {
  return (
    <div className="essay-option-row essay-keyword-row">
      <div>
        <strong>{title}</strong>
        <small>{helper}</small>
      </div>
      <div className="essay-keyword-control">
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        <div className="essay-chip-grid">
          {options.map((option) => (
            <button type="button" key={option} className={value === option ? 'selected' : ''} onClick={() => onPick(option)}>{option}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
