# Ice Homepage Render Diagnostic

This package explains why the local Ice frontend at http://localhost:3002/ is showing the simplified homepage instead of the redesigned, media-rich homepage candidate.

Diagnostic scope:

- Read-only inspection only.
- No CMS Page records were updated.
- No CMS Theme records were updated.
- No MediaAsset records were created or changed.
- No static packages were regenerated.
- No deployment, Azure, Cloudflare, DNS, Microsoft 365, Bluehost, or email-provider action was taken.
- Protected config was not read.
- RollerRinkRentals.com remains paused.

Primary finding:

The redesigned homepage appears in the local CMS draft readback artifact, but the public Ice frontend renders through the published-page API path. The redesigned homepage is still a draft, so the frontend is displaying the older published homepage.

Secondary finding:

The draft media URLs are available from the Pumpkin API media host, but the Next frontend host does not serve or proxy /media paths, so image URLs would 404 on localhost:3002 even after the rich draft is rendered.
