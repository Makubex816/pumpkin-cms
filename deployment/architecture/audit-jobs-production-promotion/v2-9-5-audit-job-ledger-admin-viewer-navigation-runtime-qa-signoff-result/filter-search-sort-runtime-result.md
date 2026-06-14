# Filter Search Sort Runtime Result

Status: passed by source/model QA.

Detected controls:

- Search input placeholder: `Search trace, evidence, gates`.
- Kind filter: `All records`.
- State filter: `All states`.
- Sort field state: `sortField`.
- Direction toggle labels: `Ascending` and `Descending`.

These controls remain local React state only and do not call a provider or API.
