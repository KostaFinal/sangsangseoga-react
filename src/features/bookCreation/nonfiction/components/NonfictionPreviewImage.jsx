import React from 'react';

export default function NonfictionPreviewImage({ image }) {
  return (
    <figure className="nf-card-preview-image">
      <img src={image.url} alt={image.caption} />
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}
