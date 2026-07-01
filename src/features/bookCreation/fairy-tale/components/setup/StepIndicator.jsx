export default function StepIndicator({
  writerLevel,
  interactionMode,
  isReady,
}) {
  return (
    <div className="step-indicator">
      <span className={`step step-writer ${writerLevel ? "active" : ""}`}>
        {writerLevel ? "●" : "○"} 작가 수준
      </span>

      <span className="separator">→</span>

      <span className={`step step-mode ${interactionMode ? "active" : ""}`}>
        {interactionMode ? "●" : "○"} 대화 방식
      </span>

      <span className="separator">→</span>

      <span className={`step step-start ${isReady ? "active" : ""}`}>
        {isReady ? "●" : "○"} 시작하기
      </span>
    </div>
  );
}
