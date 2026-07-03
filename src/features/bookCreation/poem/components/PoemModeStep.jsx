import React from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import { modeCards } from '../poemShared.js';

export default function PoemModeStep({ settings, setSettings, setCurrentView }) {
  return (
    <section className="step-page">
      <PoemFlowStepper active={1} />
      <div className="mode-grid">
        {modeCards.map((mode) => (
          <button
            key={mode.key}
            className={`mode-select-card ${settings.mode === mode.key ? 'selected' : ''}`}
            onClick={() => setSettings((prev) => ({ ...prev, mode: mode.key }))}
          >
            <span className="mode-icon">{mode.icon}</span>
            <h3>{mode.title}</h3>
            <p>{mode.subtitle}</p>
            <em>{mode.recommend}</em>
            <ul>{mode.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <strong>이 방식으로 시작</strong>
          </button>
        ))}
      </div>
      <div className="bottom-actions step-one-actions">
        <button className="primary" disabled={!settings.mode} onClick={() => setCurrentView('step2')}>다음</button>
      </div>
    </section>
  );
}
