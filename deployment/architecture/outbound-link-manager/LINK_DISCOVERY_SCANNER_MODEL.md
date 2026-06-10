# Link Discovery Scanner Model

The scanner discovers outbound links by reading local or approved read-only content sources. It does not crawl external websites.

## Scan Sources

- page JSON;
- content blocks;
- rich text fields;
- navigation;
- footer;
- theme/config fields;
- reusable components;
- forms and help text;
- tenant import packages;
- backup bundles;
- tenant website bundles;
- static rendered output for future verification only.

## Scanner Pipeline

```text
source selection
  -> content reader
  -> URL extractor
  -> normalization
  -> tenant/site policy evaluation
  -> registry matching
  -> instance diff
  -> scan summary
  -> validation report
```

## Discovery Rules

- Local fake scans must work with fixtures and tenant bundles.
- Import package scans must run before publication gates.
- Backup bundle scans must support restore validation.
- Live-readonly scans require future explicit approval.
- Scanner must record tenant, site, page, field path, anchor text, block id, and context.
- Scanner must distinguish new, existing, missing, and stale instances.
- Scanner must never fetch the target URL during this phase.

## Extractor Types

- Structured URL fields.
- Markdown link syntax in approved text fields.
- HTML anchor tags inside trusted rich-text fields.
- Component props that are declared link-bearing fields.
- Theme/social/footer URL arrays.

Raw text scraping should be conservative. If a field is not declared link-bearing, the scanner may report a warning instead of inventing a link placement.

## Scan Results

A scan run should produce:

- pages scanned;
- links found;
- new links found;
- existing instances refreshed;
- stale instances found;
- blocked-domain findings;
- pending-review findings;
- extraction warnings;
- source references.
