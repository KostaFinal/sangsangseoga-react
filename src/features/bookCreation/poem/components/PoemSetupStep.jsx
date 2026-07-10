import React from 'react';
import ModeSelectSection from '../../components/ModeSelectSection.jsx';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import PoemBasicSettingSection, { isPoemBasicSettingReady } from './PoemBasicSettingSection.jsx';
import { poemModeOptions } from '../data/poemModeOptions.js';
import { useRequireAuth } from '../../../../shared/hooks/useRequireAuth.js';

export default function PoemSetupStep({ settings, setSettings, setCurrentView }) {
  const requireAuth = useRequireAuth();
  const canGoWork = isPoemBasicSettingReady(settings);

  const selectMode = (mode) => {
    setSettings((prev) => ({
      ...prev,
      mode,
    }));
  };

  return (
    <section className="step-page compact-page">
      <PoemFlowStepper active={1} />

      <ModeSelectSection
        options={poemModeOptions}
        selectedMode={settings.mode}
        onSelectMode={selectMode}
        wrapperClassName="mode-grid two-mode-grid"
        buttonClassName="mode-select-card"
      />

      {settings.mode && (
        <PoemBasicSettingSection settings={settings} setSettings={setSettings} />
      )}

      <div className="bottom-actions">
        <button
          type="button"
          className="primary"
          disabled={!canGoWork}
          onClick={() => { if (!requireAuth()) return; setCurrentView('step2'); }}
        >
          작업실로 이동
        </button>
      </div>
    </section>
  );
}
