import React, { useState } from 'react';
import PoemFlowStepper from './PoemFlowStepper.jsx';
import { requestGenerateImage, extractImageUrl } from '../../services/imageGenerateService.js';
import { requestPoemCoverPrompt } from '../services/poemCreationService.js';
import { poemPage } from '../../../library/utils/mapBookPages.js';
import { PageCanvas } from '../../../library/components/reader/layout/pageElements.jsx';

const DEFAULT_COVER_INSTRUCTION = '시집의 제목과 전체 분위기를 담은 부드럽고 감성적인 표지 이미지를 만들어줘.';

export default function PoemPreviewStep({
  settings,
  previewPages,
  activePreviewPage,
  setActivePreviewPage,
  updatePoemById,
  requestViewChange,
  setShowCompleteModal,
  coverImage,
  setCoverImage,
  isSaving,
  saveError,
}) {
  const [panelMode, setPanelMode] = useState('idle');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isRequestingImage, setIsRequestingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const spreadStart = Math.floor(activePreviewPage / 2) * 2;
  const leftPage = previewPages[spreadStart];
  const rightPage = previewPages[spreadStart + 1];
  const maxStart = Math.max(0, Math.floor((previewPages.length - 1) / 2) * 2);
  const canGoPrev = spreadStart > 0;
  const canGoNext = spreadStart < maxStart;

  // 실제 리더(mapBookPages.js)와 똑같은 레이아웃 함수를 그대로 써서 미리보기를 그린다.
  // 이러면 여기서 보이는 모양이 곧 완독 화면에서 보일 모양이라, 둘이 어긋날 일이 없다.
  const toReaderPage = (previewPage) => {
    if (!previewPage) return null;
    return poemPage({
      pageNo: previewPage.pageNumber,
      title: previewPage.title || null,
      contentTextKo: previewPage.content,
      contentTextEn: previewPage.content,
      imageUrl: null,
    });
  };

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
    setImagePrompt(DEFAULT_COVER_INSTRUCTION);
  };

  const cancelImageRequest = () => {
    setPanelMode('idle');
    setImagePrompt('');
    setImageError('');
  };

  const completeCoverRequest = async () => {
    setIsRequestingImage(true);
    setImageError('');

    // 시는 은유로 쓰여 있어서 본문을 그대로 이미지 프롬프트에 넣으면 그림이 글이랑 안 맞는다.
    // AI에게 먼저 "실제로 그림으로 그릴 수 있는" 영어 표지 프롬프트를 뽑아달라고 요청한다.
    const coverPromptResult = await requestPoemCoverPrompt({
      settings,
      previewPages,
      userRequest: imagePrompt,
    });

    if (!coverPromptResult.ok || !coverPromptResult.coverPrompt) {
      setIsRequestingImage(false);
      setImageError(coverPromptResult.message || '표지 프롬프트를 만들지 못했어요. 다시 시도해 주세요.');
      return;
    }

    const response = await requestGenerateImage({
      promptText: coverPromptResult.coverPrompt,
      imageType: 'COVER',
      pageNo: null,
      aspectRatio: '3:4',
      bookType: 'POEM',
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

    setCoverImage({ url: imageUrl, prompt: imagePrompt });
    cancelImageRequest();
  };

  const renderImagePanel = () => {
    if (panelMode !== 'idle') {
      return (
        <div className="essay-image-box preview-image-request">
          <strong>표지 이미지 만들기</strong>
          <p>시집의 분위기를 담은 표지 요청문을 확인해 주세요.</p>
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
      </div>
    );
  };

  return (
    <section className="essay-preview-page poem-preview-page">
      <div className="essay-studio-top">
        <PoemFlowStepper active={3} />
      </div>
      <div className="essay-preview-layout">
        <div className="poem-book-preview-canvas-shell">
          <div className="poem-preview-spread">
            <button type="button" className="page-turn prev" onClick={goPrev} disabled={!canGoPrev} aria-label="이전 페이지">‹</button>
            <div className="poem-preview-canvas-wrap">
              {leftPage ? (
                <>
                  <PageCanvas page={toReaderPage(leftPage)} />
                  <span className="poem-preview-page-no">{leftPage.pageNumber}</span>
                </>
              ) : (
                <div className="empty-page">빈 페이지</div>
              )}
            </div>
            <div className="poem-preview-canvas-wrap">
              {rightPage ? (
                <>
                  <PageCanvas page={toReaderPage(rightPage)} />
                  <span className="poem-preview-page-no">{rightPage.pageNumber}</span>
                </>
              ) : (
                <div className="empty-page">다음 페이지 없음</div>
              )}
            </div>
            <button type="button" className="page-turn next" onClick={goNext} disabled={!canGoNext} aria-label="다음 페이지">›</button>
          </div>
        </div>
        <aside className="essay-preview-side poem-preview-side">
          {renderImagePanel()}
        </aside>
      </div>
      {saveError && <p className="essay-image-error preview-save-error">{saveError}</p>}
      <div className="essay-bottom-actions essay-work-bottom-actions">
        <button type="button" className="essay-ghost" onClick={() => requestViewChange('step2')}>이전</button>
        <button
          type="button"
          className="essay-primary"
          disabled={isSaving}
          onClick={() => setShowCompleteModal(true)}
        >
          {isSaving ? '저장 중...' : '완성하기'}
        </button>
      </div>
    </section>
  );
}
