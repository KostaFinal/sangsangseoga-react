import React from 'react';

export default function NonfictionImageCard({ image }) {
  return (
    <div className="nf-card-image-box">
      <img src={image.url} alt={image.caption} />
      <strong>{image.caption}</strong>
      <p>{image.linkedText}</p>
    </div>
  );
}
