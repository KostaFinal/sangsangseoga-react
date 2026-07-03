import React from 'react';
import EssayFlowStepper from './EssayFlowStepper.jsx';
import { MODES, initialSettings } from '../essayShared.js';

export default function EssayModeStep({ settings, setSettings, goStep, resetEssay }) {
  return (
    <section className="essay-step-page">
      <EssayFlowStepper active={1} />
      <div className="essay-mode-grid two-mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            type="button"
            className={`essay-mode-card ${settings.mode === mode.key ? "selected" : ""}`}
            onClick={() => {
              resetEssay();
              setSettings({ ...initialSettings, mode: mode.key });
            }}
          >
            <span>{mode.badge}</span>
            <h2>{mode.title}</h2>
            <p>{mode.subtitle}</p>
            <em>{mode.goodFor}</em>
            <ul>
              {mode.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <div className="essay-bottom-actions">
        <button
          type="button"
          className="essay-primary"
          disabled={!settings.mode}
          onClick={() => goStep("step2")}
        >
          다음
        </button>
      </div>
    </section>
  );
}
