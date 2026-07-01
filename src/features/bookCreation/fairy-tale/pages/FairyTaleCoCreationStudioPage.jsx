import fairyback from "../../assets/fairyback.png";
import fairysheep from "../../assets/fairysheep.png";
import { useFairyTaleCoCreationStudio } from "../hooks/useFairyTaleCoCreationStudio";

function FairyTaleCoCreationStudioPage() {
    const {
        outlineData,
        friendOptions,
        selectedFriend,
        setSelectedFriend,
        customFriend,
        setCustomFriend,
        currentPage,
        setCurrentPage,
        isPreviewOpen,
        setIsPreviewOpen,
        previewPage,
        setPreviewPage,
        pageButtons,
        handlePrev,
        handleNextScene,
    } = useFairyTaleCoCreationStudio();
    return (
        <div
            className="ft-studio-page"
            style={{ backgroundImage: `url(${fairyback})` }}
        >
            {/* 헤더 */}
            <header className="ft-studio-header">
                <div className="ft-studio-brand">
                    <div className="ft-studio-brand-icon">🏰</div>
                    <div>
                        <strong>동화별</strong>
                        <span>이야기가 자라는 곳</span>
                    </div>
                </div>

                <nav className="ft-studio-nav">
                    <button type="button">내 책장</button>
                    <button type="button" className="active">동화 만들기</button>
                    <button type="button">템플릿</button>
                    <button type="button">이용 가이드</button>
                    <button type="button">요금제</button>
                </nav>

                <div className="ft-studio-user">
                    <button type="button" className="premium-btn">👑 프리미엄</button>
                    <button type="button" className="icon-btn">🔔</button>
                    <div className="profile-chip">
                        <span className="avatar">🐑</span>
                        <span>하늘빛 작가님</span>
                        <span>⌄</span>
                    </div>
                </div>
            </header>

            {/* 상단 타이틀 */}
            <section className="ft-studio-topbar">
                <div className="title-wrap">
                    <div className="wand-icon">🪄</div>
                    <div>
                        <h1>동화 공동창작실</h1>
                        <p>AI 선생님과 함께 이야기를 만들면 구조와 페이지가 정리돼요</p>
                    </div>
                </div>

                <div className="top-actions">
                    <button type="button" className="ghost-btn">☁️ 임시 저장</button>
                    <button type="button" className="outline-btn" onClick={() => setIsPreviewOpen(true)}>📖 동화책 미리보기</button>
                </div>
            </section>

            {/* 본문 */}
            <main className="ft-studio-layout">
                {/* 왼쪽 설계판 */}
                <aside className="story-board">
                    <h2>✨ 이야기 설계판</h2>

                    <div className="phase-list">
                        {outlineData.map((section) => (
                            <div className="phase-card" key={section.phase}>
                                <div className={`phase-badge phase-${section.phase}`}>
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
                                                {item.done ? "✔" : item.current ? "●" : "○"}
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
                        <h3>📖 페이지 구성</h3>
                        <div className="page-buttons">
                            {pageButtons.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className={page === currentPage ? "active" : ""}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 가운데 메인 */}
                <section className="creation-panel">
                    <h2>✦ AI 선생님과 이야기 만들기</h2>

                    <div className="ai-box">
                        <div className="ai-character">
                            <img src={fairysheep} alt="AI 선생님 루미" />
                        </div>
                        <div className="ai-speech">
                            <p>
                                이제 루미가
                                <br />
                                <strong>첫 친구를 만날 차례예요!</strong>
                                <br />
                                어떤 친구를 만나면 좋을까요?
                            </p>
                        </div>
                    </div>

                    <div className="question-panel">
                        <div className="step-label">STEP 4 / 10</div>
                        <h3>✦ 루미가 어떤 친구를 만날까요?</h3>

                        <div className="friend-grid">
                            {friendOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`friend-card ${option.color} ${selectedFriend === option.id ? "selected" : ""
                                        }`}
                                    onClick={() => setSelectedFriend(option.id)}
                                >
                                    <div className="friend-image">{option.img}</div>
                                    <strong>{option.title}</strong>
                                    <p>{option.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="custom-row">
                            <label htmlFor="customFriend" className="custom-label">
                                ✎ 직접 입력하기
                            </label>
                            <input
                                id="customFriend"
                                type="text"
                                maxLength={50}
                                value={customFriend}
                                onChange={(e) => setCustomFriend(e.target.value)}
                                placeholder="친구의 이름이나 특징을 자유롭게 입력해 주세요!"
                            />
                            <span className="count">{customFriend.length} / 50</span>
                        </div>
                    </div>

                    <div className="bottom-actions">
                        <button type="button" className="prev-btn" onClick={handlePrev}>
                            ← 이전 질문
                        </button>
                        <button type="button" className="next-scene-btn" onClick={handleNextScene}>
                            ✨ 다음 장면 만들기 →
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

                        <div className="book-preview-sparkle sparkle-left">✦</div>
                        <div className="book-preview-sparkle sparkle-right">✨</div>

                        <header className="book-preview-header">
                            <h2>동화책 미리보기</h2>
                            <p>완성된 동화책의 내용을 미리 확인해요</p>
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
                                        <h3>{previewPage}p. 숲에서 만난 친구</h3>

                                        <div className="book-illustration">
                                            <div className="scene-bg">
                                                <div className="scene-character sheep">🐑</div>
                                                <div className="scene-character dragon">🐉</div>
                                                <div className="scene-star">✨</div>
                                            </div>
                                        </div>

                                        <div className="book-text">
                                            <p>루미가 반짝이는 숲길을 걸어가고 있었어요.</p>
                                            <p>그때, 나뭇잎 뒤에서 작은 울음소리가 들렸어요.</p>
                                            <p>조심스럽게 다가가 보니,</p>
                                            <p>겁에 질린 작은 용이 숨어 있었지요.</p>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <button
                                type="button"
                                className="book-arrow book-arrow-right"
                                onClick={() => setPreviewPage((prev) => Math.min(10, prev + 1))}
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
                                className={previewPage === 10 ? "active" : ""}
                                onClick={() => setPreviewPage(10)}
                            >
                                10
                            </button>

                            <button
                                type="button"
                                onClick={() => setPreviewPage((prev) => Math.min(10, prev + 1))}
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
                                onClick={() => {
                                    setCurrentPage(previewPage);
                                    setIsPreviewOpen(false);
                                }}
                            >
                                ✨ 이 페이지로 보기
                            </button>
                        </div>

                        <div className="book-preview-note">
                            ✨ 미리보기는 저장되지 않아요
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FairyTaleCoCreationStudioPage;






