import { BookOpen } from 'lucide-react';
import { getSafeSiteHref } from '@/lib/site-chrome';

interface BlogCard {
  kicker?: unknown;
  title?: unknown;
  description?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  link?: unknown;
  tags?: unknown;
}

interface BlogSection {
  heading?: unknown;
  paragraphs?: unknown;
  bullets?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  imageCaption?: unknown;
  faq?: unknown;
}

interface FaqItem {
  question?: unknown;
  answer?: unknown;
}

interface LinkItem {
  label?: unknown;
  url?: unknown;
}

export function BlogIndexBlock({ content }: { content: Record<string, unknown> }) {
  const posts = getRecords<BlogCard>(content.posts);

  return (
    <section className="section section-white blog-index" data-blog-index="true">
      <div className="container">
        {getText(content.kicker) && <div className="section-kicker">{getText(content.kicker)}</div>}
        <h2 className="section-title">{getText(content.title) || 'Party Pros planning guides'}</h2>
        {getText(content.description) && <p className="section-description">{getText(content.description)}</p>}
        <div className="blog-card-grid" data-blog-card-count={posts.length}>
          {posts.map((post, index) => {
            const title = getText(post.title);
            const tags = getStrings(post.tags);
            return (
              <a
                className="item-card blog-post-card"
                href={getSafeSiteHref(getText(post.link), '/blog')}
                key={`${getText(post.link)}-${index}`}
              >
                {getSafeImageUrl(post.image) && (
                  <img alt={getText(post.imageAlt) || title} loading="lazy" src={getSafeImageUrl(post.image)} />
                )}
                <div className="item-card-body">
                  {getText(post.kicker) && <div className="section-kicker">{getText(post.kicker)}</div>}
                  <h3>{title}</h3>
                  {getText(post.description) && <p>{getText(post.description)}</p>}
                  {tags.length > 0 && <div className="item-stats">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                  <span className="catalog-card-link"><BookOpen aria-hidden="true" size={16} /> Read guide</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BlogArticleBlock({ content }: { content: Record<string, unknown> }) {
  const sections = getRecords<BlogSection>(content.sections);
  const relatedLinks = getRecords<LinkItem>(content.relatedLinks);
  const directAnswer = getText(content.directAnswer);

  return (
    <article className="section section-white blog-article" data-blog-article="true">
      <div className="container blog-article-layout">
        <div className="blog-article-main">
          {directAnswer && (
            <div className="answer-box blog-answer-box">
              <strong>Direct answer: </strong>{directAnswer.replace(/^Direct answer:\s*/i, '')}
            </div>
          )}

          {sections.map((section, index) => {
            const paragraphs = getStrings(section.paragraphs);
            const bullets = getStrings(section.bullets);
            const faq = getRecords<FaqItem>(section.faq);
            const image = getSafeImageUrl(section.image);
            return (
              <section className="blog-article-section" key={`${getText(section.heading)}-${index}`}>
                {getText(section.heading) && <h2>{getText(section.heading)}</h2>}
                {image && (
                  <figure className="blog-image-band">
                    <img alt={getText(section.imageAlt)} loading="lazy" src={image} />
                    {getText(section.imageCaption) && <figcaption>{getText(section.imageCaption)}</figcaption>}
                  </figure>
                )}
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {bullets.length > 0 && <ul>{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {faq.length > 0 && (
                  <div className="blog-faq">
                    {faq.map((item, faqIndex) => (
                      <article className="faq-item" key={`${getText(item.question)}-${faqIndex}`}>
                        <h3>{getText(item.question)}</h3>
                        <p>{getText(item.answer)}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {relatedLinks.length > 0 && (
          <aside className="blog-sidebar" aria-label="Related Party Pros pages">
            <div className="section-kicker">Related pages</div>
            <div className="related-grid">
              {relatedLinks.map((link, index) => (
                <a href={getSafeSiteHref(getText(link.url), '/blog')} key={`${getText(link.label)}-${index}`}>
                  {getText(link.label)}
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}

function getSafeImageUrl(value: unknown) {
  const candidate = getText(value);
  return /^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/') ? candidate : '';
}

function getStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function getRecords<T>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((item): item is T => Boolean(item) && typeof item === 'object')
    : [];
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
