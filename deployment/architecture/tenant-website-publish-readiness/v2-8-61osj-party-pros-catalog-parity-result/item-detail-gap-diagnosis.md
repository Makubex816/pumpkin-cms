# Item Detail Gap Diagnosis

The live item links were correct, but the prior fixture reduced the static item pages to a hero and CTA. Reference-backed specifications, examples, direct answers, planning notes, FAQ, related items, and supporting images were not represented as renderable blocks.

OSJ added a generic `ItemDetail` renderer and compiled the static HTML evidence into structured fixture values. It renders:

- primary image, description, and source-backed stats;
- example or use-case lists when present;
- direct answers;
- related item cards and quote-cart controls;
- planning notes and related planning links;
- FAQ content when present.

No price, capacity, safety claim, included item, delivery promise, or other commercial copy was invented. Three item pages have no reference stats and intentionally render without a stats group.

Proof:

- local item routes: 214/214 passed;
- live item routes: 214/214 passed;
- representative Dunk Tank page: 4 stats, 5 FAQ entries, and 11 related items;
- title and H1 matched fixture source across all 301 pages.
