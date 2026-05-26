import React from 'react';
import type { TrustedEmbedBlock } from 'pumpkin-ts-models';
import {
  getContainerClass,
  resolveTrustedEmbedUrl,
  validateTrustedEmbedContent,
} from 'pumpkin-ts-models';

export interface TrustedEmbedBlockViewProps {
  block: TrustedEmbedBlock;
}

export function TrustedEmbedBlockView({ block }: TrustedEmbedBlockViewProps) {
  const content = block.content || {};
  const result = validateTrustedEmbedContent(content);
  const embed = resolveTrustedEmbedUrl(content.url || '', result.ok ? content.provider as any : undefined);

  if (!result.ok || !embed.ok || !embed.embedUrl) {
    return (
      <section className="cms-trusted-embed cms-trusted-embed-invalid">
        <p>Embed unavailable.</p>
      </section>
    );
  }

  const aspectRatio = getAspectRatio(content.aspectRatio || '16:9');

  return (
    <section className={['cms-trusted-embed', getContainerClass(content.container)].filter(Boolean).join(' ')}>
      <div className="cms-embed-frame" style={{ aspectRatio }}>
        <iframe
          src={embed.embedUrl}
          title={content.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {content.caption ? <p className="cms-embed-caption">{content.caption}</p> : null}
    </section>
  );
}

function getAspectRatio(value: string) {
  const [width, height] = value.split(':').map((item) => Number(item));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return '16 / 9';
  }

  return `${width} / ${height}`;
}
