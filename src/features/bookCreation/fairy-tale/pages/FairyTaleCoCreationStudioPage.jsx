import fairyback from "../../assets/fairyback.png";
import fairysheep from "../../assets/fairysheep.png";
import { useFairyTaleCoCreationStudio } from "../hooks/useFairyTaleCoCreationStudio";

function FairyTaleCoCreationStudioPage() {
    const {
        outlineData,
        choices,
        choiceQuestion,
        choiceGuide,
        selectedChoiceId,
        setSelectedChoiceId,
        customAnswer,
        setCustomAnswer,
        allowCustomAnswer,
        currentPage,
        pageCount,
        pageButtons,
        isLoadingChoiceStep,
        isGeneratingPlan,
        planLoadingHint,
        isRecommendingAgain,
        isTranslatingAnswer,
        canCreateNextScene,
        showFallbackNotice,
        showNoOptionsNotice,
        handleNextScene,
        handleRecommendAgain,
    } = useFairyTaleCoCreationStudio();

    return (
        <div
            className="ft-studio-page"
            style={{ backgroundImage: `url(${fairyback})` }}
        >
            <section className="ft-studio-topbar">
                <div className="title-wrap">
                    <div className="wand-icon">🪄</div>
                    <div>
                        <h1>동화 공동창작실</h1>
                        <p>AI 선생님과 함께 이야기를 만들면 구조와 페이지가 정리돼요</p>
                    </div>
                </div>
            </section>

            <main className="ft-studio-layout">
                <aside className="story-board">
                    <h2>이야기 설계도</h2>

                    <div className="phase-list">
                        {outlineData.map((section) => (
                            <div className="phase-card" key={section.phase}>
                                <div className={`phase-badge phase-${section.className}`}>
                                    <strong>{section.phase}</strong>
                                    <span>{section.icon}</span>
                                </div>

                                <div className="phase-items">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.page}
                                            className={`phase-item ${item.done ? "done" : ""} ${
                                                item.current ? "current" : ""
                                            } ${item.locked ? "locked" : ""}`}
                                        >
                                            <span className="marker">
                                                {item.done ? "✓" : item.current ? "●" : "○"}
                                            </span>
                                            <span className="page-label">{item.page}p</span>
                                            <span className="item-text">{item.text}</span>
                                            {item.current && <em>현재</em>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="page-nav-box">
                        <h3>📖 페이지 진행</h3>
                        <div className="page-buttons">
                            {pageButtons.map((item) => (
                                <button
                                    key={item.page}
                                    type="button"
                                    className={`${item.current ? "active" : ""} ${
                                        item.done ? "done" : ""
                                    } ${item.future ? "future" : ""}`}
                                    disabled={item.disabled}
                                    aria-current={item.current ? "step" : undefined}
                                >
                                    {item.page}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <section className="creation-panel">
                    <h2>AI 선생님과 이야기 만들기</h2>

                    <div className="ai-box">
                        <div className="ai-character">
                            <img src={fairysheep} alt="AI 선생님 루미" />
                        </div>

                        <div className="ai-speech">
                            <p>
                                이제 다음 장면을
                                <br />
                                <strong>함께 정해볼 차례예요!</strong>
                                <br />
                                {choiceQuestion}
                            </p>
                        </div>
                    </div>

                    <div className="question-panel">
                        <div className="step-label">
                            STEP {currentPage} / {pageCount}
                        </div>

                        <h3>✨ {choiceQuestion}</h3>
                        {choiceGuide && <p>{choiceGuide}</p>}

                        {isGeneratingPlan && (
                            <p style={{ fontWeight: 800, color: "#6d4dfc" }}>
                                🤖 {planLoadingHint || "AI가 이야기 설계를 만드는 중..."}
                            </p>
                        )}

                        {!isGeneratingPlan && isRecommendingAgain && (
                            <p style={{ fontWeight: 800, color: "#6d4dfc" }}>
                                🤖 AI가 다시 추천하는 중...
                            </p>
                        )}

                        {!isLoadingChoiceStep && showFallbackNotice && (
                            <p style={{ fontWeight: 700, color: "#a97c1f" }}>
                                AI 추천을 불러오지 못해 기본 선택지를 보여드려요.
                            </p>
                        )}

                        {showNoOptionsNotice && (
                            <p style={{ fontWeight: 700, color: "#a97c1f" }}>
                                AI가 선택지를 제공하지 않았습니다. 직접 입력해 주세요.
                            </p>
                        )}

                        <div className="friend-grid">
                            {choices.map((choice, index) => (
                                <button
                                    key={choice.id}
                                    type="button"
                                    className={`friend-card ${choice.color} ${
                                        selectedChoiceId === choice.id ? "selected" : ""
                                    }`}
                                    onClick={() => setSelectedChoiceId(choice.id)}
                                    disabled={isLoadingChoiceStep}
                                >
                                    <div className="friend-image choice-number-badge">
                                        {index + 1}
                                    </div>
                                    <strong>{choice.title}</strong>
                                    <p>{choice.desc}</p>
                                </button>
                            ))}
                        </div>

                        {allowCustomAnswer && (
                            <div className="custom-row">
                                <label htmlFor="customFriend" className="custom-label">
                                    직접 입력하기
                                </label>

                                <input
                                    id="customFriend"
                                    type="text"
                                    maxLength={50}
                                    value={customAnswer}
                                    onChange={(e) => setCustomAnswer(e.target.value)}
                                    placeholder="선택지 대신 직접 떠오른 내용을 입력해 주세요"
                                />

                                <span className="count">{customAnswer.length} / 50</span>
                            </div>
                        )}
                    </div>

                    <div className="bottom-actions" style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="button"
                            className="next-scene-btn"
                            style={{ background: "#ede6ff", color: "#6d4dfc" }}
                            onClick={handleRecommendAgain}
                            disabled={isLoadingChoiceStep}
                        >
                            {isRecommendingAgain ? "다시 추천하는 중..." : "↻ 다시 추천"}
                        </button>

                        <button
                            type="button"
                            className="next-scene-btn"
                            onClick={handleNextScene}
                            disabled={!canCreateNextScene}
                        >
                            {isTranslatingAnswer
                                ? "번역하는 중..."
                                : isLoadingChoiceStep
                                ? "장면 만드는 중..."
                                : "다음 장면 만들기"}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default FairyTaleCoCreationStudioPage;