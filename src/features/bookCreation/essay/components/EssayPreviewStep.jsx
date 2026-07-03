import React from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";

export default function EssayPreviewStep({
  title,
  pages,
  activePreviewPage,
  setActivePreviewPage,
  goStep,
  setShowCompleteModal,
}) {
  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const left = pages[spreadStart];
  const right = pages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((pages.length - 1) / 2) * 2);
  return (
    <section className="essay-preview-page">
      <div className="essay-studio-top">
        <EssayFlowStepper active={4} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview">
          <button
            type="button"
            className="page-turn prev"
            disabled={spreadStart === 0}
            onClick={() => setActivePreviewPage(Math.max(0, spreadStart - 2))}
          >
            ‹
          </button>
          <article className="essay-book-page left">
            {spreadStart === 0 && <h2>{title}</h2>}
            <p>{left}</p>
            <span>{spreadStart + 1}</span>
          </article>
          <article className="essay-book-page right">
            {right ? (
              <p>{right}</p>
            ) : (
              <p className="empty-page">다음 페이지 없음</p>
            )}
            <span>{right ? spreadStart + 2 : ""}</span>
          </article>
          <button
            type="button"
            className="page-turn next"
            disabled={spreadStart >= maxStart}
            onClick={() =>
              setActivePreviewPage(Math.min(maxStart, spreadStart + 2))
            }
          >
            ›
          </button>
        </div>
        <aside className="essay-preview-side">
          <h2>이미지 생성</h2>
          <div className="essay-image-box">
            <strong>표지·삽화 이미지</strong>
            <p>
              표지나 삽화가 필요하면 현재 페이지의 분위기를 바탕으로 생성할 수
              있어요.
            </p>
            <button type="button" className="essay-soft">
              표지 이미지 생성
            </button>
            <button type="button" className="essay-soft">
              현재 쪽 삽화 생성
            </button>
          </div>
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => goStep("step3")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          onClick={() => setShowCompleteModal(true)}
        >
          완성하기
        </button>
      </div>
    </section>
  );
}
