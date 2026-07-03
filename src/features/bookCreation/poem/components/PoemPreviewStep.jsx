import React from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';

export default function PoemPreviewStep({ previewPages, activePreviewPage, setActivePreviewPage, updatePoemById, requestViewChange, setShowCompleteModal }) {
  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const leftPage = previewPages[spreadStart];
  const rightPage = previewPages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((previewPages.length - 1) / 2) * 2);
  const canGoPrev = spreadStart > 0;
  const canGoNext = spreadStart < maxStart;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActivePreviewPage(Math.max(0, spreadStart - 2));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActivePreviewPage(Math.min(maxStart, spreadStart + 2));
  };

  return (
    <section className="essay-preview-page poem-preview-page">
      <div className="essay-studio-top">
        <PoemFlowStepper active={4} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview poem-book-preview">
          <button type="button" className="page-turn prev" onClick={goPrev} disabled={!canGoPrev} aria-label="이전 페이지">‹</button>
          <article className="essay-book-page left poem-book-page">
            {leftPage ? (
              <>
                {!leftPage.isContinued && <h2>{leftPage.title}</h2>}
                <p>{leftPage.content}</p>
                <span>{leftPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">빈 페이지</p>
            )}
          </article>
          <article className="essay-book-page right poem-book-page">
            {rightPage ? (
              <>
                {!rightPage.isContinued && rightPage.poemId !== leftPage?.poemId && <h2>{rightPage.title}</h2>}
                <p>{rightPage.content}</p>
                <span>{rightPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">다음 페이지 없음</p>
            )}
          </article>
          <button type="button" className="page-turn next" onClick={goNext} disabled={!canGoNext} aria-label="다음 페이지">›</button>
        </div>
        <aside className="essay-preview-side poem-preview-side">
          <h2>이미지 생성</h2>
          <div className="essay-image-box">
            <strong>표지·삽화 이미지</strong>
            <p>표지나 삽화가 필요하면 현재 시의 분위기를 바탕으로 생성할 수 있어요.</p>
            <button type="button" className="essay-soft" onClick={() => leftPage && updatePoemById(leftPage.poemId, { coverReady: true })}>표지 이미지 생성</button>
            <button type="button" className="essay-soft" onClick={() => leftPage && updatePoemById(leftPage.poemId, { illustrationReady: true })}>현재 쪽 삽화 생성</button>
          </div>
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => requestViewChange('step3')}>이전</button>
        <button type="button" className="essay-primary" onClick={() => setShowCompleteModal(true)}>완성하기</button>
      </div>
    </section>
  );
}
