import React, { useState } from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import { requestGenerateImage, extractImageUrl } from '../../services/imageGenerateService.js';

const getPoemPagePrompt = (page) => {
  const content = page?.content || '';
  return `선택한 ${page?.pageNumber || ''}쪽의 시 내용과 분위기에 어울리는 감성적인 삽화를 만들어줘.\n\n${content}`.trim();
};

export default function PoemPreviewStep({
  previewPages,
  activePreviewPage,
  setActivePreviewPage,
  updatePoemById,
  requestViewChange,
  setShowCompleteModal,
  coverImage,
  setCoverImage,
  pageImages,
  setPageImages,
}) {
  const [panelMode, setPanelMode] = useState('idle');
  const [selectedIllustrationPage, setSelectedIllustrationPage] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isRequestingImage, setIsRequestingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const leftPage = previewPages[spreadStart];
  const rightPage = previewPages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((previewPages.length - 1) / 2) * 2);
  const canGoPrev = spreadStart > 0;
  const canGoNext = spreadStart < maxStart;
  const selectedPage = previewPages.find((page) => page.pageNumber === selectedIllustrationPage);
  const selectedPageImage = selectedIllustrationPage ? pageImages[selectedIllustrationPage] : null;

  const goPrev = () => {
    if (!canGoPrev) return;
    setActivePreviewPage(Math.max(0, spreadStart - 2));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setActivePreviewPage(Math.min(maxStart, spreadStart + 2));
  };

  const openCoverRequest = () => {
    setPanelMode('coverRequest');
    setImagePrompt('시집의 제목과 전체 분위기를 담은 부드럽고 감성적인 표지 이미지를 만들어줘.');
  };

  const openIllustrationRequest = () => {
    if (!selectedPage) return;
    setPanelMode('illustrationRequest');
    setImagePrompt(getPoemPagePrompt(selectedPage));
  };

  const cancelImageRequest = () => {
    setPanelMode('idle');
    setImagePrompt('');
    setImageError('');
  };

  const completeImageRequest = async () => {
    const isCoverRequest = panelMode === 'coverRequest';
    if (!isCoverRequest && !selectedPage) return;

    setIsRequestingImage(true);
    setImageError('');

    const response = await requestGenerateImage({
      promptText: imagePrompt,
      imageType: isCoverRequest ? 'COVER' : 'PAGE',
      pageNo: isCoverRequest ? null : selectedPage.pageNumber,
      aspectRatio: '3:4',
    });

    setIsRequestingImage(false);

    if (!response.ok) {
      setImageError(response.message || '이미지 생성에 실패했어요. 다시 시도해 주세요.');
      return;
    }

    const imageUrl = extractImageUrl(response.data);
    if (!imageUrl) {
      setImageError('이미지 URL을 받지 못했어요. 다시 시도해 주세요.');
      return;
    }

    if (isCoverRequest) {
      setCoverImage({ url: imageUrl, prompt: imagePrompt });
    } else {
      setPageImages((prev) => ({
        ...prev,
        [selectedPage.pageNumber]: { url: imageUrl, prompt: imagePrompt },
      }));
    }

    cancelImageRequest();
  };

  const selectPage = (page) => {
    if (!page) return;
    setSelectedIllustrationPage(page.pageNumber);
    if (panelMode === 'illustrationRequest') {
      setImagePrompt(getPoemPagePrompt(page));
    }
  };

  const getPageSelectProps = (page) => {
    if (!page) return {};

    return {
      role: 'button',
      tabIndex: 0,
      onClick: () => selectPage(page),
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectPage(page);
        }
      },
    };
  };

  const renderPageIllustration = (page) => {
    const image = page ? pageImages[page.pageNumber] : null;
    if (!image) return null;

    return (
      <div className="preview-page-illustration">
        <img src={image.url} alt={`${page.pageNumber}쪽 삽화`} />
      </div>
    );
  };

  const renderImagePanel = () => {
    if (panelMode !== 'idle') {
      const isCoverRequest = panelMode === 'coverRequest';
      return (
        <div className="essay-image-box preview-image-request">
          <strong>{isCoverRequest ? '표지 이미지 만들기' : '삽화 이미지 만들기'}</strong>
          <p>
            {isCoverRequest
              ? '시집의 분위기를 담은 표지 요청문을 확인해 주세요.'
              : `${selectedIllustrationPage}쪽의 시 내용에 어울리는 삽화 요청문을 확인해 주세요.`}
          </p>
          <textarea
            className="preview-prompt-textarea"
            value={imagePrompt}
            onChange={(event) => setImagePrompt(event.target.value)}
            aria-label={isCoverRequest ? '표지 이미지 요청문' : '삽화 이미지 요청문'}
            disabled={isRequestingImage}
          />
          {imageError && <p className="preview-image-error">{imageError}</p>}
          <div className="preview-request-actions">
            <button type="button" className="essay-primary" onClick={completeImageRequest} disabled={isRequestingImage}>
              {isRequestingImage ? '생성 중…' : '생성하기'}
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
          <p>시집의 제목과 분위기를 바탕으로 표지 이미지를 만들 수 있어요.</p>
          <button type="button" className="essay-soft" onClick={openCoverRequest}>표지 이미지 생성</button>
          {coverImage && (
            <div className="preview-generated-card">
              <span>생성된 표지</span>
              <img src={coverImage.url} alt="생성된 시집 표지" />
            </div>
          )}
        </div>

        <div className="preview-image-section">
          <strong>삽화 이미지</strong>
          <p>삽화를 넣고 싶은 쪽을 먼저 선택해 주세요.</p>
          <div className="preview-page-selection">
            <span>선택된 쪽</span>
            <b>{selectedIllustrationPage ? `${selectedIllustrationPage}쪽` : '없음'}</b>
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
    <section className="essay-preview-page poem-preview-page">
      <div className="essay-studio-top">
        <PoemFlowStepper active={3} />
      </div>
      <div className="essay-preview-layout">
        <div className="essay-book-preview poem-book-preview">
          <div className="preview-page-hint">삽화를 넣고 싶은 쪽을 클릭해 선택할 수 있어요.</div>
          <button type="button" className="page-turn prev" onClick={goPrev} disabled={!canGoPrev} aria-label="이전 페이지">‹</button>
          <article
            className={`essay-book-page left poem-book-page preview-selectable-page ${selectedIllustrationPage === leftPage?.pageNumber ? 'selected-illustration-page' : ''}`}
            {...getPageSelectProps(leftPage)}
          >
            {leftPage ? (
              <>
                {selectedIllustrationPage === leftPage.pageNumber && <em className="selected-page-badge">선택됨</em>}
                <h2 className={leftPage.isContinued ? 'poem-page-title-slot' : ''}>{leftPage.title}</h2>
                <p>{leftPage.content}</p>
                {renderPageIllustration(leftPage)}
                <span>{leftPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">빈 페이지</p>
            )}
          </article>
          <article
            className={`essay-book-page right poem-book-page ${rightPage ? 'preview-selectable-page' : ''} ${selectedIllustrationPage === rightPage?.pageNumber ? 'selected-illustration-page' : ''}`}
            {...getPageSelectProps(rightPage)}
          >
            {rightPage ? (
              <>
                {selectedIllustrationPage === rightPage.pageNumber && <em className="selected-page-badge">선택됨</em>}
                <h2 className={(rightPage.isContinued || rightPage.poemId === leftPage?.poemId) ? 'poem-page-title-slot' : ''}>{rightPage.title}</h2>
                <p>{rightPage.content}</p>
                {renderPageIllustration(rightPage)}
                <span>{rightPage.pageNumber}</span>
              </>
            ) : (
              <p className="empty-page">다음 페이지 없음</p>
            )}
          </article>
          <button type="button" className="page-turn next" onClick={goNext} disabled={!canGoNext} aria-label="다음 페이지">›</button>
        </div>
        <aside className="essay-preview-side poem-preview-side">
          <h2>이미지 생성</h2>
          {renderImagePanel()}
        </aside>
      </div>
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => requestViewChange('step2')}>이전</button>
        <button type="button" className="essay-primary" onClick={() => setShowCompleteModal(true)}>완성하기</button>
      </div>
    </section>
  );
}
