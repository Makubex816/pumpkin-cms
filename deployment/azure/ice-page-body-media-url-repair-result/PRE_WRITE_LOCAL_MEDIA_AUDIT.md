# Pre-Write Local Media Audit

Before the active page body/media repair, the latest static output still contained local media URLs in the six strict-validator files:

| Route | Files | Occurrences | Unique local URLs |
| --- | --- | ---: | ---: |
| `/` | `index.html`, `index.txt` | 52 per file | 6 |
| `/contact` | `contact/index.html`, `contact/index.txt` | 50 per file | 8 |
| `/service-areas` | `service-areas/index.html`, `service-areas/index.txt` | 30 per file | 6 |

All unique local URLs mapped to the validated production URL map in `REPAIR_SCOPE.md`.

The pre-write public media check returned:

```text
checked: 9
passed: 9
failures: 0
```

No unmapped local media URL was found in the approved active page body/media roots.

