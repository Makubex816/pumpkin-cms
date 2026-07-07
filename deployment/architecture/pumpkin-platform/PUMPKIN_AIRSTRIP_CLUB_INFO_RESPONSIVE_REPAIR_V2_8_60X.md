# Pumpkin Airstrip Club Info Responsive Repair V2.8.60X

V2.8.60X repaired the Airstrip `/airstrip-the-club` mobile overflow blocker found by the V2.8.60V responsive checker.

Repair:

- Added `deployment/airstrip/patches/v2-8-60x-club-info-responsive/`.
- Apply after `deployment/airstrip/patches/v2-8-60r-mobile-responsive/`.
- The overlay constrains `.as-club-info-grid`, `.as-club-grid`, and `.as-amen-grid` at tablet/mobile widths.
- The overlay adds wrapping/min-width constraints for club-page card and info text.

Proof:

- Before production replay: 5 overflow failures.
- Local after repair: 28/28 valid, 0 overflow.
- Isolated after deploy: 28/28 valid, 0 overflow.
- Production after deploy: 28/28 valid, 0 overflow.

Production deployment:

- App Service: `app-airstrip-prod-centralus-001`.
- Deployment ID: `dfc54ec4-ea78-4358-9567-a3badc9e98fe`.
- Status: `RuntimeSuccessful`.

No DNS/custom-domain/indexing/contact/form/content/media mutation occurred.
