import fairyback from "../../assets/fairyback.png";
import fairysheep from "../../assets/fairysheep.png";
import { useFairyTaleCoCreationStudio } from "../hooks/useFairyTaleCoCreationStudio";

function FairyTaleCoCreationStudioPage() {
    const {
        outlineData,
        choices,
        choiceQuestion,
        selectedChoiceId,
        setSelectedChoiceId,
        customAnswer,
        setCustomAnswer,
        currentPage,
        pageCount,
        isPreviewOpen,
        setIsPreviewOpen,
        previewPage,
        setPreviewPage,
        pageButtons,
        isLoadingChoiceStep,
        canCreateNextScene,
        pagePlans,
        handleNextScene,
    } = useFairyTaleCoCreationStudio();

    const previewPlan =
        pagePlans.find((plan) => plan.pageNo === previewPage) || pagePlans[0];

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

                <div className="top-actions">
                    <button type="button" className="outline-btn" onClick={() => setIsPreviewOpen(true)}>📖 동화책 미리보기</button>
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
                                            className={`phase-item ${item.done ? "done" : ""} ${item.current ? "current" : ""}`}
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
                                    className={`${item.current ? "active" : ""} ${item.done ? "done" : ""}`}
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
                        <div className="step-label">STEP {currentPage} / {pageCount}</div>
                        <h3>✨ {choiceQuestion}</h3>

                        <div className="friend-grid">
                            {choices.map((choice, index) => (
                                <button
                                    key={choice.id}
                                    type="button"
                                    className={`friend-card ${choice.color} ${selectedChoiceId === choice.id ? "selected" : ""}`}
                                    onClick={() => setSelectedChoiceId(choice.id)}
                                >
                                    <div className="friend-image choice-number-badge">
                                        {index + 1}
                                    </div>
                                    <strong>{choice.title}</strong>
                                    <p>{choice.desc}</p>
                                </button>
                            ))}
                        </div>

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
                    </div>

                    <div className="bottom-actions">
                        <button
                            type="button"
                            className="next-scene-btn"
                            onClick={handleNextScene}
                            disabled={!canCreateNextScene}
                        >
                            {isLoadingChoiceStep ? "장면 만드는 중..." : "다음 장면 만들기"}
                        </button>
                    </div>
                </section>
            </main>

            {isPreviewOpen && (
                <div
                    className="book-preview-backdrop"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div
                        className="book-preview-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="동화책 미리보기"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="book-preview-close"
                            onClick={() => setIsPreviewOpen(false)}
                        >
                            ×
                        </button>

                        <div className="book-preview-sparkle sparkle-left">✨</div>
                        <div className="book-preview-sparkle sparkle-right">✨</div>

                        <header className="book-preview-header">
                            <h2>동화책 미리보기</h2>
                            <p>완성될 동화책의 내용을 미리 확인해요</p>
                        </header>

                        <section className="book-frame">
                            <button
                                type="button"
                                className="book-arrow book-arrow-left"
                                onClick={() => setPreviewPage((prev) => Math.max(1, prev - 1))}
                            >
                                ‹
                            </button>

                            <article className="open-book">
                                <div className="book-page left-page">
                                    <div className="book-paper">
                                        <h3>{previewPage}p. {previewPlan?.title}</h3>

                                        <div className="book-illustration">
                                            <div className="scene-bg">
                                                <div className="scene-character sheep">🐑</div>
                                                <div className="scene-character dragon">🐉</div>
                                                <div className="scene-star">✨</div>
                                            </div>
                                        </div>

                                        <div className="book-text">
                                            <p>{previewPlan?.summary || "아직 만들어지지 않은 장면이에요."}</p>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <button
                                type="button"
                                className="book-arrow book-arrow-right"
                                onClick={() => setPreviewPage((prev) => Math.min(pageButtons.length, prev + 1))}
                            >
                                ›
                            </button>
                        </section>

                        <nav className="book-page-nav">
                            <button
                                type="button"
                                onClick={() => setPreviewPage((prev) => Math.max(1, prev - 1))}
                            >
                                ‹
                            </button>

                            {[1, 2, 3, 4, 5, 6].map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className={previewPage === page ? "active" : ""}
                                    onClick={() => setPreviewPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <span>...</span>

                            <button
                                type="button"
                                className={previewPage === pageButtons.length ? "active" : ""}
                                onClick={() => setPreviewPage(pageButtons.length)}
                            >
                                {pageButtons.length}
                            </button>

                            <button
                                type="button"
                                onClick={() => setPreviewPage((prev) => Math.min(pageButtons.length, prev + 1))}
                            >
                                ›
                            </button>
                        </nav>

                        <div className="book-preview-actions">
                            <button
                                type="button"
                                className="book-preview-cancel"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                닫기
                            </button>

                            <button
                                type="button"
                                className="book-preview-select"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                확인
                            </button>
                        </div>

                        <div className="book-preview-note">
                            미리보기는 저장되지 않아요
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FairyTaleCoCreationStudioPage;
