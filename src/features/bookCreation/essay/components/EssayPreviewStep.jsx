import React, { useState } from "react";
import EssayFlowStepper from "./EssayFlowStepper.jsx";
import { requestGenerateImage, extractImageUrl } from "../../services/imageGenerateService.js";
import { textOnlyPage } from "../../../library/utils/mapBookPages.js";
import { PageCanvas } from "../../../library/components/reader/layout/pageElements.jsx";

const DEFAULT_COVER_INSTRUCTION = "에세이의 주제와 분위기를 담은 차분하고 따뜻한 표지 이미지를 만들어줘.";

// 사용자가 보는 요청문 입력창에는 이 짧은 안내 문구만 채워서 깔끔하게 편집하게 하고,
// 실제 제목/본문은 여기서 따로 만들어 생성 요청 시에만 뒤에 붙여 보낸다(화면엔 안 보임).
// 이렇게 해야 AI가 실제 내용을 참고하면서도, 사용자가 긴 본문을 안 보고 자기 요청만 다듬을 수 있다.
const getEssayContext = (title, pages) => {
  const excerpt = (pages || []).filter(Boolean).join("\n");

  return [
    title ? `제목: ${title}` : "",
    excerpt ? `본문:\n${excerpt}` : "",
  ].filter(Boolean).join("\n\n").trim();
};

export default function EssayPreviewStep({
  title,
  pages,
  activePreviewPage,
  setActivePreviewPage,
  goStep,
  requestViewChange,
  setShowCompleteModal,
  coverImage,
  setCoverImage,
  isSaving,
  saveError,
}) {
  const [panelMode, setPanelMode] = useState("idle");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isRequestingImage, setIsRequestingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const leftPageNumber = spreadStart + 1;
  const rightPageNumber = spreadStart + 2;
  const maxStart = Math.max(0, Math.floor((pages.length - 1) / 2) * 2);
  const canGoPrev = spreadStart > 0;
  const canGoNext = spreadStart < maxStart;

  // 실제 리더(mapBookPages.js)와 똑같은 레이아웃 함수를 그대로 써서 미리보기를 그린다.
  // 이러면 여기서 보이는 모양이 곧 완독 화면에서 보일 모양이라, 둘이 어긋날 일이 없다.
  const toReaderPage = (pageIndex) => {
    const text = pages[pageIndex];
    if (text === undefined) return null;
    return textOnlyPage({
      pageNo: pageIndex + 1,
      title: pageIndex === 0 ? title : null,
      contentTextKo: text,
      contentTextEn: text,
    });
  };

  const leftReaderPage = toReaderPage(spreadStart);
  const rightReaderPage = toReaderPage(spreadStart + 1);

  const openCoverRequest = () => {
    setPanelMode("coverRequest");
    setImagePrompt(DEFAULT_COVER_INSTRUCTION);
  };

  const cancelImageRequest = () => {
    setPanelMode("idle");
    setImagePrompt("");
    setImageError("");
  };

  const completeCoverRequest = async () => {
    setIsRequestingImage(true);
    setImageError("");

    const essayContext = getEssayContext(title, pages);
    const finalPrompt = [imagePrompt, essayContext].filter(Boolean).join("\n\n");

    const response = await requestGenerateImage({
      promptText: finalPrompt,
      imageType: "COVER",
      pageNo: null,
      aspectRatio: "3:4",
      bookType: "ESSAY",
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

    setCoverImage({ url: imageUrl, prompt: imagePrompt });
    cancelImageRequest();
  };

  const renderImagePanel = () => {
    if (panelMode !== "idle") {
      return (
        <div className="essay-image-box preview-image-request">
          <strong>표지 이미지 만들기</strong>
          <p>에세이의 주제와 분위기를 담은 표지 요청문을 확인해 주세요.</p>
          <textarea
            className="preview-prompt-textarea"
            value={imagePrompt}
            onChange={(event) => setImagePrompt(event.target.value)}
            aria-label="표지 이미지 요청문"
            disabled={isRequestingImage}
          />
          {imageError && <p className="preview-image-error">{imageError}</p>}
          <div className="preview-request-actions">
            <button type="button" className="essay-primary" onClick={completeCoverRequest} disabled={isRequestingImage}>
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
      </div>
    );
  };

  return (
    <section className="essay-preview-page">
      <div className="essay-studio-top">
        <EssayFlowStepper active={3} />
      </div>
      <div className="essay-preview-layout">
        <div className="poem-book-preview-canvas-shell">
          <div className="poem-preview-spread">
            <button
              type="button"
              className="page-turn prev"
              disabled={!canGoPrev}
              aria-label="이전 페이지"
              onClick={() => setActivePreviewPage(Math.max(0, spreadStart - 2))}
            >
              ‹
            </button>
            <div className="poem-preview-canvas-wrap">
              {leftReaderPage ? (
                <>
                  <PageCanvas page={leftReaderPage} />
                  <span className="poem-preview-page-no">{leftPageNumber}</span>
                </>
              ) : (
                <div className="empty-page">빈 페이지</div>
              )}
            </div>
            <div className="poem-preview-canvas-wrap">
              {rightReaderPage ? (
                <>
                  <PageCanvas page={rightReaderPage} />
                  <span className="poem-preview-page-no">{rightPageNumber}</span>
                </>
              ) : (
                <div className="empty-page">다음 페이지 없음</div>
              )}
            </div>
            <button
              type="button"
              className="page-turn next"
              disabled={!canGoNext}
              aria-label="다음 페이지"
              onClick={() =>
                setActivePreviewPage(Math.min(maxStart, spreadStart + 2))
              }
            >
              ›
            </button>
          </div>
        </div>
        <aside className="essay-preview-side">
          {renderImagePanel()}
        </aside>
      </div>
      {saveError && <p className="essay-image-error preview-save-error">{saveError}</p>}
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button
          type="button"
          className="essay-ghost"
          onClick={() => requestViewChange("step2")}
        >
          이전
        </button>
        <button
          type="button"
          className="essay-primary"
          disabled={isSaving}
          onClick={() => setShowCompleteModal(true)}
        >
          {isSaving ? "저장 중..." : "완성하기"}
        </button>
      </div>
    </section>
  );
}
