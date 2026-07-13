import { PreviewBehaviorAdapter } from '@/components/PreviewBehaviorAdapter';
import { SessionOnlyAgeGate } from '@/components/SessionOnlyAgeGate';
import type {
  PackageStaticPreviewFixture,
  PackageStaticPreviewRoute,
} from '@/lib/preview-fixtures';

interface PackageStaticPreviewProps {
  fixture: PackageStaticPreviewFixture;
  page: PackageStaticPreviewRoute;
}

export function PackageStaticPreview({ fixture, page }: PackageStaticPreviewProps) {
  const contentId = `package-preview-${fixture.tenantId}`;

  return (
    <>
      {page.stylesheets.map((stylesheet) => (
        <link href={stylesheet} key={stylesheet} rel="stylesheet" />
      ))}
      {page.inlineCss && <style dangerouslySetInnerHTML={{ __html: page.inlineCss }} />}
      <div
        aria-hidden="true"
        data-fixture-hash={fixture.integrity.fixtureSha256}
        data-preview-airstrip-links={page.counts.airstripLinks}
        data-preview-controls={page.counts.controls}
        data-preview-forms={page.counts.forms}
        data-preview-images={page.counts.images}
        data-preview-links={page.counts.links}
        data-preview-mode="package-static-immutable-fixture"
        data-preview-route={page.route}
        data-preview-tenant={fixture.tenantId}
        id={contentId}
        inert
      >
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
      <PreviewBehaviorAdapter
        bodyClass={page.bodyClass}
        contentId={contentId}
        tenantId={fixture.tenantId}
      />
      <SessionOnlyAgeGate
        contentId={contentId}
        siteName={fixture.siteName}
        tenantId={fixture.tenantId}
      />
    </>
  );
}
