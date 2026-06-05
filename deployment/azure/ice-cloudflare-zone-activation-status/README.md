# Ice Cloudflare Zone Activation Status

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Scope

This package documents the approved read-only Cloudflare zone activation/status verification.

No Cloudflare DNS records, rules, cache settings, CMS records, MediaAsset records, deployment settings, email/Microsoft 365 settings, protected config, generated static artifacts, or Roller assets were changed.

## Start-State Checks

Branch:

```text
feature/admin-page-editor-import-export
```

Latest relevant commit confirmed:

```text
61438f7 Document Ice Cloudflare nameserver propagation
```

The previous activation/status package existed before this update:

```text
PUMPKIN_ICE_CLOUDFLARE_ZONE_ACTIVATION_STATUS_REPORT.md
deployment/azure/ice-cloudflare-zone-activation-status/
```

Start-state worktree classification:

- expected Cloudflare activation docs: package and root report existed; they are the only files updated by this run
- unrelated static-azure backlog: modified files under `deployment/static-azure/`, left untouched
- unrelated Ice media delivery strategy backlog: modified files under `deployment/azure/ice-production-media-delivery-strategy/`, left untouched
- raw content-review input folders: untracked folders under `content-review/ice-final-contact-input/` and `content-review/ice-service-areas-input/`, left untouched
- generated artifacts: untracked zip/extracted preview/assets inside the content-review input folders, left untouched
- protected config risk: none observed in `git status`
- unexpected files: none beyond the classified backlog/input paths

## Result Summary

Credential presence check:

```text
CLOUDFLARE_API_TOKEN=PRESENT
CLOUDFLARE_ZONE_ID=PRESENT
```

No credential values or token values were printed.

Cloudflare API read-only zone result:

```text
zone name: iceskatingrinkrentals.com
zone status: active
assigned nameservers: amy.ns.cloudflare.com, bob.ns.cloudflare.com
```

Cloudflare API zone metadata still returned the legacy/original nameservers:

```text
ns1.bluehost.com
ns2.bluehost.com
```

Public DNS checks verified current delegation to Cloudflare from the local resolver, `1.1.1.1`, and `8.8.8.8`:

```text
amy.ns.cloudflare.com
bob.ns.cloudflare.com
```

DNS record safety audit from the allowed Cloudflare DNS record reads:

- root `A`: `66.81.203.198`, DNS only
- `www` `A`: `66.81.203.198`, DNS only
- `autodiscover` `CNAME`: `autodiscover.outlook.com`, DNS only
- `MX`: `iceskatingrinkrentals-com.mail.protection.outlook.com`, DNS only
- `TXT`: Microsoft verification and SPF records present
- `media.iceskatingrinkrentals.com`: no Cloudflare DNS record returned

## Readiness

- Static dry run completed: yes
- Static route output ready: yes
- Azure media files uploaded: yes
- Azure direct public Blob media readable: yes
- Cloudflare zone onboarded: yes
- Cloudflare zone active: yes
- Cloudflare media delivery configured: no
- Cloudflare public media URLs validated: no
- MediaAsset production URL readiness: no
- Media production URL readiness: no
- Contact form production readiness: no
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

## Files

- `CLOUDFLARE_ZONE_STATUS.md`
- `NAMESERVER_PROPAGATION_CHECK.md`
- `DNS_RECORD_SAFETY_AUDIT.md`
- `MEDIA_DELIVERY_NOT_STARTED.md`
- `NEXT_MEDIA_DELIVERY_APPROVAL_REQUIRED.md`
- `manifest.json`
