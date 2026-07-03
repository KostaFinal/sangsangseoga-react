import React from 'react';

export default function NonfictionAccordionCard({ title, desc, open, onOpen, actionLabel, onAction, children }) {
  return (
    <article className={`nf-card-accordion ${open ? 'open' : ''}`}>
      <header>
        <button type="button" onClick={onOpen}>
          <span>⌄</span>
          <strong>{title}</strong>
          <em>{desc}</em>
        </button>
        {open && <button type="button" className="nf-card-mini primary" onClick={onAction}>{actionLabel}</button>}
      </header>
      {open && <div className="nf-card-accordion-body">{children}</div>}
    </article>
  );
}
