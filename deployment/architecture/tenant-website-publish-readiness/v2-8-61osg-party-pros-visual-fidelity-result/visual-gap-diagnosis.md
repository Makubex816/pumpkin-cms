# Visual Gap Diagnosis

Root cause: the deployed bundle-only Party Pros fixture was built for technical preview proof, not visual parity. Its theme had no custom CSS path, the starter forced preview fixtures onto `pumpkin-default.css`, and the renderer supported only the shallow generic block set.

Exact gaps found:

- wrong page titles and H1 content;
- wrong orange-gradient hero and hero images;
- missing announcement bar and brand subtitle;
- nav and footer substantially simpler than the reference;
- only three featured cards instead of category and event catalogs;
- missing direct-answer band, search-link sections, service-area hierarchy, and final CTA;
- generic contact layout and ignored form field widths;
- platform title suffix on tenant pages;
- no fixture-selectable tenant theme stylesheet.

No media upload or CMS mutation was required. Every one of the 20 distinct image filenames used by the three reference pages already existed under the public Party Pros blob prefix and returned HTTP 200.
