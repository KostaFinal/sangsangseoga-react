import React from 'react';
import { hasText } from '../nonfictionShared.js';
import NonfictionSimpleModal from './NonfictionSimpleModal.jsx';

export default function NonfictionAiModal({ unit, aiRequest, setAiRequest, makeBody, polish, example, onClose }) {
  return (
    <NonfictionSimpleModal title="본문 작성" desc="현재 단원에 필요한 내용을 AI에게 요청해 보세요. 요청 없이 바로 생성해도 괜찮아요." onClose={onClose} wide>
      <textarea className="nf-card-modal-textarea" value={aiRequest} onChange={(event) => setAiRequest(event.target.value)} placeholder="예: 먹이사슬을 초등학생이 이해하기 쉽게 설명해 줘" />
      <div className="nf-card-modal-actions three">
        <button type="button" className="nf-card-ghost" disabled={!hasText(unit.content)} onClick={polish}>쉽게 다듬기</button>
        <button type="button" className="nf-card-ghost" onClick={example}>예시 추가</button>
        <button type="button" className="nf-card-primary" onClick={makeBody}>{hasText(unit.content) ? '본문 다시 만들기' : '본문 만들기'}</button>
      </div>
    </NonfictionSimpleModal>
  );
}
