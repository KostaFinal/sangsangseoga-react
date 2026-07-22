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
    updateContent,
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
    askAi,
    undoFreeAction,
    redoFreeAction,
    closeFreeEditMode,
    applyRevision,
    selectFromTextarea,
    goStep,
    showExitModal,
    requestViewChange,
    confirmLeave,
    cancelLeave,
    resetEssay,
    selectEssayMode,
    moveToMyBooks,
    isGenerating,
    generationNotice,
    coverImage,
    setCoverImage,
    isSaving,
    saveError,
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
            updateContent={updateContent}
            title={title}
            workInput={workInput}
            setWorkInput={setWorkInput}
            writeGuidedStep={writeGuidedStep}
            recommendGuidedAnswer={recommendGuidedAnswer}
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
            requestViewChange={requestViewChange}
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
            requestViewChange={requestViewChange}
            setShowCompleteModal={setShowCompleteModal}
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            isSaving={isSaving}
            saveError={saveError}
          />
        )}
      </main>

      <ConfirmModal
        isOpen={showCompleteModal}
        title="에세이집이 완성되었어요"
        message="내 서재의 내가 쓴 책에서 방금 만든 에세이를 확인할 수 있어요."
        cancelText="닫기"
        confirmText="내 서재로 이동"
        type="brand"
        onClose={() => setShowCompleteModal(false)}
        onConfirm={moveToMyBooks}
      />

      <ConfirmModal
        isOpen={showExitModal}
        title="이전 단계로 이동할까요?"
        message="현재 작성 중인 내용이 초기화될 수 있어요. 확인을 누르면 내용을 지우고 이전 단계로 이동해요."
        cancelText="취소"
        confirmText="확인"
        type="danger"
        onClose={cancelLeave}
        onConfirm={confirmLeave}
      />
    </div>
  );
}
