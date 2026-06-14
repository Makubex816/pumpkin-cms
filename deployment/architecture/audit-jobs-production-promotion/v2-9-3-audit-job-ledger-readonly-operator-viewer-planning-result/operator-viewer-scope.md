# Operator Viewer Scope

The V2.9.3 operator viewer is a read-only planning and local view-model layer.

## In Scope

- Local fixture input.
- Local validation result reuse.
- Derived summary fields.
- Required panels.
- Detail rows for audit events, job runs, promotion gates, and evidence bindings.
- Trace explorer model and local trace search.
- Warning, blocker, and next gate rows.
- Security boundary view.
- Admin/API/Electron contract planning.

## Out of Scope

- Admin runtime UI.
- Pumpkin API endpoint.
- Electron runtime.
- Live production inspection.
- Deployment or redeployment.
- DNS or custom domain mutation.
- Google/Search Console/indexing action.
- Sitemap submission.
- Crawling or outbound live link checking.
- Contact form submission or POST.
- CMS/provider/Azure writes.
- Protected config reads.
- Token, key, connection string, or SAS use.
