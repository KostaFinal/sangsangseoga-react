import fairyBg from "../../assets/fairy-bg.png";
import { useFairyTaleSettingWizard } from "../hooks/useFairyTaleSettingWizard";

function FairyTaleSettingWizardPage() {
    const {
        steps,
        seedOptions,
        currentStep,
        setCurrentStep,
        selectedSeed,
        customSeed,
        settings,
        setSettings,
        currentStepInfo,
        currentStepOptions,
        completedCount,
        progressPercent,
        handleSeedSelect,
        handleOptionSelect,
        handleCustomSeedChange,
        handleNext,
        isSeedStep,
        isChoiceStep,
        isLoadingChoiceStep,
    } = useFairyTaleSettingWizard();
    return (
        <div
            className="fairy-setup-page"
            style={{ "--fairy-bg": `url(${fairyBg})` }}
        >


            <main className="fairy-layout">
                <section className="hero-area">
                    <div className="hero-text">
                        <h1>동화 기본 설정 만들기</h1>
                    </div>

                    <div className="speech-bubble">
                        먼저
                        <br />
                        이야기 씨앗을
                        <br />
                        골라요!
                    </div>
                </section>

                <section className="question-card">
                    <div className="progress-top">
                        <span>
                            STEP {currentStep + 1} / {steps.length}
                        </span>

                        <div className="progress-dots">
                            {steps.map((step, index) => (
                                <button
                                    key={step.key}
                                    type="button"
                                    className={`dot ${index <= currentStep ? "active" : ""}`}
                                    onClick={() => setCurrentStep(index)}
                                    aria-label={step.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="question-title">
                        <span>✨</span>
                        <h2>{currentStepInfo.label} 선택</h2>
                        <span>✨</span>
                    </div>

                    <p className="question-subtitle">
                        {isSeedStep
                            ? "어떤 동화를 만들고 싶나요?"
                            : `${currentStepInfo.label}에 대해 정해볼까요?`}
                    </p>

                    {isChoiceStep ? (
                        <>
                            <div className="seed-grid">
                                {currentStepOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`seed-option ${(isSeedStep
                                            ? selectedSeed === option.id
                                            : String(settings[currentStepInfo.key]) === String(option.value || option.title)) ? "selected" : ""
                                            } ${option.id === "CUSTOM" ? "wide" : ""}`}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        <span className="seed-icon">{option.icon || option.emoji}</span>
                                        <span>{option.title}</span>
                                        {option.description && (
                                            <small>{option.description}</small>
                                        )}

                                        {(isSeedStep
                                            ? selectedSeed === option.id
                                            : String(settings[currentStepInfo.key]) === String(option.value || option.title)) && (
                                                <span className="check-mark">✓</span>
                                            )}
                                    </button>
                                ))}
                            </div>
                            {isChoiceStep && currentStepInfo.key !== "pageCount" && (
                                <label className="custom-input-area">
                                    <span>직접 입력</span>
                                    <input
                                        type="text"
                                        value={
                                            isSeedStep
                                                ? customSeed
                                                : settings[currentStepInfo.key]
                                        }
                                        onChange={(e) => {
                                            if (isSeedStep) {
                                                handleCustomSeedChange(e);
                                                return;
                                            }

                                            setSettings((prev) => ({
                                                ...prev,
                                                [currentStepInfo.key]: e.target.value,
                                            }));
                                        }}
                                        onFocus={() => {
                                            const customOption = currentStepOptions.find((option) =>
                                                String(option.id).includes("CUSTOM")
                                            );

                                            if (customOption) {
                                                handleOptionSelect(customOption);
                                            }
                                        }}
                                        placeholder={`${currentStepInfo.label}을 자유롭게 입력해 주세요!`}
                                    />
                                </label>
                            )}
                        </>
                    ) : (
                        <div className="simple-input-box">
                            <textarea
                                value={settings[currentStepInfo.key]}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        [currentStepInfo.key]: e.target.value,
                                    }))
                                }
                                placeholder={`${currentStepInfo.label}을 자유롭게 적어주세요.`}
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        className="next-btn"
                        onClick={handleNext}
                        disabled={isLoadingChoiceStep}
                    >
                        {currentStep === steps.length - 1 ? "동화 만들기 시작" : "다음 질문"}
                        <span>→</span>
                    </button>
                </section>

                <aside className="garden-card">
                    <h2>이야기 정원</h2>
                    <p>선택한 설정이 여기에 자라나요</p>

                    <div className="garden-list">
                        {steps.map((step) => {
                            const value = settings[step.key];

                            return (
                                <div
                                    key={step.key}
                                    className={`garden-item ${value ? "done" : ""}`}
                                >
                                    <span className="garden-icon">
                                        {step.key === "seed" && "🌱"}
                                        {step.key === "character" && "🐑"}
                                        {step.key === "setting" && "🏰"}
                                        {step.key === "event" && "⚡"}
                                        {step.key === "mood" && "🌈"}
                                        {step.key === "lesson" && "💛"}
                                    </span>

                                    <strong>{step.label}:</strong>
                                    <span>{value || "미정"}</span>

                                    {value && <em>✓</em>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="garden-progress">
                        <strong>
                            완성도 {completedCount} / {steps.length}
                        </strong>
                        <div className="progress-bar">
                            <span style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>

                    <div className="plant-illust">🌱✨</div>
                </aside>
            </main>

            <footer className="bottom-summary">
                <div className="summary-badge">📖</div>

                <div className="summary-text">
                    <h3>동화 설정을 차근차근 모으고 있어요!</h3>

                    <div className="summary-chips">
                        <span>📖 책 종류: 동화</span>
                        <span>👤 작가 수준: 어린이</span>
                        <span>📝 대화 방식: 선택 + 입력형</span>
                    </div>
                </div>

                <div className="summary-guide">
                    <span>🪄</span>
                    <p>
                        AI 선생님과 함께
                        <br />
                        동화의 씨앗을 키워볼까요?
                    </p>
                </div>

                <button type="button" className="big-start-btn" onClick={handleNext}>
                    AI 선생님과 계속 만들기
                    <span>→</span>
                </button>
            </footer>
        </div>
    );
}

export default FairyTaleSettingWizardPage;



