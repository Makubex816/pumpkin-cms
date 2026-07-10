'use client';

import type { BlockClassNamesMap, FormBlockSubmitPayload } from 'pumpkin-block-views';
import { BlockViewRenderer } from 'pumpkin-block-views';
import type { BlockStyleMap, ContactBlock, FormDefinition, IHtmlBlock, Page } from 'pumpkin-ts-models';
import { ContactFormBlock } from '@/components/ContactFormBlock';

interface CmsBlock extends IHtmlBlock {
  id?: string;
  enabled?: boolean;
}

interface PageRendererProps {
  page: Page;
  blockStyles?: BlockStyleMap;
  formDefinitions?: Record<string, FormDefinition>;
  previewMode?: boolean;
  tenantId?: string;
  siteKey?: string;
}

export function PageRenderer({
  page,
  blockStyles,
  formDefinitions = {},
  previewMode = false,
  tenantId = page.tenantId,
  siteKey = tenantId,
}: PageRendererProps) {
  const blocks = (page.ContentData.ContentBlocks as CmsBlock[])
    .filter((block) => block.enabled !== false)
    .map(withRenderableMedia);
  const classNames = normalizeClassNames(blockStyles ?? {});

  return (
    <>
      {blocks.map((block, index) => (
        <section key={block.id ?? `${block.type}-${index}`} id={getSectionId(block)}>
          {block.type === 'Contact' ? (
            <ContactFormBlock
              block={block as ContactBlock}
              classNames={classNames.Contact}
              formDefinition={getFormDefinition(block, formDefinitions)}
              pageSlug={page.pageSlug}
              previewMode={previewMode}
            />
          ) : (
            <BlockViewRenderer
              block={block}
              classNames={classNames}
              overrides={{
                Blog: {
                  renderBody: (body) => (
                    <div dangerouslySetInnerHTML={{ __html: body }} />
                  ),
                },
                formBlock: {
                  definitions: Object.values(formDefinitions),
                  tenantId,
                  siteKey,
                  pageSlug: page.pageSlug,
                  onSubmit: previewMode ? previewFormNoop : submitForm,
                },
              }}
              fallback={
                <div className="mx-auto max-w-3xl px-8 py-12 text-center text-sm text-neutral-500">
                  Unknown block type: {block.type}
                </div>
              }
            />
          )}
        </section>
      ))}
    </>
  );
}

interface MediaReference {
  publicUrl?: unknown;
  url?: unknown;
  alt?: unknown;
  title?: unknown;
  caption?: unknown;
  description?: unknown;
}

function withRenderableMedia(block: CmsBlock): CmsBlock {
  if (!block.content || typeof block.content !== 'object') return block;

  const content = block.content as Record<string, unknown>;

  if (block.type === 'Hero' || block.type === 'PrimaryCTA') {
    const media = getMediaReference(content.media);
    const url = getSafeImageUrl(media);
    if (!url || hasText(content.mainImage)) return block;

    return {
      ...block,
      content: {
        ...content,
        mainImage: url,
        mainImageAltText: hasText(content.mainImageAltText)
          ? content.mainImageAltText
          : getMediaAlt(media),
      },
    };
  }

  if (block.type === 'CardGrid' && Array.isArray(content.cards)) {
    return {
      ...block,
      content: {
        ...content,
        cards: content.cards.map((card) => withCardMedia(card)),
      },
    };
  }

  if (block.type === 'HowItWorks' && Array.isArray(content.steps)) {
    return {
      ...block,
      content: {
        ...content,
        steps: content.steps.map((step) => withStepMedia(step)),
      },
    };
  }

  return block;
}

function withCardMedia(card: unknown) {
  if (!card || typeof card !== 'object') return card;

  const record = card as Record<string, unknown>;
  const media = getMediaReference(record.media);
  const url = getSafeImageUrl(media);
  if (!url || hasText(record.image)) return card;

  return {
    ...record,
    image: url,
    'image-alt': hasText(record['image-alt']) ? record['image-alt'] : getMediaAlt(media),
  };
}

function withStepMedia(step: unknown) {
  if (!step || typeof step !== 'object') return step;

  const record = step as Record<string, unknown>;
  const media = getMediaReference(record.media);
  const url = getSafeImageUrl(media);
  if (!url || hasText(record.image)) return step;

  return {
    ...record,
    image: url,
    alt: hasText(record.alt) ? record.alt : getMediaAlt(media),
  };
}

function getMediaReference(value: unknown): MediaReference | null {
  if (!value || typeof value !== 'object') return null;
  return value as MediaReference;
}

function getSafeImageUrl(media: MediaReference | null) {
  if (!media) return '';

  const candidate = pickText(media.publicUrl) || pickText(media.url);
  if (!candidate) return '';

  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/')) {
    return candidate;
  }

  return '';
}

function getMediaAlt(media: MediaReference | null) {
  if (!media) return '';

  return (
    pickText(media.alt)
    || pickText(media.title)
    || pickText(media.caption)
    || pickText(media.description)
  );
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeClassNames(blockStyles: BlockStyleMap): BlockClassNamesMap {
  const classNames = blockStyles as BlockClassNamesMap & {
    Form?: BlockClassNamesMap['formBlock'];
  };

  return {
    ...classNames,
    formBlock: classNames.formBlock ?? classNames.Form,
  };
}

function getFormDefinition(block: CmsBlock, formDefinitions: Record<string, FormDefinition>) {
  const formType = (block.content as { formType?: string } | undefined)?.formType;
  if (!formType) return undefined;

  return formDefinitions[formType.trim().toLowerCase()];
}

function getSectionId(block: CmsBlock) {
  const ids: Record<string, string> = {
    Hero: 'hero',
    CardGrid: 'features',
    HowItWorks: 'how-it-works',
    FAQ: 'faq',
    Blog: 'blog',
    Contact: 'contact',
    Form: 'contact',
    Testimonials: 'testimonials',
    Gallery: 'gallery',
  };

  return ids[block.type] ?? block.id ?? block.type.toLowerCase();
}

async function submitForm(payload: FormBlockSubmitPayload) {
  const response = await fetch(`/api/forms/submit/${encodeURIComponent(payload.formType.trim().toLowerCase())}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload.formData,
      formKey: payload.formKey,
      pageSlug: payload.pageSlug,
      sourcePage: payload.sourcePage,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

async function previewFormNoop() {
  throw new Error('Preview mode: form submission is disabled.');
}

async function getErrorMessage(response: Response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text) as { message?: string; detail?: string; title?: string };
    return data.message || data.detail || data.title || text || 'The form could not be submitted.';
  } catch {
    return text || 'The form could not be submitted.';
  }
}
