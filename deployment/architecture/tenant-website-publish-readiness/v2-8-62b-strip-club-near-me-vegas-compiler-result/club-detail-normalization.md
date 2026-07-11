# Club Detail Normalization

`data/clubs.json` produced one catalog index and 10 item records:

| Item ID | Source-backed route |
| --- | --- |
| `treasures-las-vegas` | `/clubs/treasures-las-vegas` |
| `sapphire-las-vegas` | `/clubs/sapphire-las-vegas` |
| `crazy-horse-3` | `/clubs/crazy-horse-3` |
| `peppermint-hippo-las-vegas` | `/clubs/peppermint-hippo-las-vegas` |
| `hustler-las-vegas` | `/clubs/hustler-las-vegas` |
| `airstrip-las-vegas` | `/clubs/airstrip-las-vegas` |
| `spearmint-rhino-las-vegas` | `/clubs/spearmint-rhino-las-vegas` |
| `scores-las-vegas` | `/clubs/scores-las-vegas` |
| `palomino-club-las-vegas` | `/clubs/palomino-club-las-vegas` |
| `little-darlings-las-vegas` | `/clubs/little-darlings-las-vegas` |

Each record preserves the full source object, links to its page record, and maps hero, card, and logo paths to hash-deduplicated media IDs and proposed blob paths.

Venue URLs are source evidence only. The Airstrip website reference is explicitly `held-pending-owner-decision`; it was not requested, probed, or changed. All records remain draft candidates and require factual and compliance review before import or publication.
