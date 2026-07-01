export default function InteractionModeSection({
  interactionModes,
  interactionMode,
  onSelectInteractionMode,
}) {
  return (
    <div className="setup-section">
      <h2 className="section-title">⭐ 2단계. 대화 방식 선택</h2>

      <div className="card-grid">
        {interactionModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`choice-card mode-card ${
              interactionMode === mode.id ? "selected-mode" : ""
            }`}
            onClick={() => onSelectInteractionMode(mode.id)}
          >
            <div className="card-icon-wrapper">{mode.icon}</div>
            <h3>{mode.label}</h3>
            <p>{mode.description}</p>

            {interactionMode === mode.id && (
              <div className="check-badge-pink">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
