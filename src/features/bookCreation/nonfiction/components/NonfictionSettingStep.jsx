import React from 'react';
import NonfictionFlowPills from './NonfictionFlowPills.jsx';
import NonfictionChoiceGroup from './NonfictionChoiceGroup.jsx';
import { AGE_OPTIONS, CATEGORY_OPTIONS } from '../nonfictionShared.js';

export default function NonfictionSettingStep({ settings, changeSettings, isReady, go, resetAll }) {
  return (
    <section className="nf-card-page nf-card-direction">
      <NonfictionFlowPills active={1} />
      <div className="nf-card-hero-panel">
        <div className="nf-card-hero-copy">
          <h1>어떤 책을 만들까요?</h1>
          <p>읽을 사람과 분야만 먼저 정해 주세요. 다음 단계에서 AI가 책의 흐름을 카드로 제안해요.</p>
        </div>
        <div className="nf-card-start-card">
          <NonfictionChoiceGroup title="독자 나이대" required value={settings.readerAge} options={AGE_OPTIONS} onPick={(value) => changeSettings('readerAge', value)} />
          <NonfictionChoiceGroup title="세부 장르" required value={settings.category} options={CATEGORY_OPTIONS} onPick={(value) => changeSettings('category', value)} />
          <label className="nf-card-field">
            <span>다루고 싶은 주제 <em>선택</em></span>
            <input value={settings.topic} onChange={(event) => changeSettings('topic', event.target.value)} placeholder="예: 초등학생을 위한 생태계 이야기" />
          </label>
          <label className="nf-card-field">
            <span>책의 목표 <em>선택</em></span>
            <input value={settings.goal} onChange={(event) => changeSettings('goal', event.target.value)} placeholder="예: 먹이사슬과 생태계 균형을 이해하기" />
          </label>
          <div className="nf-card-form-actions">
            <button type="button" className="nf-card-ghost" onClick={resetAll}>초기화</button>
            <button type="button" className="nf-card-primary" disabled={!isReady} onClick={() => go('step2')}>책 만들기</button>
          </div>
        </div>
      </div>
    </section>
  );
}
