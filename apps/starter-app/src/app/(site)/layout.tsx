import type { FooterClassNames, HeaderClassNames } from 'pumpkin-block-views';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getHostTenantPreviewSite } from '@/lib/host-tenant-routing';
import { getSiteTheme } from '@/lib/pumpkin-api';
import { getSiteChrome } from '@/lib/site-chrome';
import { getThemeCssPath } from '@/themes/registry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const hostTenantSite = await getHostTenantPreviewSite();
  const theme = hostTenantSite?.site?.theme ?? await getSiteTheme();
  const chrome = getSiteChrome(theme);

  return (
    <>
      <link rel="stylesheet" href={getThemeCssPath(theme)} />
      {theme.header.logoUrl && <link rel="icon" href={theme.header.logoUrl} />}
      <SiteHeader
        header={theme.header}
        menu={theme.menu}
        classNames={theme.header.classNames as HeaderClassNames}
        chrome={chrome}
      />
      <main
        data-host-tenant={hostTenantSite?.route.tenantId}
        data-host-tenant-source={hostTenantSite?.route.source}
        data-form-mode={hostTenantSite?.route.formsMode}
      >
        {children}
      </main>
      <SiteFooter
        footer={theme.footer}
        menu={theme.menu}
        logoUrl={theme.header.logoUrl}
        logoAlt={theme.header.logoAlt}
        classNames={theme.footer.classNames as FooterClassNames}
        chrome={chrome}
      />
    </>
  );
}
