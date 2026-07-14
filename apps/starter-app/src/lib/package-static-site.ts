export function adaptPackageStaticHtmlForSite(html: string, tenantId: string) {
  const previewPrefix = `/preview/${tenantId}`;

  return html
    .replace(/\b(href|action)=(['"])([^'"]*)\2/gi, (attribute, name, quote, value) => {
      if (value === previewPrefix) return `${name}=${quote}/${quote}`;
      if (value.startsWith(`${previewPrefix}/`)) {
        return `${name}=${quote}${value.slice(previewPrefix.length)}${quote}`;
      }
      return attribute;
    })
    .replace(/\sdata-preview-external=(['"])held\1/gi, '');
}
