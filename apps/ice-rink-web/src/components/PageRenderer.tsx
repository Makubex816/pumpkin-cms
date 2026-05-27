'use client';

import React from 'react';
import type { BlockStyleMap, DesignSystemMetadata, IHtmlBlock, Page } from 'pumpkin-ts-models';
import { sanitizeHtml } from 'pumpkin-ts-models';
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
  designSystem?: DesignSystemMetadata;
  renderMode?: 'runtime' | 'static';
  staticFormEndpoint?: string;
  staticFormAction?: string;
}

export function PageRenderer({
  page,
  blockStyles,
  designSystem,
  renderMode = 'runtime',
  staticFormEndpoint = '',
  staticFormAction = '',
}: PageRendererProps) {
  const blocks = (page.ContentData.ContentBlocks as CmsBlock[]).filter(
    (block) => block.enabled !== false
  );
  const classNames = (blockStyles ?? {}) as BlockClassNamesMap;
  const resolvedStaticFormEndpoint = staticFormEndpoint || staticFormAction;

  const handleContactSubmit = async (payload: ContactSubmitPayload) => {
    const endpoint = renderMode === 'static' ? resolvedStaticFormEndpoint : '/api/contact';

    if (!endpoint) {
      throw new Error('Online quote requests are not configured for this static site yet. Please contact us directly.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        siteKey: payload.siteKey || page.tenantId,
        tenantId: payload.tenantId || page.tenantId,
        formKey: payload.formKey || payload.formId,
        sourcePage: payload.sourcePage || page.pageSlug,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Unable to submit the contact form. Please try again.');
    }
  };

  const renderBlogBody = (body: string) => {
    const result = sanitizeHtml(body, { profile: 'marketing-rich', path: 'Blog.content.body' });
    return <div dangerouslySetInnerHTML={{ __html: result.ok ? result.sanitizedHtml || '' : '' }} />;
  };

  return (
    <>
      {blocks.map((block, index) => {
        const thankYouMessage = page.formConfig?.thankYouMessage?.trim();
        const blockForRender = block.type === 'Contact'
          ? {
              ...block,
              content: {
                ...(block.content ?? {}),
                formConfig: page.formConfig,
                ...getPublicContactOverrides(page),
                ...(thankYouMessage ? { thankYouMessage } : {}),
              },
            }
          : block;
        const polishedBlock = renderPolishedBlock({
          block: blockForRender,
          pageSlug: page.pageSlug,
          tenantId: page.tenantId,
          siteKey: page.tenantId,
          formDefinitions: page.formDefinitions,
          onContactSubmit: handleContactSubmit,
        });

        return (
          <section key={block.id ?? `block-${index}`} id={getSectionId(block)}>
            {polishedBlock ?? (
              <BlockViewRenderer
                block={block}
                classNames={classNames}
                approvedClasses={designSystem?.approvedClasses}
                overrides={{
                  Contact: {
                    onSubmit: (formData: Record<string, string>) =>
                      handleContactSubmit({
                        formId: 'contact',
                        pageSlug: page.pageSlug,
                        formData,
                      }),
                  },
                  formBlock: {
                    definitions: page.formDefinitions,
                    tenantId: page.tenantId,
                    siteKey: page.tenantId,
                    pageSlug: page.pageSlug,
                    onSubmit: handleContactSubmit,
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

function getPublicContactOverrides(page: Page) {
  const domainRouting = page.domainRouting;
  if (!domainRouting?.mailtoLinksEnabled || !domainRouting.publicContactEmail?.trim()) return {};

  return {
    email: domainRouting.publicContactEmail,
  };
}

function getSectionId(block: CmsBlock): string {
  const map: Record<string, string> = {
    Hero: 'hero',
    CardGrid: 'features',
    HowItWorks: 'how-it-works',
    FAQ: 'faq',
    Blog: 'blog',
    Contact: 'contact',
    formBlock: 'contact',
    Testimonials: 'testimonials',
    Gallery: 'gallery',
    ServiceAreaMap: 'service-area-map',
    PrimaryCTA: 'quote',
    SecondaryCTA: 'next-step',
  };

  return map[block.type] || block.id || block.type.toLowerCase();
}
