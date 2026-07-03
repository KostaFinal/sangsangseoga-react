import React from 'react';
import { hasText } from '../nonfictionShared.js';

export default function NonfictionLibraryPage({ bookTitle, units, go }) {
  const count = units.filter((unit) => hasText(unit.content)).length;
  return (
    <section className="essay-hero nf-card-placeholder">
      <div>
        <span className="essay-kicker">내 서재</span>
        <h1>{bookTitle}</h1>
        <p>작성된 단원 {count}개가 저장되었어요. 작업 화면으로 돌아가 이어서 수정할 수 있어요.</p>
        <button type="button" className="essay-primary" onClick={() => go('step3')}>작업 화면으로 돌아가기</button>
      </div>
      <div className="essay-hero-card"><strong>교육·지식 책</strong><p>단원 카드로 조립한 책입니다.</p></div>
    </section>
  );
}
