import fairysheep from "../../assets/fairysheep.png";
import { useFairyTaleBookEditor } from "../hooks/useFairyTaleBookEditor";

function FairyTaleBookEditorPage() {
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    viewMode,
    setViewMode,
    zoom,
    rightPanelMode,
    setRightPanelMode,
    saveStatus,
    savedAt,
    selectedSentence,
    setSelectedSentence,
    aiSuggestion,
    setAiSuggestion,
    directRequest,
    setDirectRequest,
    isPreviewOpen,
    setIsPreviewOpen,
    previewIndex,
    setPreviewIndex,
    completionErrors,
    setCompletionErrors,
    currentPage,
    currentIndex,
    currentPageSetting,
    handlePrevPage,
    handleNextPage,
    handleZoomOut,
    handleZoomIn,
    handleFitScreen,
    handleTextSelect,
    handleRewrite,
    handleDirectRequest,
    handleApplySuggestion,
    handleRegenerateCurrentImage,
    handleUploadCurrentImage,
    handleRestorePreviousImage,
    handleOpenPreview,
    handleComplete,
    saveStatusText,
    previewPage,
    updateCurrentPage,
    updateCurrentPageSettings,
  } = useFairyTaleBookEditor();
  return (
    <div className="book-editor-page">
      <header className="book-editor-header">
        <div className="editor-brand">
          <div className="editor-avatar">
            <img src={fairysheep} alt="루미" />
          </div>
          <strong>동화책 에디터</strong>
        </div>

        <div className={`editor-save-status ${saveStatus}`}>
          <span>☁️ {saveStatusText}</span>
          <span>{savedAt}</span>
        </div>

        <div className="editor-header-actions">
          <button type="button" className="icon-action" onClick={handlePrevPage}>
            ↶
          </button>

          <button
            type="button"
            className={`icon-action ${
              currentIndex >= pages.length - 1 ? "disabled" : ""
            }`}
            onClick={handleNextPage}
            disabled={currentIndex >= pages.length - 1}
          >
            ↷
          </button>

          <button
            type="button"
            className="preview-action"
            onClick={handleOpenPreview}
          >
            👁 전체 미리보기
          </button>

          <button
            type="button"
            className="complete-action"
            onClick={handleComplete}
          >
            ✓ 완성하기
          </button>
        </div>
      </header>

      <main className="book-editor-layout">
        <aside className="page-sidebar">
          <div className="sidebar-title-row">
            <h2>페이지</h2>
            <span className="page-count-label">{pages.length}쪽</span>
          </div>

          <div className="page-list">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`page-list-item ${
                  page.id === currentPageId ? "active" : ""
                }`}
                onClick={() => {
                  setCurrentPageId(page.id);
                  setSelectedSentence("");
                  setAiSuggestion("");
                }}
              >
                <div className="page-thumb">
                  <img src={page.image} alt={page.title} />
                  {page.imageStatus === "GENERATING" && (
                    <span className="thumb-loading">생성중</span>
                  )}
                </div>

                <div className="page-meta">
                  <strong>{page.label}</strong>
                  <span>{page.title}</span>
                  <em className={page.statusType}>
                    {page.statusType === "saved" && "◎"}
                    {page.statusType === "warning" && "◉"}
                    {page.statusType === "editing" && "⊙"}
                    {page.status}
                  </em>
                </div>

                <span className="page-more">⋮</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="editor-workspace">
          <div className="editor-toolbar-top">
            <select
              value={currentPageId}
              onChange={(e) => {
                setCurrentPageId(e.target.value);
                setSelectedSentence("");
                setAiSuggestion("");
              }}
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.label}
                </option>
              ))}
            </select>

            <div className="page-setting-actions">
              <button
                type="button"
                className={rightPanelMode === "pageSetting" ? "active" : ""}
                onClick={() => setRightPanelMode("pageSetting")}
              >
                ⚙ 페이지 설정
              </button>

              <button
                type="button"
                className={rightPanelMode === "ai" ? "active" : ""}
                onClick={() => setRightPanelMode("ai")}
              >
                ✨ AI 도움
              </button>
            </div>
          </div>

          <div className="book-canvas-card">
            <div className="book-canvas-viewport">
              <div
                className={`book-spread-stage ${viewMode}`}
                style={{ "--editor-zoom": zoom / 100 }}
              >
                <section className="spread-image-page">
                  <img
                    src={currentPage.image}
                    alt={currentPage.title}
                    className={`image-fit-${currentPageSetting.imageFit}`}
                  />

                  {currentPage.imageStatus === "GENERATING" && (
                    <div className="image-generating-cover">
                      <div className="image-spinner" />
                      <strong>이미지를 다시 생성하고 있어요</strong>
                      <p>잠시만 기다려 주세요.</p>
                    </div>
                  )}
                </section>

                <section
                  className={`spread-text-page text-align-${currentPageSetting.textAlign} paper-padding-${currentPageSetting.paperPadding}`}
                >
                  <div className="floating-text-toolbar square-toolbar">
                    <select defaultValue="nanum">
                      <option value="nanum">나눔손글씨</option>
                      <option value="pretendard">Pretendard</option>
                    </select>

                    <select defaultValue="32">
                      <option value="24">24</option>
                      <option value="28">28</option>
                      <option value="32">32</option>
                      <option value="36">36</option>
                    </select>

                    <button type="button">B</button>
                    <button type="button">I</button>
                    <button type="button">≡</button>
                    <button type="button" className="color-dot" />
                  </div>

                  <label className="editable-block square-title-block">
                    <span>제목</span>
                    <input
                      value={currentPage.title}
                      onChange={(e) =>
                        updateCurrentPage("title", e.target.value)
                      }
                    />
                  </label>

                  <label className="editable-block square-body-block">
                    <span>본문</span>
                    <textarea
                      value={currentPage.body}
                      onChange={(e) =>
                        updateCurrentPage("body", e.target.value)
                      }
                      onMouseUp={handleTextSelect}
                      onKeyUp={handleTextSelect}
                      placeholder="본문을 입력해 주세요."
                    />
                  </label>

                  {currentPageSetting.showPageNumber && (
                    <div className="page-number">
                      ─ {currentPage.label.replace("p", "")} ─
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>

          <div className="thumbnail-strip">
            <button
              type="button"
              className="first-page-btn"
              onClick={() => setCurrentPageId(pages[0].id)}
            >
              ≪<br />
              처음으로
            </button>

            <div className="thumbnail-scroll">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`bottom-thumb ${
                    page.id === currentPageId ? "active" : ""
                  }`}
                  onClick={() => {
                    setCurrentPageId(page.id);
                    setSelectedSentence("");
                    setAiSuggestion("");
                  }}
                >
                  <img src={page.image} alt={page.title} />
                  <span>{page.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="right-editor-panel">
          {rightPanelMode === "pageSetting" ? (
            <div className="page-setting-side-panel">
              <div className="side-panel-head">
                <button
                  type="button"
                  className="side-back-btn"
                  onClick={() => setRightPanelMode("ai")}
                >
                  ←
                </button>

                <div>
                  <strong>페이지 설정</strong>
                  <p>{currentPage.label} 표시 방식을 조정해요.</p>
                </div>
              </div>

              <div className="side-setting-group">
                <h3>기본 정보</h3>

                <label>
                  <span>페이지 제목</span>
                  <input
                    value={currentPage.title}
                    onChange={(e) =>
                      updateCurrentPage("title", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>페이지 유형</span>
                  <select
                    value={currentPageSetting.pageType}
                    onChange={(e) =>
                      updateCurrentPageSettings({ pageType: e.target.value })
                    }
                  >
                    <option value="cover">표지</option>
                    <option value="body">본문</option>
                    <option value="ending">마지막 페이지</option>
                  </select>
                </label>
              </div>

              <div className="side-setting-group">
                <h3>이미지</h3>

                <label>
                  <span>이미지 맞춤</span>
                  <select
                    value={currentPageSetting.imageFit}
                    onChange={(e) =>
                      updateCurrentPageSettings({ imageFit: e.target.value })
                    }
                  >
                    <option value="cover">꽉 채우기</option>
                    <option value="contain">전체 보이기</option>
                  </select>
                </label>

                <div className="image-edit-actions">
                  <button
                    type="button"
                    onClick={handleRegenerateCurrentImage}
                    disabled={currentPage.imageStatus === "GENERATING"}
                  >
                    🪄 현재 이미지 다시 생성
                  </button>

                  <label className="image-upload-button">
                    📁 이미지 직접 업로드
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCurrentImage}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRestorePreviousImage}
                    disabled={!currentPage.previousImage}
                  >
                    ↩ 이전 이미지로 되돌리기
                  </button>
                </div>

                <p className="side-help-text">
                  이미지는 항상 왼쪽 페이지에만 표시됩니다.
                </p>
              </div>

              <div className="side-setting-group">
                <h3>본문</h3>

                <label>
                  <span>본문 정렬</span>
                  <select
                    value={currentPageSetting.textAlign}
                    onChange={(e) =>
                      updateCurrentPageSettings({ textAlign: e.target.value })
                    }
                  >
                    <option value="left">왼쪽 정렬</option>
                    <option value="center">가운데 정렬</option>
                  </select>
                </label>

                <label>
                  <span>종이 여백</span>
                  <select
                    value={currentPageSetting.paperPadding}
                    onChange={(e) =>
                      updateCurrentPageSettings({
                        paperPadding: e.target.value,
                      })
                    }
                  >
                    <option value="narrow">좁게</option>
                    <option value="normal">기본</option>
                    <option value="wide">넓게</option>
                  </select>
                </label>

                <label className="side-check-row">
                  <input
                    type="checkbox"
                    checked={currentPageSetting.showPageNumber}
                    onChange={(e) =>
                      updateCurrentPageSettings({
                        showPageNumber: e.target.checked,
                      })
                    }
                  />
                  <span>페이지 번호 표시</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="ai-helper-panel-inner">
              <div className="ai-helper-top">
                <img src={fairysheep} alt="AI 선생님 루미" />
                <div className="ai-message">
                  <button type="button">×</button>
                  <p>
                    루미와 함께
                    <br />
                    문장을 더 예쁘게
                    <br />
                    다듬어볼까요?
                  </p>
                </div>
              </div>

              <div className="helper-tabs">
                <button type="button" className="active">
                  🧾 문장 다듬기
                </button>
                <button type="button">✎ 글쓰기 도움</button>
                <button type="button">☑ 검사하기</button>
              </div>

              <section className="selected-sentence">
                <h3>선택한 문장</h3>
                <p>
                  {selectedSentence ||
                    "본문에서 문장을 드래그하면 여기에 표시돼요."}
                </p>
              </section>

              {aiSuggestion && (
                <section className="ai-suggestion-box">
                  <h3>AI 수정 제안</h3>
                  <p>{aiSuggestion}</p>

                  <div className="suggestion-actions">
                    <button type="button" onClick={handleApplySuggestion}>
                      적용하기
                    </button>
                    <button type="button" onClick={() => setAiSuggestion("")}>
                      취소
                    </button>
                  </div>
                </section>
              )}

              <section className="rewrite-actions">
                <h3>어떻게 바꿔볼까요?</h3>

                <button type="button" onClick={() => handleRewrite("easy")}>
                  🦋 더 쉽게 바꾸기
                </button>
                <button type="button" onClick={() => handleRewrite("warm")}>
                  ⭐ 더 따뜻하게 바꾸기
                </button>
                <button type="button" onClick={() => handleRewrite("short")}>
                  ≡ 문장을 짧게 줄이기
                </button>
                <button type="button" onClick={() => handleRewrite("dialogue")}>
                  💬 대화를 추가하기
                </button>
              </section>

              <section className="direct-request-box">
                <h3>직접 요청하기</h3>
                <textarea
                  value={directRequest}
                  onChange={(e) => setDirectRequest(e.target.value)}
                  placeholder="예: 조금 더 동화처럼 바꿔줘"
                />
                <button type="button" onClick={handleDirectRequest}>
                  ✎ 요청 보내기
                </button>
              </section>
            </div>
          )}
        </aside>
      </main>

      <footer className="editor-bottom-bar">
        <div className="zoom-control">
          <span>확대/축소</span>
          <button type="button" onClick={handleZoomOut}>
            −
          </button>
          <strong>{zoom}%</strong>
          <button type="button" onClick={handleZoomIn}>
            ＋
          </button>
          <button type="button" onClick={handleFitScreen}>
            ⛶ 화면 맞춤
          </button>
        </div>

        <div className="view-mode-control">
          <button
            type="button"
            className={viewMode === "single" ? "active" : ""}
            onClick={() => setViewMode("single")}
          >
            ▣ 단면 보기
          </button>

          <button
            type="button"
            className={viewMode === "double" ? "active" : ""}
            onClick={() => setViewMode("double")}
          >
            🕮 양면 보기
          </button>
        </div>
      </footer>

      {isPreviewOpen && (
        <div className="editor-modal-overlay">
          <div className="preview-modal">
            <div className="modal-head">
              <div>
                <strong>전체 미리보기</strong>
                <p>
                  {previewIndex + 1} / {pages.length}
                </p>
              </div>

              <button type="button" onClick={() => setIsPreviewOpen(false)}>
                ×
              </button>
            </div>

            <div className="preview-book">
              <div className="preview-image">
                <img src={previewPage.image} alt={previewPage.title} />
              </div>

              <div className="preview-text">
                <h2>{previewPage.title}</h2>
                {previewPage.subtitle && <p>{previewPage.subtitle}</p>}
                <div>{previewPage.body}</div>
                <span>{previewPage.label}</span>
              </div>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
              >
                이전 페이지
              </button>

              <button type="button" onClick={() => setIsPreviewOpen(false)}>
                닫기
              </button>

              <button
                type="button"
                disabled={previewIndex === pages.length - 1}
                onClick={() =>
                  setPreviewIndex((prev) =>
                    Math.min(pages.length - 1, prev + 1)
                  )
                }
              >
                다음 페이지
              </button>
            </div>
          </div>
        </div>
      )}

      {completionErrors.length > 0 && (
        <div className="editor-modal-overlay">
          <div className="validation-modal">
            <h2>아직 완성할 수 없어요</h2>
            <p>아래 항목을 확인한 뒤 다시 완성해 주세요.</p>

            <ul>
              {completionErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>

            <button type="button" onClick={() => setCompletionErrors([])}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FairyTaleBookEditorPage;


