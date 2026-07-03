import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelCoverSelect } from "../hooks/useNovelCoverSelect";
import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";

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
    handleConfirmCover,
    handleRegenerate,
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
              <InfoRow label="작품 제목" value={title} />
              <InfoRow label="장르" value={setting.genre} />
              <InfoRow label="주인공" value={setting.protagonist} />
              <InfoRow label="배경" value={setting.background} />
            </div>

            <div className="keyword-box">
              <h3>톤 & 키워드</h3>

              <div className="keyword-list">
                <span>{setting.genre || "판타지"}</span>
                <span>{setting.directing?.mood || "몽환적"}</span>
                <span>{setting.directing?.style || "문학적"}</span>
              </div>
            </div>

            <div className="intro-box">
              <h3>작품 한줄 소개</h3>
              <p>
                {setting.protagonist?.split(",")[0] || "주인공"}이 운명을
                넘어, 세계의 진실을 마주하는 이야기.
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

            <div className="book-preview-wrap">
              <div className={`book-preview ${selectedCover.themeClass}`}>
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

              <div className="selected-badge">
                선택됨 <span>✓</span>
              </div>
            </div>

            <div className="cover-description">
              <strong>{selectedCover.title}</strong>
              <p>{selectedCover.description}</p>
            </div>
          </section>

          <aside className="cover-options-panel">
            <div className="cover-options-title">
              <h2>추천 표지 시안</h2>
              <span>AI 추천 {coverOptions.length}종</span>
            </div>

            <div className="cover-option-grid">
              {coverOptions.map((cover) => (
                <button
                  key={cover.id}
                  type="button"
                  className={`cover-option ${
                    selectedCoverId === cover.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCoverId(cover.id)}
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
            <button type="button" className="regen-btn" onClick={handleRegenerate}>
              ⟳ 다시 추천받기
            </button>

            <button
              type="button"
              className="confirm-cover-btn"
              onClick={handleConfirmCover}
            >
              ✨ 이 표지로 확정
            </button>
          </div>
        </section>

        <p className="cover-guide-text">
          표지는 나중에 프로젝트 설정에서 언제든 변경할 수 있습니다.
        </p>
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
