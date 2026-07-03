import React from 'react';
import PoemModeStep from './PoemModeStep.jsx';
import PoemSettingStep from './PoemSettingStep.jsx';
import PoemWorkStep from './PoemWorkStep.jsx';
import PoemPreviewStep from './PoemPreviewStep.jsx';
import { ConfirmModal } from '../../../../shared/components';
import usePoemCreationState from '../hooks/usePoemCreationState.js';

export default function PoemApp({ onSwitchGenre, initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const {
    currentView,
    setCurrentView,
    settings,
    setSettings,
    questionIndex,
    setQuestionIndex,
    variant,
    setVariant,
    poems,
    activePoem,
    setActivePoem,
    activePreviewPage,
    setActivePreviewPage,
    showBackModal,
    showCompleteModal,
    setShowCompleteModal,
    poem,
    selections,
    answers,
    previewPages,
    titleIdeas,
    updatePoem,
    updatePoemById,
    makePoem,
    makeAll,
    resetStep3,
    requestViewChange,
    confirmBack,
    cancelBack,
    addPoem,
    deletePoem,
    selectChoice,
    updateCurrentPoemAnswers,
    updateCurrentPoemFreeRequest,
    completeAndMove,
  } = usePoemCreationState({ initialView, onGoToMyBooks, onBookComplete });

  return (
    <div className="app-frame pt-4">
      <main className="workspace">
        {currentView === 'step1' && (
          <PoemModeStep settings={settings} setSettings={setSettings} setCurrentView={setCurrentView} />
        )}
        {currentView === 'step2' && (
          <PoemSettingStep
            settings={settings}
            setSettings={setSettings}
            setCurrentView={setCurrentView}
            requestViewChange={requestViewChange}
          />
        )}
        {currentView === 'step3' && (
          <PoemWorkStep
            settings={settings}
            selections={selections}
            answers={answers}
            poem={poem}
            poems={poems}
            activePoem={activePoem}
            setActivePoem={setActivePoem}
            updatePoem={updatePoem}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            selectChoice={selectChoice}
            updateCurrentPoemAnswers={updateCurrentPoemAnswers}
            updateCurrentPoemFreeRequest={updateCurrentPoemFreeRequest}
            makePoem={makePoem}
            makeAll={makeAll}
            variant={variant}
            setVariant={setVariant}
            resetStep3={resetStep3}
            titleIdeas={titleIdeas}
            addPoem={addPoem}
            deletePoem={deletePoem}
            setCurrentView={setCurrentView}
            requestViewChange={requestViewChange}
          />
        )}
        {currentView === 'step4' && (
          <PoemPreviewStep
            previewPages={previewPages}
            activePreviewPage={activePreviewPage}
            setActivePreviewPage={setActivePreviewPage}
            updatePoemById={updatePoemById}
            requestViewChange={requestViewChange}
            setShowCompleteModal={setShowCompleteModal}
          />
        )}
      </main>

      
      <ConfirmModal
        isOpen={showBackModal}
        title="이전 단계로 이동할까요?"
        message="현재 시의 선택 내용과 만들어진 시가 초기화될 수 있어요. 확인을 누르면 내용을 지우고 이전 단계로 이동해요."
        cancelText="취소"
        confirmText="확인"
        type="danger"
        onClose={cancelBack}
        onConfirm={confirmBack}
      />
      

      <ConfirmModal
          isOpen={showCompleteModal}
          title="책이 완성되었어요!"
          message="내 서재의 내가 쓴 책에서 방금 만든 시집을 확인할 수 있어요."
          cancelText="닫기"
          confirmText="확인"
          type="success"
          onClose={() => setShowCompleteModal(false)}
          onConfirm={completeAndMove}
      />
    </div>
  );
}
