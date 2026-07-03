# Pumpkin Airstrip Hybrid Rendering Strategy V2.8.57

Decision: `hybrid-next-server-required-as-is`

Strategy:

- Use the normalized package for Pumpkin CMS tenant records.
- Use isolated Next source rendering for exact visual proof where needed.
- Do not assume static export can represent the source package as-is.
- V2.8.59 should run hybrid parallel proof before any V2.8.60 production cutover.

Static export remains blocked by the dynamic sitemap route and dynamic catch-all route until a later source refactor is approved.

