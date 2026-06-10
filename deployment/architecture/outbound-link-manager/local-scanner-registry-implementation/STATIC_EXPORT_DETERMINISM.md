# Static Export Determinism

`static-export.html` is a deterministic local proof file.

The writer:

- sorts render decisions by page, instance, link, and action;
- escapes anchor text;
- writes one snippet per render decision;
- includes a stable HTML comment marker before each snippet;
- does not execute or evaluate HTML;
- does not include scripts;
- does not call external links.

The output is a proof artifact only. It is not a live website export and is not deployed.
