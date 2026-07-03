import React from 'react';
import NonfictionPageHead from './NonfictionPageHead.jsx';
import NonfictionFlowPills from './NonfictionFlowPills.jsx';

export default function NonfictionOutlineStep({ settings, bookTitle, setBookTitle, units, setUnits, createOutline, addUnit, removeUnit, setActiveIndex, go }) {
  return (
    <section className="nf-card-page nf-card-outline-page">
      <NonfictionFlowPills active={2} />
      <NonfictionPageHead
        title="책의 흐름을 카드로 잡아요"
        desc="본문을 쓰기 전에 목차 순서를 먼저 정해요. 마음에 들지 않으면 바로 고치거나 다시 만들 수 있어요."
      />
      <div className="nf-card-outline-board">
        <div className="nf-card-title-line">
          <label>
            <span>책 제목</span>
            <input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} />
          </label>
          <button type="button" className="nf-card-primary" onClick={createOutline}>AI 목차 만들기</button>
        </div>
        <div className="nf-card-outline-cards">
          {units.map((unit, index) => (
            <article key={unit.id} className="nf-card-outline-card">
              <div className="nf-card-number">{index + 1}</div>
              <textarea value={unit.title} onChange={(event) => setUnits((prev) => prev.map((item, idx) => idx === index ? { ...item, title: event.target.value } : item))} />
              <button type="button" disabled={units.length <= 1} onClick={() => removeUnit(index)} aria-label="단원 삭제">−</button>
            </article>
          ))}
          <button type="button" className="nf-card-add-unit" onClick={addUnit}>+ 목차 추가</button>
        </div>
      </div>
      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step1')}>이전</button>
        <button type="button" className="nf-card-primary" onClick={() => { setActiveIndex(0); go('step3'); }}>작성하기</button>
      </div>
    </section>
  );
}
