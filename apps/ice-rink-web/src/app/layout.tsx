import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import type { FooterClassNames, HeaderClassNames } from 'pumpkin-block-views';
import { DesignSystemStyles } from '@/components/DesignSystemStyles';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getFallbackTheme } from '@/data';
import { getThemeForRender } from '@/lib/content-source';
import { resolveSite } from '@/lib/resolve-site';
import { replaceSiteTokens } from '@/lib/token-replace';
import { buildDefaultMetadata } from '@/lib/metadata';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const site = resolveSite();
  return buildDefaultMetadata(site);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = resolveSite();
  const theme = replaceSiteTokens((await getThemeForRender(site)) ?? getFallbackTheme(site), site);

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white" data-tenant-id={site.tenantId} data-domain={site.domain}>
        <DesignSystemStyles theme={theme} tenantId={site.tenantId} domain={site.domain} />
        <SiteHeader
          header={theme.header}
          menu={theme.menu}
          classNames={theme.header.classNames as HeaderClassNames}
        />
        <main>{children}</main>
        <SiteFooter
          footer={theme.footer}
          menu={theme.menu}
          logoUrl={theme.header.logoUrl}
          logoAlt={theme.header.logoAlt || site.brand}
          classNames={theme.footer.classNames as FooterClassNames}
        />
      </body>
    </html>
  );
}
