# Scanner Result

The local scanner walks fixture JSON recursively and extracts URL candidates from:

- plain strings;
- declared link fields;
- HTML-like anchor snippets;
- markdown-style links;
- navigation/footer/theme fields;
- content block fields;
- import package fixture fields;
- tenant bundle fixture fields.

Proof scans:

| Fixture | Links | Instances | Ignored | Validation |
| --- | ---: | ---: | ---: | --- |
| `single-link.fixture.json` | 1 | 1 | 2 | passed |
| `tenant-bundle.fixture.json` | 5 | 5 | 1 | passed |

The scanner does not perform external HTTP crawling, DNS lookups, redirects, CMS/API calls, or protected config reads.
