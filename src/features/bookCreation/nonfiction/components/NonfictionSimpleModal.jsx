import React from 'react';

export default function NonfictionSimpleModal({ title, desc, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`nf-card-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <button type="button" className="nf-card-modal-close" onClick={onClose}>×</button>
        <h3>{title}</h3>
        <p>{desc}</p>
        {children}
      </div>
    </div>
  );
}
