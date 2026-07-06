import React from 'react';
import EssaySettingRow from './EssaySettingRow.jsx';
import EssayKeywordInputRow from './EssayKeywordInputRow.jsx';
import { AGE_OPTIONS, TONE_OPTIONS } from '../data/essayBasicOptions.js';
import { hasText } from '../utils/essayTextUtils.js';

export const isEssayBasicSettingReady = (settings) => hasText(settings.authorAge);

export default function EssayBasicSettingSection({ settings, setSettings }) {
  const isGuided = settings.mode === 'guided';

  const select = (key, value, requiredField = false) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === value && !requiredField ? '' : value,
    }));
  };

  const change = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="essay-setting-card">
      <EssaySettingRow
        title="작가 연령대"
        required
        helper="에세이를 쓰는 사람의 연령대예요."
        options={AGE_OPTIONS}
        value={settings.authorAge}
        onPick={(value) => select('authorAge', value, true)}
      />
      {isGuided && (
        <EssayKeywordInputRow
          title="문체·분위기"
          helper="직접 입력하거나 원하는 글의 느낌을 선택할 수 있어요."
          placeholder="예: 담담하지만 따뜻하게"
          options={TONE_OPTIONS}
          value={settings.tone}
          onChange={(value) => change('tone', value)}
          onPick={(value) => select('tone', value)}
        />
      )}
    </div>
  );
}
