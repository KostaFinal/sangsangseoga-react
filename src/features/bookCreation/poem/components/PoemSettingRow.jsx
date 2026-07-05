import React from "react";

export default function PoemSettingRow({
  label,
  helper,
  options,
  required = false,
  value,
  onPick,
  showAiRecommend = false,
  onAiRecommend,
  showTextInput = false,
  inputPlaceholder = "",
  onChange,
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>
          {label}
          {required && <em>필수</em>}
        </strong>
        <span>{helper}</span>
      </div>

      <div className={showAiRecommend || showTextInput ? "keyword-option-control" : ""}>
        {showTextInput && (
          <input
            type="text"
            className="poem-setting-input"
            value={value || ""}
            placeholder={inputPlaceholder}
            onChange={(event) => onChange?.(event.target.value)}
          />
        )}

        <div className="option-button-grid">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              data-long={option.length >= 6 ? "true" : undefined}
              className={value === option ? "selected" : ""}
              onClick={() => onPick(option)}
            >
              {option}
            </button>
          ))}

          {showAiRecommend && (
            <button
              type="button"
              className="ai-recommend-option"
              onClick={onAiRecommend}
            >
              AI 추천
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
