import React from 'react';
import NonfictionSimpleModal from './NonfictionSimpleModal.jsx';

export default function NonfictionToolsModal({ canUndo, canRedo, undo, redo, resetUnit, removeImage, hasImage, onClose }) {
  return (
    <NonfictionSimpleModal title="단원 도구" desc="자주 쓰지 않는 기능은 이곳에 모아 두었어요." onClose={onClose}>
      <div className="nf-card-tool-list">
        <button type="button" disabled={!canUndo} onClick={undo}>되돌리기</button>
        <button type="button" disabled={!canRedo} onClick={redo}>앞으로</button>
        <button type="button" onClick={resetUnit}>현재 단원 비우기</button>
        <button type="button" disabled={!hasImage} onClick={removeImage}>이미지 제거</button>
      </div>
    </NonfictionSimpleModal>
  );
}
