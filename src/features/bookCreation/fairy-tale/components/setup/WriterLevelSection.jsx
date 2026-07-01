export default function WriterLevelSection({
  writerLevels,
  writerLevel,
  onSelectWriterLevel,
}) {
  return (
    <div className="setup-section">
      <h2 className="section-title">⭐ 1단계. 글쓰기 단계 선택</h2>

      <div className="level-grid">
        {writerLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`level-card ${writerLevel === level.id ? "selected" : ""}`}
            onClick={() => onSelectWriterLevel(level.id)}
          >
            <div className="level-icon">{level.icon}</div>
            <div className="level-text">
              <h3>{level.label}</h3>
              <p>{level.description}</p>
            </div>

            {writerLevel === level.id && <div className="check-badge">✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
