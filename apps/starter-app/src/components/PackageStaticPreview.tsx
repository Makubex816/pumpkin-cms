import { PreviewBehaviorAdapter } from '@/components/PreviewBehaviorAdapter';
import { SessionOnlyAgeGate } from '@/components/SessionOnlyAgeGate';
import type {
  PackageStaticPreviewFixture,
  PackageStaticPreviewRoute,
} from '@/lib/preview-fixtures';
import { adaptPackageStaticHtmlForSite } from '@/lib/package-static-site';
import styles from './PackageStaticPreview.module.css';

interface PackageStaticPreviewProps {
  fixture: PackageStaticPreviewFixture;
  page: PackageStaticPreviewRoute;
  mode?: 'preview' | 'site';
  formsEnabled?: boolean;
}

export function PackageStaticPreview({
  fixture,
  page,
  mode = 'preview',
  formsEnabled = false,
}: PackageStaticPreviewProps) {
  const contentId = `package-preview-${fixture.tenantId}`;
  const html = mode === 'site'
    ? adaptPackageStaticHtmlForSite(page.html, fixture.tenantId)
    : page.html;
  const formMappings = fixture.forms.instances
    .filter((instance) => page.html.includes(`data-source-form-id="${instance.id}"`))
    .map((instance) => ({
      sourceFormId: instance.id,
      formKey: instance.normalizedFormKey,
      pageSlug: page.route,
    }));

  return (
    <>
      {page.stylesheets.map((stylesheet) => (
        <link href={stylesheet} key={stylesheet} rel="stylesheet" />
      ))}
      {page.inlineCss && <style dangerouslySetInnerHTML={{ __html: page.inlineCss }} />}
      <div
        aria-hidden={mode === 'preview' ? 'true' : undefined}
        className={styles.previewRoot}
        data-fixture-hash={fixture.integrity.fixtureSha256}
        data-preview-airstrip-links={page.counts.airstripLinks}
        data-preview-controls={page.counts.controls}
        data-preview-forms={page.counts.forms}
        data-preview-images={page.counts.images}
        data-preview-links={page.counts.links}
        data-form-mode={formsEnabled ? 'live-submit' : 'disabled-preview'}
        data-preview-mode={mode === 'preview' ? 'package-static-immutable-fixture' : undefined}
        data-site-mode={mode === 'site' ? 'package-static-immutable-fixture' : undefined}
        data-preview-route={page.route}
        data-preview-tenant={fixture.tenantId}
        id={contentId}
        inert={mode === 'preview'}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <PreviewBehaviorAdapter
        bodyClass={page.bodyClass}
        contentId={contentId}
        formMappings={formMappings}
        formsEnabled={formsEnabled}
        mode={mode}
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
