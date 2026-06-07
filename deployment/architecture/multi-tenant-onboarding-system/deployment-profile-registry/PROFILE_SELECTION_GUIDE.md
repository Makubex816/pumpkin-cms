# Profile Selection Guide

Choose `static-azure-cloudflare-worker-graph` when:

- the site can be statically exported
- media should be served through a Cloudflare Worker backed by Azure Blob
- forms should send through Microsoft Graph
- Cloudflare DNS is available

Choose another profile when:

- hosting is already dynamic
- Cloudflare Pages is preferred
- email delivery is not ready
- Azure is not the primary host

The profile decision should be made before import package validation because media and form URL expectations depend on it.

