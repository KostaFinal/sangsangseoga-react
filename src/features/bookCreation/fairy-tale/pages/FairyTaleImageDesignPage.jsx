import fairyback from "../../assets/fairyback.png";
import fairybook from "../../assets/fairybook.png";
import { useFairyTaleImageDesign } from "../hooks/useFairyTaleImageDesign";

function FairyTaleImageDesignPage() {
  const {
    uploadedImages,
    styles,
    selectedStyle,
    setSelectedStyle,
    pageRows,
    isGenerating,
    generationProgress,
    generationCards,
    currentGenerationLabel,
    currentTeacherMessage,
    selectedStyleInfo,
    pageCount,
    totalImageCount,
    lockedSceneCount,
    handleSceneTextChange,
    handleSceneEditButtonClick,
    handleGenerateImages,
    getCardStatusText,
  } = useFairyTaleImageDesign();
  return (
    <div
      className="ft-image-page"
      style={{ "--image-page-bg": `url(${fairyback})` }}
    >
      <header className="ft-image-header">
        <div className="ft-image-brand">
          <div className="ft-image-brand-icon">🏰</div>
          <div>
            <strong>동화마을</strong>
          </div>
        </div>

        <nav className="ft-image-nav">
          <button type="button">내 책장</button>
          <button type="button" className="active">
            동화 만들기
          </button>
          <button type="button">템플릿</button>
          <button type="button">이용 가이드</button>
          <button type="button">요금제</button>
        </nav>

        <div className="ft-image-user">
          <button type="button" className="premium-btn">
            👑 프리미엄
          </button>
          <button type="button" className="icon-btn">
            🔔
          </button>
          <div className="profile-chip">
            <span className="avatar">🐵</span>
            <span>하늘빛 작가님</span>
            <span>⌄</span>
          </div>
        </div>
      </header>

      <main className="ft-image-layout">
        <aside className="image-summary-card">
          <div className="image-title-area">
            <div className="book-icon">
              <img src={fairybook} alt="동화책 아이콘" />
            </div>

            <div>
              <h1>동화 삽화 설계실</h1>
              <p>
                그림 스타일과 생성 범위를 확인하고,
                <br />
                페이지별 삽화 장면을 검토해요.
              </p>
            </div>
          </div>

          <section className="image-ready-card">
            <div className="ready-header">
              <span className="ready-symbol">✦</span>
              <div>
                <h2>삽화 생성 준비</h2>
                <p>표지와 페이지 이미지에 적용될 설정이에요.</p>
              </div>
            </div>

            <div className="ready-block">
              <div className="ready-block-title">
                <span>01</span>
                <div>
                  <strong>참고 이미지</strong>
                  <p>캐릭터와 분위기를 맞추기 위한 이미지예요.</p>
                </div>
              </div>

              <div className="reference-image-grid">
                {uploadedImages.map((image) => (
                  <div className="reference-thumb" key={image.id}>
                    <img src={image.src} alt={image.alt} />
                  </div>
                ))}

                <button type="button" className="reference-add-btn">
                  <strong>＋</strong>
                  <span>추가</span>
                </button>
              </div>
            </div>

            <div className="ready-block">
              <div className="ready-block-title">
                <span>02</span>
                <div>
                  <strong>그림 스타일</strong>
                  <p>선택한 스타일로 모든 이미지를 생성해요.</p>
                </div>
              </div>

              <div className="style-summary-card">
                <div className="style-summary-thumb">
                  <img
                    src={selectedStyleInfo.image}
                    alt={selectedStyleInfo.label}
                  />
                </div>

                <div>
                  <strong>{selectedStyleInfo.label}</strong>
                  <p>{selectedStyleInfo.desc}</p>
                </div>
              </div>
            </div>

            <div className="ready-block">
              <div className="ready-block-title">
                <span>03</span>
                <div>
                  <strong>생성 범위</strong>
                  <p>표지와 본문 페이지 삽화를 함께 만들어요.</p>
                </div>
              </div>

              <div className="image-count-summary">
                <div>
                  <span>표지</span>
                  <strong>1장</strong>
                </div>
                <div>
                  <span>본문</span>
                  <strong>{pageCount}페이지</strong>
                </div>
                <div>
                  <span>총 생성</span>
                  <strong>{totalImageCount}장</strong>
                </div>
              </div>
            </div>

            <div className="edit-notice-card">
              <strong>장면 문구는 생성 전 한 번만 수정할 수 있어요.</strong>
              <p>
                수정 완료된 장면은 잠기고, 전체 이미지 생성 후에는 에디터로
                이동합니다.
              </p>
            </div>

            <div className="scene-lock-progress">
              <span>수정 완료된 장면</span>
              <strong>
                {lockedSceneCount} / {pageRows.length}
              </strong>
            </div>
          </section>
        </aside>

        <section className="image-workspace-card">
          <section className="style-section">
            <h2>✦ 그림 스타일 선택</h2>

            <div className="style-grid">
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`style-card ${
                    selectedStyle === style.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className="style-image">
                    <img src={style.image} alt={style.label} />
                  </div>

                  <strong>{style.label}</strong>
                  <small>{style.desc}</small>

                  {selectedStyle === style.id && (
                    <span className="style-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="page-design-section">
            <div className="section-header-row">
              <h2>📖 표지 + 페이지별 이미지 설계</h2>
              <p>
                ⓘ 장면 수정은 한 번만 가능하며, 이미지 생성 후 입력란은
                사라집니다.
              </p>
            </div>

            <div className="page-design-table">
              {pageRows.map((row, index) => (
                <div
                  className={`page-row ${row.isLocked ? "locked-row" : ""}`}
                  key={row.page}
                >
                  <div className={`page-label ${row.color}`}>{row.page}</div>

                  <div className="page-thumb">
                    <img src={row.image} alt={`${row.page} 삽화`} />
                  </div>

                  <div className="scene-info">
                    <strong>장면</strong>
                    <p>{row.sceneTitle}</p>
                  </div>

                  <div className={`scene-edit ${row.isLocked ? "locked" : ""}`}>
                    <label>
                      장면 수정
                      {row.isLocked && (
                        <span className="locked-badge">수정 완료</span>
                      )}
                    </label>

                    {row.isEditing ? (
                      <input
                        type="text"
                        value={row.editText}
                        onChange={(e) =>
                          handleSceneTextChange(index, e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <div className="scene-edit-preview">{row.editText}</div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`edit-icon-btn ${row.isLocked ? "locked" : ""}`}
                    onClick={() => handleSceneEditButtonClick(index)}
                    disabled={row.isLocked}
                  >
                    {row.isLocked ? "✓" : row.isEditing ? "완료" : "✎"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="image-generate-footer">
            <p>ⓘ 전체 이미지 생성 후 에디터로 자동 이동됩니다.</p>

            <button
              type="button"
              className="generate-all-btn"
              onClick={handleGenerateImages}
              disabled={isGenerating}
            >
              {isGenerating ? "🪄 이미지 생성 중..." : "🪄 전체 이미지 생성"}
              <span>→</span>
            </button>
          </footer>
        </section>
      </main>

      {isGenerating && (
        <div className="generation-modal-overlay">
          <div className="generation-modal">
            <div className="generation-badge">🪄 이미지 생성 중</div>

            <h3>동화 삽화를 생성하고 있어요</h3>
            <p className="generation-subtitle">
              생성이 끝나면 에디터로 자동 이동합니다.
            </p>

            <div className="generation-teacher-box">
              <div className="generation-teacher-avatar">🐑</div>
              <div className="generation-teacher-text">
                <strong>AI 선생님</strong>
                <p>{currentTeacherMessage}</p>
              </div>
            </div>

            <div className="generation-chip-grid">
              {generationCards.map((item) => (
                <div
                  key={item.id}
                  className={`generation-chip ${item.status.toLowerCase()}`}
                >
                  <span>{item.id}</span>
                  <em>{getCardStatusText(item.status)}</em>
                </div>
              ))}
            </div>

            <div className="generation-current-row">
              <span>현재 작업</span>
              <strong>
                {generationProgress === 100
                  ? "에디터로 이동 준비 중"
                  : `${currentGenerationLabel} 삽화 생성 중`}
              </strong>
            </div>

            <div className="generation-progress-bar">
              <div
                className="generation-progress-fill"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            <div className="generation-progress-footer">
              <strong>{generationProgress}%</strong>
              <span>
                {generationProgress === 100
                  ? "삽화 생성 완료!"
                  : "생성 중에는 잠시만 기다려 주세요."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FairyTaleImageDesignPage;


