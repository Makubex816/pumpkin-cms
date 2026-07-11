# Tenant Media Dependency Runbook V2.8.62CR

Build dependencies across HTML src/href/srcset, inline styles, CSS URLs, JavaScript strings, data attributes, JSON metadata, lazy loading, responsive sources, galleries, modals, filters, and fallback paths.

Use SHA-256 as canonical binary identity. Preserve every physical source path as an alias; never flatten filenames. A basename-only metadata reference may map conservatively to every matching preserved candidate when source context cannot distinguish same-name files.

Classify every unique hash as required static, required dynamic, optional owner asset, conclusively dead, or owner excluded. Unreferenced in an initial HTML scan is not proof of dead content. Keep optional owner assets unless the owner explicitly excludes them or dead-code proof is conclusive.

Before upload, require source/hash/alias reconciliation and browser image proof. After any future upload, require blob count, unique name, byte, and hash readback before MediaAsset creation. Storage keys, listKeys, and SAS remain prohibited unless separately approved.
