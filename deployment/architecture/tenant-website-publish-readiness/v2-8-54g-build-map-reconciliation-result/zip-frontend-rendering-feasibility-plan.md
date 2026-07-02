# ZIP Frontend Rendering Feasibility Plan

Goal: determine whether Pumpkin can render or reproduce the uploaded Airstrip frontend package as intended.

Package shape detection:

- Static HTML artifact: look for `index.html`, route HTML files, CSS/JS assets, image folders, and relative links.
- Next.js source: look for `next.config.*`, `app/`, `pages/`, `.next` expectation, and `package.json` scripts.
- React/Vite source: look for `vite.config.*`, `src/`, `public/`, and build scripts.
- Static export: look for `out/`, `dist/`, or prebuilt asset folders.
- CMS export: look for tenant/page/theme/form manifests.
- Unknown: quarantine for manual inspection.

Feasibility options:

| option | exact rendering likelihood | Pumpkin editability | risk |
| --- | --- | --- | --- |
| Static artifact passthrough | high if self-contained | low | Hosting and contact integration may be separate from CMS records. |
| Build source to static artifact | medium | low to medium | Requires isolated dependency install/build and license/security review. |
| Convert to Pumpkin Pages/Themes/Forms | medium to low | high | Visual drift likely unless conversion rules are strong. |
| Hybrid static shell plus Pumpkin forms/media | medium | medium | Requires route and asset ownership decisions. |

Future proof checks:

- Run public secret scan before executing any package scripts.
- Inspect package manifest and dependency files without installing first.
- Validate routes, assets, fonts, forms, and contact endpoints locally.
- Compare local rendering screenshots against expected package screenshots if provided.
- Decide passthrough, conversion, or hybrid before tenant creation.

