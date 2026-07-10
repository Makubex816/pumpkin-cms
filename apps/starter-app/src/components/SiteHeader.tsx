'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { HeaderClassNames } from 'pumpkin-block-views';
import { HeaderView } from 'pumpkin-block-views';
import type { MenuItem, ThemeHeader } from 'pumpkin-ts-models';
import type { SiteChromeConfig } from '@/lib/site-chrome';
import { getSafeSiteHref } from '@/lib/site-chrome';

interface SiteHeaderProps {
  header: ThemeHeader;
  menu: MenuItem[];
  classNames?: HeaderClassNames;
  chrome?: SiteChromeConfig;
}

export function SiteHeader({ header, menu, classNames, chrome }: SiteHeaderProps) {
  if (chrome?.variant === 'catalog') {
    return <CatalogHeader header={header} menu={menu} chrome={chrome} />;
  }

  return <HeaderView header={header} menu={menu} classNames={classNames} />;
}

function CatalogHeader({
  header,
  menu,
  chrome,
}: {
  header: ThemeHeader;
  menu: MenuItem[];
  chrome: SiteChromeConfig;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [...menu]
    .filter((item) => item.isVisible)
    .sort((left, right) => left.order - right.order);
  const announcement = chrome.announcement;

  return (
    <>
      {announcement && (announcement.text || announcement.linkText) && (
        <div className="topbar">
          <div className="container">
            <div>{announcement.text}</div>
            {announcement.linkText && (
              <a href={getSafeSiteHref(announcement.linkUrl)}>{announcement.linkText}</a>
            )}
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="container header-row">
          <a aria-label={`${header.logoAlt} home`} className="brand" href="/">
            {header.logoUrl && <img alt={header.logoAlt} src={header.logoUrl} />}
            <span>
              <span className="brand-name">{header.logoAlt}</span>
              {chrome.brandSubtitle && <span className="brand-sub">{chrome.brandSubtitle}</span>}
            </span>
          </a>

          <nav aria-label="Primary navigation" className="desktop-nav">
            {items.map((item) => (
              <a href={getSafeSiteHref(item.url)} key={item.label} target={item.target || '_self'}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            {header.ctaText && (
              <a className="btn btn-primary btn-small" href={getSafeSiteHref(header.ctaUrl)}>
                {header.ctaText}
              </a>
            )}
            <button
              aria-controls="catalog-mobile-nav"
              aria-expanded={mobileOpen}
              className="menu-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              title={mobileOpen ? 'Close menu' : 'Open menu'}
              type="button"
            >
              {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
              <span className="visually-hidden">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="mobile-nav is-open" id="catalog-mobile-nav">
            <div className="container">
              {items.map((item) => (
                <a href={getSafeSiteHref(item.url)} key={item.label} target={item.target || '_self'}>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
