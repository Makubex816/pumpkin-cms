# PPEC Renderer Repair

- Added PPEC-specific renderer variant: `ppecPartnerBand`.
- Added semantic CSS classes: `ice-section--ppec-partner`, `ppec-partner-band`, `ppec-partner-card`, `ppec-partner-logo`, `ppec-partner-copy`, `ppec-partner-cta`, and `ppec-button`.
- Renderer uses the existing PPEC logo MediaAsset URL from CMS JSON.
- Primary CTA prefers the approved Party Pros East Coast URL when present with source metadata.
- If no approved URL exists, the renderer shows a disabled approval-needed state rather than a fake link.
