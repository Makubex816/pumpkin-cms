# Render Validator

The render validator checks:

- render output JSON parses;
- render report JSON parses;
- `static-export.html` exists and does not contain script tags;
- render decisions are tenant/site scoped;
- render decisions reference known links and instances;
- render actions and reason codes are allowed;
- active anchors include `noopener noreferrer`;
- disabled global links do not render active anchors;
- disabled, hidden, plain-text, pending-review, or stale instances do not render active anchors;
- domain-blocked links do not render active anchors;
- pending-review links do not render active anchors by default;
- hidden and plain-text decisions do not output anchor markup;
- fallback decisions render the configured fallback URL;
- output stays under `.tmp`.

Command:

```powershell
node src/outbound-link-cli.mjs validate-render --rendered .tmp/render-active
```
