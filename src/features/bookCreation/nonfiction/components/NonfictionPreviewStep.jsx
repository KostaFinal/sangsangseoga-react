import React from 'react';
import NonfictionLearningCard from './NonfictionLearningCard.jsx';
import { short } from '../nonfictionShared.js';
import NonfictionFlowPills from './NonfictionFlowPills.jsx';
import NonfictionPageHead from './NonfictionPageHead.jsx';
import NonfictionPreviewImage from './NonfictionPreviewImage.jsx';

export default function NonfictionPreviewStep({ bookTitle, units, activeIndex, setActiveIndex, go, openComplete }) {
  const active = units[activeIndex] || units[0];
  return (
    <section className="nf-card-page nf-card-preview-page">
      <NonfictionFlowPills active={4} />
      <NonfictionPageHead
        title="책처럼 이어지는지 확인해요"
        desc="본문, 이미지, 마무리 요소가 자연스럽게 배치되는지 마지막으로 확인해 주세요."
      />
      <div className="nf-card-preview-shell">
        <aside className="nf-card-preview-tabs">
          <strong>{bookTitle}</strong>
          {units.map((unit, index) => (
            <button type="button" key={unit.id} className={activeIndex === index ? 'active' : ''} onClick={() => setActiveIndex(index)}>
              <span>{index + 1}</span>{short(unit.title, 34)}
            </button>
          ))}
        </aside>
        <div className="nf-card-book-spread">
          <article>
            <h2>{active?.title}</h2>
            <p>{active?.pages?.[0]}</p>
            {active?.image && <NonfictionPreviewImage image={active.image} />}
          </article>
          <article>
            {active?.pages?.[1] ? <p>{active.pages[1]}</p> : <p className="nf-card-muted">다음 내용은 단원 채우기 화면에서 이어 쓸 수 있어요.</p>}
            {active?.learning && <NonfictionLearningCard learning={active.learning} />}
          </article>
        </div>
      </div>
      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step3')}>이전</button>
        <button type="button" className="nf-card-primary" onClick={openComplete}>완성하기</button>
      </div>
    </section>
  );
}
