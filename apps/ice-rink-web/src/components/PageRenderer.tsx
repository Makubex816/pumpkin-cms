'use client';

import React from 'react';
import type { BlockStyleMap, IHtmlBlock, Page } from 'pumpkin-ts-models';
import type { BlockClassNamesMap } from 'pumpkin-block-views';
import { BlockViewRenderer } from 'pumpkin-block-views';
import { renderPolishedBlock } from '@/components/blocks/PolishedBlocks';

interface CmsBlock extends IHtmlBlock {
  id?: string;
  name?: string;
  enabled?: boolean;
}

interface PageRendererProps {
  page: Page;
  blockStyles?: BlockStyleMap;
}

export function PageRenderer({ page, blockStyles }: PageRendererProps) {
  const blocks = (page.ContentData.ContentBlocks as CmsBlock[]).filter(
    (block) => block.enabled !== false
  );
  const classNames = (blockStyles ?? {}) as BlockClassNamesMap;

  const handleContactSubmit = (formData: Record<string, string>) => {
    console.log('[ice-rink-web] Contact form submitted:', formData);
    alert('Thanks for reaching out. The form handler is ready to connect to Pumpkin forms.');
  };

  const renderBlogBody = (body: string) => {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  };

  return (
    <>
      {blocks.map((block, index) => {
        const polishedBlock = renderPolishedBlock({
          block,
          onContactSubmit: handleContactSubmit,
        });

        return (
          <section key={block.id ?? `block-${index}`} id={getSectionId(block)}>
            {polishedBlock ?? (
              <BlockViewRenderer
                block={block}
                classNames={classNames}
                overrides={{
                  Contact: { onSubmit: handleContactSubmit },
                  Blog: { renderBody: renderBlogBody },
                }}
                fallback={
                  <div className="max-w-3xl mx-auto px-8 py-12 text-center text-slate-400">
                    <p>Unknown block type: {block.type}</p>
                  </div>
                }
              />
            )}
          </section>
        );
      })}
    </>
  );
}

function getSectionId(block: CmsBlock): string {
  const map: Record<string, string> = {
    Hero: 'hero',
    CardGrid: 'features',
    HowItWorks: 'how-it-works',
    FAQ: 'faq',
    Blog: 'blog',
    Contact: 'contact',
    Testimonials: 'testimonials',
    Gallery: 'gallery',
    ServiceAreaMap: 'service-area-map',
    PrimaryCTA: 'quote',
    SecondaryCTA: 'next-step',
  };

  return map[block.type] || block.id || block.type.toLowerCase();
}
