import React from 'react';
import ModeSelectSection from '../../components/ModeSelectSection.jsx';
import EssayFlowStepper from './EssayFlowStepper.jsx';
import EssayBasicSettingSection, { isEssayBasicSettingReady } from './EssayBasicSettingSection.jsx';
import { essayModeOptions } from '../data/essayModeOptions.js';
import { useRequireAuth } from '../../../../shared/hooks/useRequireAuth.js';

export default function EssaySetupStep({ settings, setSettings, goStep, selectEssayMode }) {
  const requireAuth = useRequireAuth();
  const canGoWork = settings.mode && isEssayBasicSettingReady(settings);

  const selectMode = (mode) => {
    selectEssayMode(mode);
  };

  return (
    <section className="essay-step-page">
      <EssayFlowStepper active={1} />

      <ModeSelectSection
        options={essayModeOptions}
        selectedMode={settings.mode}
        onSelectMode={selectMode}
        wrapperClassName="essay-mode-grid two-mode-grid"
        buttonClassName="essay-mode-card"
      />

      {settings.mode && (
        <EssayBasicSettingSection settings={settings} setSettings={setSettings} />
      )}

      <div className="essay-bottom-actions">
        <button
          type="button"
          className="essay-primary"
          disabled={!canGoWork}
          onClick={() => { if (!requireAuth()) return; goStep('step2'); }}
        >
          작업실로 이동
        </button>
      </div>
    </section>
  );
}
