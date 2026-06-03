# Missing Media Requirements

| Area | Status | Requirement or blocker |
| --- | --- | --- |
| Homepage planning-topics card media stubs | non-blocking | The live homepage contains empty nested media objects for planning-topic/card metadata. They are not the current renderer image slots and do not require uploads before local planning continues. |
| Homepage split-feature nested card media stubs | non-blocking | The primary split-feature media objects are bound to official assets; nested supporting-card media stubs remain empty and are not currently rendered as image slots. |
| Contact readback MediaAsset IDs | review before production | The validated contact candidate has official MediaAsset IDs, while the CMS readback keeps page-level assetId/publicUrl values and omits mediaAssetId on those page-level fields. Do not change contact in this run; reconfirm if contact is promoted later. |
| Contact PPEC logo | not required | The contact PPEC/support callout is text-only. If a logo is added later, reuse the existing PPEC MediaAsset instead of uploading another copy. |
| Service-areas final CTA image | not required for current candidate | The final CTA block is text-first and has no block-level media slot. The page-level closingImage is already bound to the holiday asset if a visual fallback is needed later. |
| New upload requirements | none | No current required slot needs a new MediaAsset. Reuse the six approved MediaAssets listed in the canonical map. |

## Placeholder And Wrong-Asset Checks

- Empty homepage nested card media stubs: found, non-blocking, not treated as visible image slots.
- Empty contact PPEC logo media: no required image slot exists.
- Empty service-areas final CTA image: no required block-level image slot exists.
- Null MediaAsset IDs in required service-areas slots: none found in the normalized candidate.
- Placeholder/external/base64 image URLs in service-areas candidate: none reported by existing service-areas media review.
- Wrong or old PPEC logo ID in current homepage live source: not found. Current expected ID is `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`.

## New Upload Requirements

None for local draft import planning.
