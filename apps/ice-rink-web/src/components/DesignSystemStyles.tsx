import type { Theme } from 'pumpkin-ts-models';
import { buildThemeTokenCssVariables, validateCss } from 'pumpkin-ts-models';

interface DesignSystemStylesProps {
  theme: Theme;
  tenantId: string;
  domain: string;
}

export function DesignSystemStyles({ theme, tenantId, domain }: DesignSystemStylesProps) {
  const designSystem = theme.designSystem;
  if (!designSystem) return null;

  const scope = `[data-tenant-id="${tenantId}"]`;
  const tokenCss = buildThemeTokenCssVariables(designSystem.tokens);
  const domainCssResult = designSystem.domainCss
    ? validateCss(designSystem.domainCss, {
        mode: 'domainCss',
        tenantId,
        domain,
        approvedClasses: designSystem.approvedClasses,
        path: 'theme.designSystem.domainCss',
      })
    : null;

  const templateCss = Object.entries(designSystem.templateCss || {})
    .map(([variant, css]) => {
      const result = validateCss(String(css || ''), {
        mode: 'templateCss',
        sectionVariant: variant,
        approvedClasses: designSystem.approvedClasses,
        path: `theme.designSystem.templateCss.${variant}`,
      });
      return result.ok ? result.sanitizedCss || '' : '';
    })
    .filter(Boolean)
    .join('\n');

  const css = [
    tokenCss ? `${scope} {\n${tokenCss}\n}` : '',
    domainCssResult?.ok ? domainCssResult.sanitizedCss || '' : '',
    templateCss,
  ].filter(Boolean).join('\n\n');

  if (!css) return null;

  return <style data-cms-design-system={tenantId} dangerouslySetInnerHTML={{ __html: css }} />;
}
