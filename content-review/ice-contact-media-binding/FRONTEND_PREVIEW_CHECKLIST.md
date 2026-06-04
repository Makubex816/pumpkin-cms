# Frontend Preview Checklist

Frontend probes:

| Route | URL | Status | Reachable |
| --- | --- | --- | --- |
| contactPreview | http://localhost:3002/__preview/ice-rink-rentals/contact | 200 | yes |
| homepage | http://localhost:3002/ | 200 | yes |
| serviceAreas | http://localhost:3002/service-areas | 200 | yes |

Review:

- Open `http://localhost:3002/__preview/ice-rink-rentals/contact`.
- Paste a local admin JWT in the preview form.
- Confirm hero, quote planning, setup/logistics media, PPEC partner block, and formBlock render.
- Public homepage and /service-areas should still render normally.
