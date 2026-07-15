import React from 'react';
import EssaySetupStep from './EssaySetupStep.jsx';
import EssayWorkStep from './EssayWorkStep.jsx';
import EssayPreviewStep from './EssayPreviewStep.jsx';
import { ConfirmModal } from '../../../../shared/components';
import useEssayCreationState from '../hooks/useEssayCreationState.js';

export default function EssayApp({ onSwitchGenre, initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const {
    view,
    settings,
    setSettings,
    answers,
    setAnswers,
    questionIndex,
    setQuestionIndex,
    guidedComplete,
    content,
    title,
    pages,
    workInput,
    setWorkInput,
    selectedText,
    setSelectedText,
    revisionRequest,
    setRevisionRequest,
    freeEditMode,
    setFreeEditMode,
    guidedEditMode,
    setGuidedEditMode,
    freeUndoSnapshot,
    freeRedoSnapshot,
    activePreviewPage,
    setActivePreviewPage,
    showCompleteModal,
    setShowCompleteModal,
    writeGuidedStep,
    recommendGuidedAnswer,
    appendRaw,
    appendPolished,
    askAi,
    undoFreeAction,
    redoFreeAction,
    closeFreeEditMode,
    applyRevision,
    selectFromTextarea,
    goStep,
    resetEssay,
    selectEssayMode,
    moveToMyBooks,
    isGenerating,
    generationNotice,
    coverImage,
    setCoverImage,
    pageImages,
    setPageImages,
  } = useEssayCreationState({ initialView, onGoToMyBooks, onBookComplete });

  return (
    <div className="app-shell essay-only-shell pt-4">
      <main className="workspace essay-workspace-root">
        {view === 'step1' && (
          <EssaySetupStep
            settings={settings}
            setSettings={setSettings}
            goStep={goStep}
            selectEssayMode={selectEssayMode}
          />
        )}
        {view === 'step2' && (
          <EssayWorkStep
            settings={settings}
            setSettings={setSettings}
            answers={answers}
            setAnswers={setAnswers}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            guidedComplete={guidedComplete}
            content={content}
            title={title}
            workInput={workInput}
            setWorkInput={setWorkInput}
            writeGuidedStep={writeGuidedStep}
            recommendGuidedAnswer={recommendGuidedAnswer}
            appendRaw={appendRaw}
            appendPolished={appendPolished}
            askAi={askAi}
            selectedText={selectedText}
            setSelectedText={setSelectedText}
            revisionRequest={revisionRequest}
            setRevisionRequest={setRevisionRequest}
            freeEditMode={freeEditMode}
            setFreeEditMode={setFreeEditMode}
            guidedEditMode={guidedEditMode}
            setGuidedEditMode={setGuidedEditMode}
            freeUndoSnapshot={freeUndoSnapshot}
            freeRedoSnapshot={freeRedoSnapshot}
            undoFreeAction={undoFreeAction}
            redoFreeAction={redoFreeAction}
            closeFreeEditMode={closeFreeEditMode}
            applyRevision={applyRevision}
            selectFromTextarea={selectFromTextarea}
            goStep={goStep}
            resetEssay={resetEssay}
            isGenerating={isGenerating}
            generationNotice={generationNotice}
          />
        )}
        {view === 'step3' && (
          <EssayPreviewStep
            title={title}
            pages={pages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            goStep={goStep}
            setShowCompleteModal={setShowCompleteModal}
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            pageImages={pageImages}
            setPageImages={setPageImages}
          />
        )}
      </main>

      <ConfirmModal
        isOpen={showCompleteModal}
        title="에세이집이 완성되었어요"
        message="내 서재의 내가 쓴 책에서 방금 만든 에세이를 확인할 수 있어요."
        cancelText="닫기"
        confirmText="내 서재로 이동"
        type="success"
        onClose={() => setShowCompleteModal(false)}
        onConfirm={moveToMyBooks}
      />
    </div>
  );
}
