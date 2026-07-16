import React from 'react';
import PoemSettingRow from './PoemSettingRow.jsx';
import { basicOptions } from '../data/poemBasicOptions.js';

export const getPoemBasicSettingRows = (settings) => {
  const commonRows = [
    [
      'authorAge',
      '작가 연령대',
      '시를 쓰는 사람의 연령대를 골라주세요.',
      basicOptions.authorAge,
      true,
    ],
  ];

  const guidedRows = [
    [
      'topic',
      '주제',
      '시에서 가장 중심이 되는 단어예요.',
      basicOptions.topic,
      true,
    ],
    ['style', '형식', '시의 기본 모양을 정해요.', basicOptions.style, true],
    [
      'length',
      '길이',
      '시가 어느 정도 분량이면 좋을지 정해요.',
      basicOptions.length,
      true,
    ],
    [
      'mood',
      '분위기',
      '원하는 경우 시의 온도와 색깔을 더해요.',
      basicOptions.mood,
      false,
    ],
  ];

  return settings.mode === 'free' ? commonRows : [...commonRows, ...guidedRows];
};

const hasValue = (value) => String(value || '').trim().length > 0;

export const isPoemBasicSettingReady = (settings) => {
  if (!settings.mode) return false;
  return getPoemBasicSettingRows(settings).every(
    ([key, , , , required]) => !required || hasValue(settings[key]),
  );
};

export default function PoemBasicSettingSection({ settings, setSettings }) {
  const rows = getPoemBasicSettingRows(settings);
  const isAnswerMode = settings.mode === 'answer';

  const pickOption = (key, option, required) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === option && !required ? '' : option,
    }));
  };

  return (
    <div className="basic-form-card">
      <div className="settings-group visual-settings">
        {rows.map(([key, label, helper, options, required]) => {
          const isKeywordInputTarget = ['topic', 'mood'].includes(key);

          return (
            <PoemSettingRow
              key={key}
              label={label}
              helper={helper}
              options={options}
              required={required}
              value={settings[key]}
              onPick={(option) => pickOption(key, option, required)}
              showTextInput={isAnswerMode && isKeywordInputTarget}
              inputPlaceholder={
                key === 'topic'
                  ? '예: 비 오는 날의 친구, 꿈, 가족'
                  : '예: 따뜻하고 잔잔하게'
              }
              onChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  [key]: value,
                }))
              }
            />
          );
        })}
      </div>
    </div>
  );
}
