import React from 'react';
import type { CustomHtmlBlock } from 'pumpkin-ts-models';
import {
  getContainerClass,
  getSectionVariantClass,
  normalizeSectionId,
  validateCustomHtmlContent,
} from 'pumpkin-ts-models';

export interface CustomHtmlBlockViewProps {
  block: CustomHtmlBlock;
  approvedClasses?: string[];
}

export function CustomHtmlBlockView({ block, approvedClasses }: CustomHtmlBlockViewProps) {
  const content = block.content || {};
  const sectionId = normalizeSectionId(content.id);
  const result = validateCustomHtmlContent(content, {
    approvedClasses,
    path: `customHtml.${sectionId}`,
  });

  if (!result.ok) {
    return (
      <section data-section-id={sectionId} data-cms-section={sectionId} className="cms-rich-section cms-rich-section-invalid">
        <p>Section unavailable.</p>
      </section>
    );
  }

  const containerClass = getContainerClass(content.container);
  const variantClass = getSectionVariantClass(content.sectionVariant);

  return (
    <section
      data-section-id={sectionId}
      data-cms-section={sectionId}
      className={['cms-rich-section', `section-${sectionId}`, variantClass, containerClass].filter(Boolean).join(' ')}
    >
      {result.sanitizedCss ? <style dangerouslySetInnerHTML={{ __html: result.sanitizedCss }} /> : null}
      <div
        className="cms-rich-html rich-content"
        dangerouslySetInnerHTML={{ __html: result.sanitizedHtml || '' }}
      />
    </section>
  );
}
