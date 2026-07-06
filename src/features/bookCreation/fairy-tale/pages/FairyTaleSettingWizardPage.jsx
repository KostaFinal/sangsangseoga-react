import fairyBg from "../../assets/fairy-bg.png";
import { useFairyTaleSettingWizard } from "../hooks/useFairyTaleSettingWizard";

function FairyTaleSettingWizardPage() {
    const {
        steps,
        currentStep,
        setCurrentStep,
        customSeed,
        settings,
        setSettings,
        currentStepInfo,
        currentStepOptions,
        completedCount,
        progressPercent,
        handleOptionSelect,
        handleCustomSeedChange,
        handleNext,
        isSeedStep,
        isChoiceStep,
        isLoadingChoiceStep,
        showFallbackNotice,
        loadingHint,
    } = useFairyTaleSettingWizard();
    const isSelectedOption = (option) => {
        const stepKey = currentStepInfo.key;
        const currentValue = settings[stepKey];

        if (stepKey === "pageCount") {
            return currentValue === option.value;
        }

        return currentValue === option.title;
    };  
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
                        {currentStepInfo.question ||
                            (isSeedStep
                                ? "어떤 동화를 만들고 싶나요?"
                                : `${currentStepInfo.label}에 대해 정해볼까요?`)}
                    </p>

                    {isLoadingChoiceStep && (
                        <p style={{ textAlign: "center", color: "var(--text-sub)", fontWeight: 800, marginBottom: "12px" }}>
                            🤖 {loadingHint || "AI가 선택지를 만드는 중..."}
                        </p>
                    )}

                    {!isLoadingChoiceStep && showFallbackNotice && (
                        <p style={{ textAlign: "center", color: "var(--text-sub)", fontWeight: 700, marginBottom: "12px" }}>
                            AI 추천을 불러오지 못해 기본 선택지를 보여드려요.
                        </p>
                    )}

                    {isChoiceStep ? (
                        <>
                            <div className="seed-grid">
                                {currentStepOptions.map((option) => {
                                    const isPageCountStep = currentStepInfo.key === "pageCount";

                                    return (
                                        <button
                                        key={option.id}
                                        type="button"
                                        className={`seed-option ${
                                            isPageCountStep ? "page-count-option" : ""
                                        } ${isSelectedOption(option) ? "selected" : ""}`}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={isLoadingChoiceStep}
                                        >
                                        {isPageCountStep ? (
                                            <>
                                            <span className="option-icon">{option.icon}</span>

                                            <div className="page-count-option-body">
                                                <strong className="option-page-count">
                                                {option.value}쪽
                                                </strong>
                                                <p className="page-count-description">
                                                {option.description}
                                                </p>
                                            </div>
                                            </>
                                        ) : (
                                            <>
                                            <span className="option-icon">{option.icon}</span>
                                            <strong>{option.title}</strong>
                                            <p>{option.description}</p>
                                            </>
                                        )}
                                        </button>
                                    );
                                })}
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
                                        {step.key === "pageCount" && "📖"}
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

                <button
                    type="button"
                    className="big-start-btn"
                    onClick={handleNext}
                    disabled={isLoadingChoiceStep}
                >
                    AI 선생님과 계속 만들기
                    <span>→</span>
                </button>
            </footer>
        </div>
    );
}

export default FairyTaleSettingWizardPage;



