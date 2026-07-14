import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelAuthorMeeting } from "../hooks/useNovelAuthorMeeting";

function NovelAuthorMeetingPage() {
  const {
    requiredAgenda,
    optionalAgenda,
    activeAgenda,
    answer,
    handleAnswerChange,
    minutes,
    allAgenda,
    isCompletedAgenda,
    requiredCompletedCount,
    totalCompletedCount,
    canStartWriting,
    isRecommending,
    recommendFailed,
    emptyAnswerNotice,
    currentExamples,
    isLoadingExamples,
    showExamples,
    exampleFailed,
    handleAgendaClick,
    handleAiRecommend,
    handleToggleExamples,
    handleSelectExample,
    handleNext,
    handleStartWriting,
  } = useNovelAuthorMeeting();
  return (
    <div className="author-meeting-page">
      <img
        className="author-meeting-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />

      <div className="author-meeting-overlay" />


      <main className="author-main">
        <section className="author-title-area">
          <h1>✦ 작가 회의실 ✦</h1>
          <p>AI와 함께 이야기의 핵심 설정을 하나씩 정리해봅니다.</p>
          <span>
            진행률: 필수 설정 {requiredCompletedCount} / {requiredAgenda.length} 완료
            {" · "}
            전체 {totalCompletedCount} / {allAgenda.length} 완료
          </span>
        </section>

        <section className="author-step-bar">
          <div className="author-step active">
            <span>1</span>
            <strong>기본 설정 회의</strong>
          </div>
          <em>»</em>
          <div className={canStartWriting ? "author-step done" : "author-step"}>
            <span>2</span>
            <strong>세부 연출 조정</strong>
          </div>
          <em>»</em>
          <div className={canStartWriting ? "author-step done" : "author-step"}>
            <span>3</span>
            <strong>설정 확정</strong>
          </div>
          <em>»</em>
          <div className={canStartWriting ? "author-step done" : "author-step"}>
            <span>4</span>
            <strong>집필 시작</strong>
          </div>
        </section>

        <section className="author-board">
          <aside className="agenda-panel">
            <h2>✦ 회의 안건 ✦</h2>

            <div className="agenda-group">
              <h3>✧ 필수 설정</h3>
              {requiredAgenda.map((item) => {
                const isActive = activeAgenda === item;
                const isCompleted = isCompletedAgenda(item);

                return (
                  <button
                    key={item}
                    type="button"
                    className={`${isActive ? "active" : ""} ${
                      isCompleted ? "completed" : ""
                    }`}
                    onClick={() => handleAgendaClick(item)}
                  >
                    <span />
                    {item}
                    {isActive && <em>✦</em>}
                  </button>
                );
              })}
            </div>

            <div className="agenda-group">
              <h3>✦ 선택 설정</h3>
              {optionalAgenda.map((item) => {
                const isActive = activeAgenda === item;
                const isCompleted = isCompletedAgenda(item);

                return (
                  <button
                    key={item}
                    type="button"
                    className={`${isActive ? "active" : ""} ${
                      isCompleted ? "completed" : ""
                    }`}
                    onClick={() => handleAgendaClick(item)}
                  >
                    <span />
                    {item}
                    {isActive && <em>✦</em>}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="meeting-panel">
            <h2>✦ AI 회의 진행 ✦</h2>

            <div className="meeting-card">
              <p className="meeting-question">
                현재 안건은
                <br />
                <strong>‘{activeAgenda}’</strong>입니다.
                <br />
                어떤 방향으로 정리할까요?
              </p>

              <p className="meeting-guide">
                떠오르는 장면, 사건, 인물, 분위기 중 아무거나 적어도 됩니다.
              </p>

              <textarea
                value={answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="내용을 입력하거나 AI 추천을 받아보세요."
              />

              {recommendFailed && (
                <p className="meeting-fallback-notice">
                  AI 추천을 불러오지 못했어요. 다시 시도하거나 직접 입력해 주세요.
                </p>
              )}

              {emptyAnswerNotice && (
                <p className="meeting-fallback-notice">
                  내용을 먼저 입력하거나 AI 추천을 받아보세요.
                </p>
              )}

              <div className="meeting-actions">
                <button
                  type="button"
                  className="sub-btn"
                  onClick={handleToggleExamples}
                  disabled={isLoadingExamples}
                >
                  {isLoadingExamples
                    ? "예시 불러오는 중..."
                    : showExamples
                    ? "예시 닫기"
                    : "👁 예시 보기"}
                </button>
                <button
                  type="button"
                  className="sub-btn"
                  onClick={handleAiRecommend}
                  disabled={isRecommending}
                >
                  {isRecommending ? "AI 추천 중..." : "✨ AI 추천"}
                </button>
                <button
                  type="button"
                  className="next-btn"
                  onClick={handleNext}
                  disabled={isRecommending || isLoadingExamples}
                >
                  다음 →
                </button>
              </div>

              {showExamples && (
                <div className="meeting-example-list">
                  {exampleFailed && currentExamples.length === 0 && (
                    <p className="meeting-fallback-notice">
                      예시를 불러오지 못했어요. 다시 시도해 주세요.
                    </p>
                  )}
                  {currentExamples.map((text, index) => (
                    <button
                      key={index}
                      type="button"
                      className="meeting-example-item"
                      onClick={() => handleSelectExample(text)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="minutes-panel">
            <h2>✦ 회의록 ✦</h2>

            <div className="minutes-box">
              <h3>기본 설정</h3>
              <MinuteRow label="이야기 씨앗" value={minutes.storySeed} />
              <MinuteRow label="장르" value={minutes.genre} />
              <MinuteRow label="주인공" value={minutes.protagonist} />
              <MinuteRow label="배경" value={minutes.background} />
              <MinuteRow label="갈등" value={minutes.conflict} />
              <MinuteRow label="결말 방향" value={minutes.ending} />
            </div>

            <div className="minutes-box">
              <h3>세부 연출 설정</h3>
              <MinuteRow label="분위기" value={minutes.mood} />
              <MinuteRow label="문제" value={minutes.problem} />
              <MinuteRow label="시점" value={minutes.pointOfView} />
              <MinuteRow label="분량" value={minutes.volume} />
            </div>

            <button
              type="button"
              className={`start-writing-btn ${canStartWriting ? "enabled" : ""}`}
              disabled={!canStartWriting}
              onClick={handleStartWriting}
            >
              ✒ 집필 시작
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function MinuteRow({ label, value }) {
  const isCompleted = value && value !== "미정";

  return (
    <div className={`minute-row ${isCompleted ? "completed" : ""}`}>
      <span>{label}</span>
      <strong>· {value}</strong>
    </div>
  );
}

export default NovelAuthorMeetingPage;




