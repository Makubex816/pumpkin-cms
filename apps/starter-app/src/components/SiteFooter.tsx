'use client';

import type { FooterClassNames } from 'pumpkin-block-views';
import { FooterView } from 'pumpkin-block-views';
import type { MenuItem, ThemeFooter } from 'pumpkin-ts-models';
import type { SiteChromeConfig } from '@/lib/site-chrome';
import { getSafeSiteHref } from '@/lib/site-chrome';

interface SiteFooterProps {
  footer: ThemeFooter;
  menu: MenuItem[];
  logoUrl?: string;
  logoAlt?: string;
  classNames?: FooterClassNames;
  chrome?: SiteChromeConfig;
}

export function SiteFooter({ footer, menu, logoUrl, logoAlt, classNames, chrome }: SiteFooterProps) {
  if (chrome?.variant === 'catalog') {
    return <CatalogFooter footer={footer} logoAlt={logoAlt} chrome={chrome} />;
  }

  return (
    <FooterView
      footer={footer}
      menu={menu}
      logoUrl={logoUrl}
      logoAlt={logoAlt}
      classNames={classNames}
    />
  );
}

function CatalogFooter({
  footer,
  logoAlt,
  chrome,
}: {
  footer: ThemeFooter;
  logoAlt?: string;
  chrome: SiteChromeConfig;
}) {
  const details = chrome.footer;
  const copyright = footer.copyright.replace(/\{year\}/gi, String(new Date().getFullYear()));

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h2>{details?.brandName || logoAlt}</h2>
          {details?.description && <p>{details.description}</p>}
          {details?.phoneLabel && (
            <p><a href={getSafeSiteHref(details.phoneUrl)}>{details.phoneLabel}</a></p>
          )}
          {details?.address && <p><strong>Mailing address:</strong> {details.address}</p>}
          {details?.note && <p className="small">{details.note}</p>}
        </div>
        {(details?.columns ?? []).map((column) => (
          <div key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <a href={getSafeSiteHref(link.url)} key={`${column.title}-${link.label}`}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      {copyright && <div className="container footer-copyright">{copyright}</div>}
    </footer>
  );
}
