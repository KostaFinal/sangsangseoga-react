import React from 'react';
import NonfictionSimpleModal from './NonfictionSimpleModal.jsx';

export default function NonfictionImageModal({ imageRequest, setImageRequest, imageType, setImageType, addImage, onClose }) {
  const types = ['개념 그림', '구조도', '단계도', '비교 그림'];
  return (
    <NonfictionSimpleModal title="이미지 추가" desc="본문을 설명해 줄 이미지를 AI에게 요청해요. 이미지는 현재 단원의 이미지 영역에 들어가요." onClose={onClose} wide>
      <textarea className="nf-card-modal-textarea" value={imageRequest} onChange={(event) => setImageRequest(event.target.value)} placeholder="예: 먹이사슬의 흐름을 한눈에 보여주는 쉬운 그림" />
      <div className="nf-card-type-row">
        {types.map((type) => <button type="button" key={type} className={imageType === type ? 'selected' : ''} onClick={() => setImageType(type)}>{type}</button>)}
      </div>
      <div className="nf-card-modal-actions">
        <button type="button" className="nf-card-primary" onClick={addImage}>AI 이미지 생성 요청</button>
      </div>
    </NonfictionSimpleModal>
  );
}
