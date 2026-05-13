'use client';

import React from 'react';
import type { BlockStyleMap, IHtmlBlock, Page } from 'pumpkin-ts-models';
import type { BlockClassNamesMap } from 'pumpkin-block-views';
import { BlockViewRenderer } from 'pumpkin-block-views';
import { renderPolishedBlock, type ContactSubmitPayload } from '@/components/blocks/PolishedBlocks';

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

  const handleContactSubmit = async (payload: ContactSubmitPayload) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      throw new Error(result.error || 'Unable to submit the contact form. Please try again.');
    }
  };

  const renderBlogBody = (body: string) => {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  };

  return (
    <>
      {blocks.map((block, index) => {
        const polishedBlock = renderPolishedBlock({
          block,
          pageSlug: page.pageSlug,
        });

        return (
          <section key={block.id ?? `block-${index}`} id={getSectionId(block)}>
            {polishedBlock ?? (
              <BlockViewRenderer
                block={block}
                classNames={classNames}
                overrides={{
                  Contact: {
                    onSubmit: (formData: Record<string, string>) =>
                      handleContactSubmit({
                        formId: 'contact',
                        pageSlug: page.pageSlug,
                        formData,
                      }),
                  },
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
