# Visual Source of Truth Classification

Decision: the discovered static package is the visual source of truth.

Reasons:

- the owner identified this exact ZIP as the tenant source;
- the archive name and structure indicate a finalized static presentation;
- it contains home, directory, detail, guide, policy, contact, and system pages;
- it includes the complete CSS/theme, logos, page media, navigation, form layouts, and responsive-oriented markup;
- internal QA artifacts and a sitemap are present;
- no competing visual package was supplied.

Separate visual-reference package required: no.

Conversion is still required. The package is compiled HTML rather than editable Pumpkin records. The compiler phase must preserve visual hierarchy while normalizing routes, deduplicating media, replacing unsafe form behavior, and withholding index/public-launch behavior.

One broken legacy route and the visible guide-count drift are source defects to repair in generated compiler output. The source ZIP itself must remain unchanged.
