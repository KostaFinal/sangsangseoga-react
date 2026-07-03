import React from "react";

import fairyback from "../../assets/fairyback.png";
import {
  modeLabel,
  stepList,
  summaryLabels,
  writerLevelLabel,
} from "../data/fairyTaleChoiceBuilderOptions";
import { useFairyTaleChoiceBuilder } from "../hooks/useFairyTaleChoiceBuilder";

function FairyTaleChoiceBuilderPage() {
  const {
    currentStepIndex,
    setCurrentStepIndex,
    optionSets,
    previousData,
    currentStep,
    isLastStep,
    currentOptions,
    selectedOption,
    progressPercent,
    getSummaryValue,
    handleSelectOption,
    handleRecommendAgain,
    handlePrevStep,
    handleNextStep,
  } = useFairyTaleChoiceBuilder();
  return (
    <div
      className="choice-builder-page"
      style={{ "--choice-bg": `url(${fairyback})` }}
    >
      <header className="choice-header">
        <div className="choice-brand">
          <div className="choice-logo">🏰</div>
          <div>
            <strong>동화별</strong>
            <span>이야기가 자라는 곳</span>
          </div>
        </div>

        <nav className="choice-nav">
          <button type="button">내 책장</button>
          <button type="button" className="active">
            동화 만들기
          </button>
          <button type="button">템플릿</button>
          <button type="button">이용 가이드</button>
          <button type="button">요금제</button>
        </nav>

        <div className="choice-user">
          <button type="button" className="choice-premium">
            프리미엄
          </button>
          <button type="button" className="choice-bell">
            🔔
          </button>
          <div className="choice-profile">
            <span>🧑</span>
            <strong>하늘빛 작가님</strong>
            <em>⌄</em>
          </div>
        </div>
      </header>

      <main className="choice-main">
        <section className="choice-title-section">
          <span className="choice-kicker">CHOICE MODE</span>
          <h1>선택지만 골라도 동화가 완성돼요</h1>
          <p>
            AI 선생님이 추천한 카드 중 하나를 고르면, 동화 기본 설정이
            자동으로 정리됩니다.
          </p>
        </section>

        <section className="choice-progress-card">
          <div className="choice-progress-top">
            <strong>
              {currentStepIndex + 1} / {stepList.length}단계
            </strong>
            <span>{progressPercent}% 완료</span>
          </div>

          <div className="choice-progress-bar">
            <div
              className="choice-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="choice-step-line">
            {stepList.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  className={`choice-step-dot ${
                    index < currentStepIndex ? "done" : ""
                  } ${index === currentStepIndex ? "active" : ""}`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <span>{index < currentStepIndex ? "✓" : index + 1}</span>
                  <em>{step.label}</em>
                </button>

                {index < stepList.length - 1 && (
                  <div
                    className={`choice-step-arrow ${
                      index < currentStepIndex ? "done" : ""
                    }`}
                  >
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="choice-content-layout">
          <section className="choice-question-card">
            <div className="choice-ai-guide">
              <div className="choice-ai-avatar">🐑</div>
              <div>
                <strong>AI 선생님</strong>
                <p>
                  좋아요! 이번에는 <b>{currentStep.label}</b>을 골라볼게요.
                  마음에 드는 카드를 하나 선택해 주세요.
                </p>
              </div>
            </div>

            <div className="choice-question-head">
              <span>Q{currentStepIndex + 1}</span>
              <div>
                <h2>{currentStep.question}</h2>
                <p>{currentStep.guide}</p>
              </div>
            </div>

            <div className="choice-option-grid">
              {currentOptions.map((option) => {
                const isSelected = selectedOption?.id === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`choice-option-card ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleSelectOption(option)}
                  >
                    <div className="option-icon">{option.icon}</div>

                    <div className="option-text">
                      <strong>{option.title}</strong>
                      <p>{option.desc}</p>
                    </div>

                    {isSelected && <span className="option-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="choice-question-actions">
              <button
                type="button"
                className="choice-sub-btn"
                onClick={handlePrevStep}
              >
                ← 이전 단계
              </button>

              <button
                type="button"
                className="choice-refresh-btn"
                onClick={handleRecommendAgain}
                disabled={(optionSets[currentStep.key] || []).length <= 1}
              >
                ↻ 다시 추천
              </button>

              <button
                type="button"
                className="choice-main-btn"
                onClick={handleNextStep}
              >
                {isLastStep ? "설정 확인하기 →" : "다음 단계 →"}
              </button>
            </div>
          </section>

          <aside className="choice-summary-panel">
            <div className="summary-header">
              <span>📌</span>
              <div>
                <h2>내가 고른 설정</h2>
                <p>선택한 내용이 여기에 정리돼요.</p>
              </div>
            </div>

            <div className="summary-basic">
              <div>
                <span>제작 방식</span>
                <strong>{modeLabel.CHOICE}</strong>
              </div>
              <div>
                <span>작가 수준</span>
                <strong>
                  {writerLevelLabel[previousData.writerLevel] ||
                    previousData.writerLevel ||
                    "미정"}
                </strong>
              </div>
            </div>

            <div className="summary-list">
              {summaryLabels.map(([key, label]) => {
                const isFilled = getSummaryValue(key) !== "미정";

                return (
                  <div
                    key={key}
                    className={`summary-item ${isFilled ? "filled" : ""}`}
                  >
                    <div>
                      <span>{label}</span>
                      <strong>{getSummaryValue(key)}</strong>
                    </div>

                    <em>{isFilled ? "완료" : "미정"}</em>
                  </div>
                );
              })}
            </div>

            <div className="summary-notice">
              <strong>선택형은 빠른 제작 모드예요.</strong>
              <p>
                입력 없이 카드만 선택해도 다음 단계에서 동화 설정 확인 화면으로
                이동할 수 있어요.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default FairyTaleChoiceBuilderPage;



