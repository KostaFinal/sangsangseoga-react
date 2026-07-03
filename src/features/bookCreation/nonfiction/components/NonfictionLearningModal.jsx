import React, { useState } from 'react';
import NonfictionSimpleModal from './NonfictionSimpleModal.jsx';
import { LEARNING_OPTIONS } from '../nonfictionShared.js';

export default function NonfictionLearningModal({ addLearning, onClose }) {
  const [selectedParts, setSelectedParts] = useState([]);
  const togglePart = (key) => {
    setSelectedParts((prev) => (
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    ));
  };

  return (
    <NonfictionSimpleModal title="마무리 만들기" desc="필요한 항목을 골라 단원 끝에 붙일 마무리를 만들어요." onClose={onClose}>
      <div className="nf-card-learning-options">
        {LEARNING_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.key}
            className={selectedParts.includes(option.key) ? 'selected' : ''}
            aria-pressed={selectedParts.includes(option.key)}
            onClick={() => togglePart(option.key)}
          >
            <strong>{option.label}</strong>
            <span>{option.desc}</span>
          </button>
        ))}
      </div>
      <div className="nf-card-modal-actions">
        <button type="button" className="nf-card-primary" disabled={!selectedParts.length} onClick={() => addLearning(selectedParts)}>마무리 만들기</button>
      </div>
    </NonfictionSimpleModal>
  );
}
