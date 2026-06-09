# Standard Backup Scope

## Future Bundle Type

The future execution should create a tenant-scoped standard backup bundle for `ice-rink-rentals`.

The expected bundle shape follows the Backup Center standard contract:

```text
manifest.json
checksums.sha256
BACKUP_SUMMARY.md
VALIDATION_RESULT.md
RESTORE_INSTRUCTIONS.md
database/
cms-content/
media/
static/
config-inventory/
escrow/ESCROW_NOT_INCLUDED.md
```

## Required Included Areas

| Area | Required Contents |
| --- | --- |
| CMS tenant/site | tenant record, site record, domains, status, published state |
| Pages/routes/content | approved routes, page content, page metadata, route map, publish flags |
| Forms | form definitions and recipient references without delivery secrets |
| SEO | titles, descriptions, canonicals, robots fields, sitemap inclusion flags |
| Redirect/theme/settings | redirect rules, theme references, site settings safe for standard backup |
| MediaAsset metadata | media IDs, public URLs, alt text, dimensions if available, content type, references |
| Media inventory/copies | inventory always; blob copies only if separately approved in execution |
| Static evidence | route proof, sitemap/robots snapshots, validator outputs, static manifest evidence |
| Database | approved Azure SQL platform backup evidence or encrypted portable export artifact |
| Config inventory | env/config names and presence only, no values |
| Validation | manifest validation, checksum verification, standard-mode secret scan, restore dry-run |
| Restore docs | restore instructions and dry-run restore validation report |

## Explicit Standard-Mode Exclusions

The standard backup must not include:

- raw API keys;
- JWTs;
- auth headers;
- cookies;
- Azure tokens;
- Cloudflare tokens;
- Microsoft Graph secrets;
- storage keys;
- connection strings;
- SMTP passwords;
- deployment tokens;
- protected config file contents;
- encrypted escrow payloads;
- decrypted escrow values;
- raw `content-review` input folders;
- ignored `.tmp` generated output staged into git.

## Expected Result

The future bundle should be useful for restore planning and audit evidence, but it must not be a secret recovery package. Secret recovery remains a separate encrypted escrow approval path.
