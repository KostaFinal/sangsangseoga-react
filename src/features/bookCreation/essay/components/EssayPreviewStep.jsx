import React, { useState } from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";
import { requestGenerateImage, extractImageUrl } from "../../services/imageGenerateService.js";

const getEssayPagePrompt = (pageNumber, content) => (
  `선택한 ${pageNumber}쪽의 에세이 내용과 분위기에 어울리는 차분한 삽화를 만들어줘.\n\n${content || ''}`
).trim();

export default function EssayPreviewStep({
  title,
  pages,
  activePreviewPage,
  setActivePreviewPage,
  goStep,
  setShowCompleteModal,
  coverImage,
  setCoverImage,
  pageImages,
  setPageImages,
}) {
  const [panelMode, setPanelMode] = useState("idle");
  const [selectedIllustrationPage, setSelectedIllustrationPage] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isRequestingImage, setIsRequestingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const left = pages[spreadStart];
  const right = pages[spreadStart + 1];
  const leftPageNumber = spreadStart + 1;
  const rightPageNumber = spreadStart + 2;
  const maxStart = Math.max(0, Math.floor((pages.length - 1) / 2) * 2);
  const selectedPageContent = selectedIllustrationPage
    ? pages[selectedIllustrationPage - 1]
    : "";
  const selectedPageImage = selectedIllustrationPage
    ? pageImages[selectedIllustrationPage]
    : null;

  const openCoverRequest = () => {
    setPanelMode("coverRequest");
    setImagePrompt("에세이의 주제와 분위기를 담은 차분하고 따뜻한 표지 이미지를 만들어줘.");
  };

  const openIllustrationRequest = () => {
    if (!selectedIllustrationPage) return;
    setPanelMode("illustrationRequest");
    setImagePrompt(getEssayPagePrompt(selectedIllustrationPage, selectedPageContent));
  };

  const cancelImageRequest = () => {
    setPanelMode("idle");
    setImagePrompt("");
    setImageError("");
  };

  const completeImageRequest = async () => {
    const isCoverRequest = panelMode === "coverRequest";
    if (!isCoverRequest && !selectedIllustrationPage) return;

    setIsRequestingImage(true);
    setImageError("");

    const response = await requestGenerateImage({
      promptText: imagePrompt,
      imageType: isCoverRequest ? "COVER" : "PAGE",
      pageNo: isCoverRequest ? null : selectedIllustrationPage,
      aspectRatio: "3:4",
    });

    setIsRequestingImage(false);

    if (!response.ok) {
      setImageError(response.message || "이미지 생성에 실패했어요. 다시 시도해 주세요.");
      return;
    }

    const imageUrl = extractImageUrl(response.data);
    if (!imageUrl) {
      setImageError("이미지 URL을 받지 못했어요. 다시 시도해 주세요.");
      return;
    }

    if (isCoverRequest) {
      setCoverImage({ url: imageUrl, prompt: imagePrompt });
    } else {
      setPageImages((prev) => ({
        ...prev,
        [selectedIllustrationPage]: { url: imageUrl, prompt: imagePrompt },
      }));
    }

    cancelImageRequest();
  };

  const selectPage = (pageNumber, hasPage) => {
    if (!hasPage) return;
    setSelectedIllustrationPage(pageNumber);
    if (panelMode === "illustrationRequest") {
      setImagePrompt(getEssayPagePrompt(pageNumber, pages[pageNumber - 1]));
    }
  };

  const getPageSelectProps = (pageNumber, hasPage) => {
    if (!hasPage) return {};

    return {
      role: "button",
      tabIndex: 0,
      onClick: () => selectPage(pageNumber, hasPage),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPage(pageNumber, hasPage);
        }
      },
    };
  };

  const renderPageIllustration = (pageNumber) => {
    const image = pageImages[pageNumber];
    if (!image) return null;

    return (
      <div className="preview-page-illustration">
        <img src={image.url} alt={`${pageNumber}쪽 삽화`} />
      </div>
    );
  };

  const renderImagePanel = () => {
    if (panelMode !== "idle") {
      const isCoverRequest = panelMode === "coverRequest";
      return (
        <div className="essay-image-box preview-image-request">
          <strong>{isCoverRequest ? "표지 이미지 만들기" : "삽화 이미지 만들기"}</strong>
          <p>
            {isCoverRequest
              ? "에세이의 주제와 분위기를 담은 표지 요청문을 확인해 주세요."
              : `${selectedIllustrationPage}쪽의 글 내용에 어울리는 삽화 요청문을 확인해 주세요.`}
          </p>
          <textarea
            className="preview-prompt-textarea"
            value={imagePrompt}
            onChange={(event) => setImagePrompt(event.target.value)}
            aria-label={isCoverRequest ? "표지 이미지 요청문" : "삽화 이미지 요청문"}
            disabled={isRequestingImage}
          />
          {imageError && <p className="preview-image-error">{imageError}</p>}
          <div className="preview-request-actions">
            <button type="button" className="essay-primary" onClick={completeImageRequest} disabled={isRequestingImage}>
              {isRequestingImage ? "생성 중…" : "생성하기"}
            </button>
            <button type="button" className="essay-ghost" onClick={cancelImageRequest} disabled={isRequestingImage}>취소</button>
          </div>
        </div>
      );
    }

    return (
      <div className="essay-image-box">
        <div className="preview-image-section">
          <strong>표지 이미지</strong>
          <p>에세이의 주제와 분위기를 바탕으로 표지 이미지를 만들 수 있어요.</p>
          <button type="button" className="essay-soft" onClick={openCoverRequest}>
            표지 이미지 생성
          </button>
          {coverImage && (
            <div className="preview-generated-card">
              <span>생성된 표지</span>
              <img src={coverImage.url} alt="생성된 에세이 표지" />
            </div>
          )}
        </div>

        <div className="preview-image-section">
          <strong>삽화 이미지</strong>
          <p>삽화를 넣고 싶은 쪽을 먼저 선택해 주세요.</p>
          <div className="preview-page-selection">
            <span>선택된 쪽</span>
            <b>{selectedIllustrationPage ? `${selectedIllustrationPage}쪽` : "없음"}</b>
          </div>
          <button
            type="button"
            className="essay-soft"
            onClick={openIllustrationRequest}
            disabled={!selectedIllustrationPage}
          >
            선택한 쪽 삽화 생성
          </button>
          {selectedPageImage && (
            <div className="preview-generated-card">
              <span>{selectedIllustrationPage}쪽 삽화</span>
              <img src={selectedPageImage.url} alt={`${selectedIllustrationPage}쪽 삽화`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="essay-preview-page">
      <div className="essay-studio-top">
        <EssayFlowStepper active={3} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview">
          <div className="preview-page-hint">삽화를 넣고 싶은 쪽을 클릭해 선택할 수 있어요.</div>
          <button
            type="button"
            className="page-turn prev"
            disabled={spreadStart === 0}
            onClick={() => setActivePreviewPage(Math.max(0, spreadStart - 2))}
          >
            ‹
          </button>
          <article
            className={`essay-book-page left preview-selectable-page ${selectedIllustrationPage === leftPageNumber ? "selected-illustration-page" : ""}`}
            {...getPageSelectProps(leftPageNumber, Boolean(left))}
          >
            {selectedIllustrationPage === leftPageNumber && <em className="selected-page-badge">선택됨</em>}
            {spreadStart === 0 && <h2>{title}</h2>}
            <p>{left}</p>
            {renderPageIllustration(leftPageNumber)}
            <span>{leftPageNumber}</span>
          </article>
          <article
            className={`essay-book-page right ${right ? "preview-selectable-page" : ""} ${selectedIllustrationPage === rightPageNumber ? "selected-illustration-page" : ""}`}
            {...getPageSelectProps(rightPageNumber, Boolean(right))}
          >
            {right ? (
              <>
                {selectedIllustrationPage === rightPageNumber && <em className="selected-page-badge">선택됨</em>}
                <p>{right}</p>
                {renderPageIllustration(rightPageNumber)}
              </>
            ) : (
              <p className="empty-page">다음 페이지 없음</p>
            )}
            <span>{right ? rightPageNumber : ""}</span>
          </article>
          <button
            type="button"
            className="page-turn next"
            disabled={spreadStart >= maxStart}
            onClick={() =>
              setActivePreviewPage(Math.min(maxStart, spreadStart + 2))
            }
          >
            ›
          </button>
        </div>
        <aside className="essay-preview-side">
          <h2>이미지 생성</h2>
          {renderImagePanel()}
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => goStep("step2")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          onClick={() => setShowCompleteModal(true)}
        >
          완성하기
        </button>
      </div>
    </section>
  );
}
