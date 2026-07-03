# Hybrid Rendering Strategy Lock

Decision: `hybrid-next-server-required-as-is`

Locked facts:

- Exact package rendering requires a Next server as-is.
- The normalized Pumpkin package can seed CMS data but does not guarantee exact source-app rendering.
- Static export is blocked as-is by the dynamic sitemap route and dynamic catch-all route.
- V2.8.59 should use hybrid parallel proof: CMS converted pages plus isolated Next source rendering where exact visual parity matters.
- No deploy occurred in V2.8.57.

Implication:

V2.8.58 can create the tenant records, but V2.8.59 must prove the rendering mode before V2.8.60 production cutover.

