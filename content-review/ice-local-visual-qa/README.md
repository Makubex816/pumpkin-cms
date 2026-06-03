# Ice Local Visual QA

Date: 2026-06-03

This folder documents the local preview QA readiness pass for IceSkatingRinkRentals.com after the PPEC homepage visual brand repair.

Scope:
- Probe local API/frontend status.
- Probe the local homepage draft preview route, contact route, and service-areas route.
- Verify homepage PPEC markers from the client preview shell plus the known CMS readback artifact.
- Verify contact route/readback markers.
- Provide a manual browser visual QA checklist for user approval.

Out of scope:
- No CMS writes or imports.
- No Theme or MediaAsset updates.
- No static generation.
- No deployment.
- No DNS, email, provider, Azure, Cloudflare, or Bluehost changes.
- No RollerRinkRentals.com work.
- No protected config reads.
- No screenshot, image-rendering, or image-generation tools.

Primary preview URLs:
- Homepage draft preview: `http://localhost:3002/__preview/ice-rink-rentals/home`
- Contact: `http://localhost:3002/contact`
- Service areas unchanged check: `http://localhost:3002/service-areas`

Important preview note:
- Public `/` was not used to judge the draft homepage.
- The homepage preview route returned a client preview shell. Manual browser review must load the local admin JWT in the browser session; the JWT is not included in these reports.

