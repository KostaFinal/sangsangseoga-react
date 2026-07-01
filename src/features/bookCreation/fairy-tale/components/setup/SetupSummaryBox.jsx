export default function SetupSummaryBox({
  isReady,
  writerLevel,
  interactionMode,
  getWriterLevelLabel,
  getInteractionModeLabel,
  onStart,
}) {
  return (
    <div className={`summary-box ${isReady ? "ready" : "not-ready"}`}>
      <div className="summary-header">
        <h3>
          {isReady
            ? "✨ 동화 만들기 준비 완료!"
            : "✨ 작가 수준과 대화 방식을 선택해 주세요"}
        </h3>
      </div>

      <div className="summary-chips">
        <span className="chip">📚 책 종류: 동화</span>
        <span className="chip">
          👤 작가 수준:{" "}
          {writerLevel ? getWriterLevelLabel(writerLevel) : "미선택"}
        </span>
        <span className="chip">
          💬 대화 방식:{" "}
          {interactionMode ? getInteractionModeLabel(interactionMode) : "미선택"}
        </span>
      </div>

      <button
        type="button"
        className="start-cta-btn"
        onClick={onStart}
        disabled={!isReady}
      >
        AI 선생님과 동화 만들기 시작 <span className="arrow">→</span>
      </button>
    </div>
  );
}
