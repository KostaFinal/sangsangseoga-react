import fairyback from "../../assets/fairyback.png";
import { useFairyTaleChatWriting } from "../hooks/useFairyTaleChatWriting";

const FairyTaleChatWritingPage = () => {
  const {
    QUICK_ACTIONS,
    CHAT_HELP_ACTIONS,
    pageCount,
    pages,
    currentPageNo,
    requestText,
    setRequestText,
    messages,
    chatLogRef,
    currentPage,
    completedCount,
    isGeneratingPlan,
    isWorking,
    streamingPreview,
    usedFallbackNotice,
    handleWritePage,
    handleQuickAction,
    handleChatHelp,
    handleCompletePage,
    handleNextPage,
    handleSendRequest,
    handleShowSetting,
    handleGoImageDesign,
  } = useFairyTaleChatWriting();
  return (
    <div
      className="fairy-writing-page"
      style={{ "--fairy-bg": `url(${fairyback})` }}
    >
      <div className="fairy-writing-overlay" />


      <main className="writing-main">
        <section className="page-progress-bar">
          <div className="progress-summary">
            <strong>페이지 진행 바</strong>
            <span>
              {completedCount} / {pageCount}페이지 완료
            </span>
          </div>

          <div className="page-chip-list">
            {pages.map((page) => (
              <div
                key={page.pageNo}
                className={`page-chip ${page.status.toLowerCase()} ${
                  page.pageNo === currentPageNo ? "active" : ""
                }`}
              >
                <span>{page.pageNo}p</span>
                <em>
                  {page.status === "DONE"
                    ? "완료"
                    : page.status === "WRITING"
                    ? "작성 중"
                    : "대기"}
                </em>
              </div>
            ))}
          </div>
        </section>

        <section className="writing-workspace">
          <article className="current-page-board">
            <div className="board-top">
              <div>
                <p className="board-kicker">현재 페이지 작성판</p>
                <h1>{currentPageNo}페이지 작성 중</h1>
              </div>

              <span className={`page-status-badge ${currentPage.status.toLowerCase()}`}>
                {currentPage.status === "DONE"
                  ? "완료"
                  : currentPage.status === "WRITING"
                  ? "작성 중"
                  : "대기 중"}
              </span>
            </div>

            <div className="scene-card">
              <span>장면</span>
              <strong>{currentPage.sceneTitle}</strong>
              <p>{currentPage.role}</p>
            </div>

            <div className="storybook-paper">
              <div className="paper-header">
                <span>{currentPageNo}p</span>
                <strong>{currentPage.sceneTitle}</strong>
              </div>

              {isWorking && streamingPreview ? (
                <p className="page-body-text">{streamingPreview}</p>
              ) : currentPage.body ? (
                <p className="page-body-text">{currentPage.body}</p>
              ) : (
                <div className="empty-page-guide">
                  <span>✨</span>
                  <strong>아직 이 페이지의 글이 작성되지 않았어요.</strong>
                  <p>AI 선생님과 함께 이 페이지를 써볼까요?</p>
                  <button type="button" onClick={handleWritePage} disabled={isWorking}>
                    {isWorking ? "AI가 쓰는 중..." : "이 페이지 글쓰기"}
                  </button>
                </div>
              )}
            </div>

            {isGeneratingPlan && (
              <p style={{ fontWeight: 800, color: "var(--primary)" }}>
                🤖 AI가 전체 페이지 구성을 만드는 중...
              </p>
            )}

            {isWorking && currentPage.body && (
              <p style={{ fontWeight: 800, color: "var(--primary)" }}>
                🤖 AI가 실시간으로 쓰고 있어요...
              </p>
            )}

            {!isWorking && usedFallbackNotice && (
              <p style={{ fontWeight: 700, color: "#a97c1f" }}>
                AI 응답을 불러오지 못해 기본 문장으로 이어갔어요.
              </p>
            )}

            {currentPage.teacherNote && (
              <div className="teacher-note">
                <span>💡 AI 선생님의 한마디</span>
                <p>{currentPage.teacherNote}</p>
              </div>
            )}

            <div className="writing-tools">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  disabled={isWorking || !currentPage.body}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="page-main-actions">
              {currentPage.body && (
                <>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={handleWritePage}
                    disabled={isWorking}
                  >
                    AI 선생님에게 다시 도움받기
                  </button>
                  <button
                    type="button"
                    className="complete-btn"
                    onClick={handleCompletePage}
                    disabled={isWorking}
                  >
                    이 페이지 완성
                  </button>
                </>
              )}
              <button
                type="button"
                className="page-side-next-btn"
                onClick={handleNextPage}
                disabled={isWorking}
              >
                <span>다음</span>
                <span>페이지</span>
                <strong>쓰기</strong>
                <em>→</em>
              </button>
            </div>
          </article>

          <aside className="teacher-chat-panel">
            <div className="teacher-profile">
              <div className="teacher-avatar">🐑</div>
              <div>
                <strong>AI 선생님</strong>
                <p>페이지별 글쓰기를 도와드릴게요</p>
              </div>
            </div>

            <div className="teacher-suggestion">
              <strong>이번 페이지 도움말</strong>
              <p>
                {currentPageNo}페이지는 <b>{currentPage.sceneTitle}</b> 장면이에요.
                문장을 더 쉽게 하거나, 분위기를 바꾸고 싶으면 요청해 주세요.
              </p>
            </div>

            <div className="quick-help-list">
              <button type="button" onClick={handleShowSetting}>
                📋 기본설정 확인하기
              </button>

              {CHAT_HELP_ACTIONS.map((action) => (
                <button
                  key={`chat-${action.id}`}
                  type="button"
                  onClick={() => handleChatHelp(action)}
                  disabled={isWorking}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="chat-log" ref={chatLogRef}>
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`chat-message ${message.sender.toLowerCase()}`}
                >
                  <p style={{ whiteSpace: "pre-line" }}>{message.text}</p>
                </div>
              ))}
            </div>

            <form className="teacher-request-form" onSubmit={handleSendRequest}>
              <textarea
                value={requestText}
                onChange={(event) => setRequestText(event.target.value)}
                placeholder="AI 선생님에게 요청해보세요. 예: 더 귀엽게 써줘"
              />

              <button type="submit" disabled={!requestText.trim()}>
                보내기
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default FairyTaleChatWritingPage;





