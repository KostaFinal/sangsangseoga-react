import React from 'react';

export default function NonfictionPageHead({ kicker, title, desc }) {
  return (
    <div className="nf-card-page-head">
      {kicker && <span>{kicker}</span>}
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}
