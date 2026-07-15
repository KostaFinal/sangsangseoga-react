import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelCoverSelect } from "../hooks/useNovelCoverSelect";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

// 이전 단계(연출 회의)에서 건너뛴 값은 "미정" 문자열 그대로 넘어오므로, 표지 화면 자체 기본값
// (판타지/몽환적/문학적 등)으로 대신 보여주려면 "미정"도 "값 없음"으로 취급해야 한다.
const isSet = (value) => Boolean(value) && value !== "미정";

function NovelCoverSelectPage() {
  const {
    coverOptions,
    data,
    navigate,
    setting,
    selectedCoverId,
    setSelectedCoverId,
    selectedCover,
    title,
    setTitle,
    isLoadingConcepts,
    conceptFallbackNotice,
    handleRegenerateConcepts,
    handleConfirmCover,
    handleRegenerate,
    isGeneratingCover,
    generatedCoverImageUrl,
    coverGenerationError,
    isPublishing,
    publishError,
  } = useNovelCoverSelect();
  return (
    <div className="novel-cover-page">
      <img
        className="novel-cover-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-cover-overlay" />


      <main className="novel-cover-main">
        <section className="cover-title-area">
          <h1>✦ 소설 표지 선택 ✦</h1>
          <p>마지막으로 작품에 어울리는 표지를 골라주세요.</p>
        </section>

        <section className="cover-step-bar">
          <div className="cover-step done">
            <span>✓</span>
            <strong>기본 설정 회의</strong>
          </div>

          <em />

          <div className="cover-step done">
            <span>✓</span>
            <strong>AI 연출 회의</strong>
          </div>

          <em />

          <div className="cover-step done">
            <span>✓</span>
            <strong>집필 에디터</strong>
          </div>

          <em />

          <div className="cover-step active">
            <span>4</span>
            <strong>표지 선택</strong>
          </div>
        </section>

        <section className="cover-layout">
          <aside className="cover-info-panel">
            <h2>✦ 표지 정보 ✦</h2>

            <div className="cover-info-box">
              <div className="cover-info-row">
                <span>작품 제목</span>
                <input
                  type="text"
                  className="cover-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                  placeholder="제목을 입력하세요"
                />
              </div>
              <InfoRow label="장르" value={setting.genre} />
              <InfoRow label="주인공" value={setting.protagonist} />
              <InfoRow label="배경" value={setting.background} />
            </div>

            <div className="keyword-box">
              <h3>톤 & 키워드</h3>

              <div className="keyword-list">
                <span>{isSet(setting.genre) ? setting.genre : "판타지"}</span>
                <span>{isSet(setting.directing?.mood) ? setting.directing.mood : "몽환적"}</span>
                <span>{isSet(setting.directing?.style) ? setting.directing.style : "문학적"}</span>
              </div>
            </div>

            <div className="intro-box">
              <h3>작품 한줄 소개</h3>
              <p>
                {isSet(setting.protagonist) ? setting.protagonist.split(",")[0] : "주인공"}
                이 운명을 넘어, 세계의 진실을 마주하는 이야기.
              </p>
            </div>

            <div className="cover-ai-note">
              <span>✦</span>
              <p>
                AI가 작품의 분위기와 키워드를 분석하여 어울리는 표지를
                추천했습니다.
              </p>
            </div>
          </aside>

          <section className="selected-cover-panel">
            <h2>선택된 표지 미리보기</h2>

            <div className="cover-book-preview-wrap">
              {generatedCoverImageUrl ? (
                <div className="cover-book-preview cover-generated-wrap">
                  <img
                    className="cover-generated-image"
                    src={generatedCoverImageUrl}
                    alt="AI로 생성된 표지 이미지"
                  />
                  <div className="cover-generated-title-overlay">
                    <h3>{title}</h3>
                  </div>
                </div>
              ) : (
                <div className={`cover-book-preview ${selectedCover.themeClass}`}>
                  <div className="book-spine" />
                  <div className="book-front">
                    <div className="cover-ornament top">✦</div>
                    <h3>{title}</h3>
                    <p>{setting.genre || "소설"}</p>
                    <div className="cover-character">
                      <span />
                    </div>
                    <small>당신의 작품</small>
                    <div className="cover-ornament bottom">✦</div>
                  </div>
                </div>
              )}

              <div className="selected-badge">
                {generatedCoverImageUrl ? "AI 생성됨" : "선택됨"} <span>✓</span>
              </div>
            </div>

            {isGeneratingCover && <p className="cover-guide-text">🪄 AI 표지 이미지를 생성하고 있어요...</p>}
            {coverGenerationError && (
              <p className="cover-guide-text" style={{ color: "#d33" }}>
                {coverGenerationError}
              </p>
            )}

            <div className="cover-description">
              <strong>{selectedCover.title}</strong>
              <p>{selectedCover.description}</p>
            </div>
          </section>

          <aside className="cover-options-panel">
            <div className="cover-options-title">
              <h2>추천 표지 시안</h2>
              <button
                type="button"
                className="cover-concepts-regen-btn"
                onClick={handleRegenerateConcepts}
                disabled={isLoadingConcepts}
              >
                {isLoadingConcepts ? "AI가 생각 중..." : "↻ 다시 추천"}
              </button>
            </div>

            {conceptFallbackNotice && !isLoadingConcepts && (
              <p className="cover-fallback-notice">
                AI 추천을 불러오지 못해 기본 시안을 보여드리고 있어요.
              </p>
            )}

            <div className={`cover-option-grid ${isLoadingConcepts ? "loading" : ""}`}>
              {coverOptions.map((cover) => (
                <button
                  key={cover.id}
                  type="button"
                  className={`cover-option ${
                    selectedCoverId === cover.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCoverId(cover.id)}
                  disabled={isLoadingConcepts}
                >
                  <div className={`cover-thumbnail ${cover.themeClass}`}>
                    <h3>{title}</h3>
                    <span />
                    {selectedCoverId === cover.id && <em>✓</em>}
                  </div>

                  <strong>{cover.title}</strong>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="cover-bottom-bar">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(BOOK_CREATION_ROUTES.NOVEL.EDITOR, { state: data })}
          >
            ← 이전으로
          </button>

          <div className="cover-bottom-actions">
            <button
              type="button"
              className="regen-btn"
              onClick={handleRegenerate}
              disabled={isGeneratingCover}
            >
              {isGeneratingCover ? "🪄 생성 중..." : "⟳ AI 표지 이미지 생성"}
            </button>

            <button
              type="button"
              className="confirm-cover-btn"
              onClick={handleConfirmCover}
              disabled={isGeneratingCover || isPublishing}
            >
              {isPublishing ? "💾 저장하는 중..." : "✨ 이 표지로 확정"}
            </button>
          </div>

          {publishError && (
            <p className="cover-guide-text" style={{ color: "#d33" }}>
              {publishError}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="cover-info-row">
      <span>{label}</span>
      <strong>{value || "미정"}</strong>
    </div>
  );
}

export default NovelCoverSelectPage;
