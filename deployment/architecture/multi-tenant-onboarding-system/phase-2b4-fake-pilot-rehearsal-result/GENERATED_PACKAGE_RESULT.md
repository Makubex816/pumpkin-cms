# Generated Package Result

Command:

```powershell
node src/builder-cli.mjs --answers fixtures/fake-pilot-example-event-rentals.answers.json --out .tmp/fake-pilot-example-event-rentals --overwrite --validate --support-packet
```

Result:

- builder status: passed
- builder stage: complete
- files planned: 13
- files written: 13
- validator status: passed
- validator errors: 0
- validator warnings: 0
- support packet redaction: passed
- support files checked by redaction scan: 6

Generated files:

- `README.md`
- `manifest.json`
- `tenant.json`
- `site.json`
- `routes.json`
- `pages/home.json`
- `pages/contact.json`
- `pages/service-areas.json`
- `media-assets.json`
- `forms.json`
- `seo.json`
- `theme.json`
- `redirects.json`

Audit findings:

- package identity is `example-event-rentals`
- domains match the fake tenant profile
- deployment profile is present as metadata only
- approved routes normalize with trailing slashes
- forbidden routes include requested forbidden routes plus default `/old/`
- media references are declared and valid
- form reference is declared and valid
- generated SEO keeps `noindex,nofollow`
- sitemap policy remains `disabled-until-final-gate`
- `indexingFinalGate` remains `true`
- `manifest.validation.externalMutationAllowed` remains `false`
