import React from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";
import EssaySettingRow from "./EssaySettingRow.jsx";
import EssayKeywordInputRow from "./EssayKeywordInputRow.jsx";
import {
  AGE_OPTIONS,
  THEME_OPTIONS,
  TONE_OPTIONS,
  hasText,
} from "../essayShared.js";

export default function EssaySettingStep({ settings, setSettings, goStep }) {
  const required = hasText(settings.authorAge);
  const isGuided = settings.mode === "guided";
  const select = (key, value, requiredField = false) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === value && !requiredField ? "" : value,
    }));
  };
  const change = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <section className="essay-step-page">
      <EssayFlowStepper active={2} />
      <div className="essay-setting-card">
        <EssaySettingRow
          title="작가 연령대"
          required
          helper="에세이를 쓰는 사람의 연령대예요."
          options={AGE_OPTIONS}
          value={settings.authorAge}
          onPick={(value) => select("authorAge", value, true)}
        />
        <EssaySettingRow
          title="독자 연령대"
          helper="읽을 사람을 정하면 문장 난이도와 설명이 맞춰져요."
          options={AGE_OPTIONS}
          value={settings.readerAge}
          onPick={(value) => select("readerAge", value)}
        />
        {isGuided && (
          <>
            <EssayKeywordInputRow
              title="주제"
              helper="직접 입력하거나 자주 쓰는 키워드를 선택할 수 있어요."
              placeholder="예: 오래된 친구와 멀어진 이야기"
              options={THEME_OPTIONS}
              value={settings.theme}
              onChange={(value) => change("theme", value)}
              onPick={(value) => select("theme", value)}
            />
            <EssayKeywordInputRow
              title="문체·분위기"
              helper="직접 입력하거나 원하는 글의 느낌을 선택할 수 있어요."
              placeholder="예: 담담하지만 따뜻하게"
              options={TONE_OPTIONS}
              value={settings.tone}
              onChange={(value) => change("tone", value)}
              onPick={(value) => select("tone", value)}
            />
          </>
        )}
      </div>
      <div className="essay-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => goStep("step1")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          disabled={!required}
          onClick={() => goStep("step3")}
        >
          작업실로 이동
        </button>
      </div>
    </section>
  );
}
