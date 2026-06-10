# Publishing Impact Summary

Every action result writes `PUBLISHING_IMPACT.json`.

The summary includes:

- affected link count
- affected instance count
- affected page count
- affected domain count
- grouped page ids
- grouped domains
- grouped source types
- whether a static rebuild may be needed

The impact summary is a local planning artifact. It does not publish pages, re-render production pages, call CMS APIs, or trigger deployment.
