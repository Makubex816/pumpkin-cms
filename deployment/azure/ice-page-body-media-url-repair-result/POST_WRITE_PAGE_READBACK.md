# Post-Write Page Readback

Post-write readback verified the repaired active page roots.

| Page | Expected fields | Active root fields still local | `ContentData` matched expected payload | `media` matched expected payload | Unexpected non-system diffs |
| --- | ---: | ---: | --- | --- | ---: |
| `home` | 52 | 0 | yes | yes | 0 |
| `contact` | 50 | 0 | yes | yes | 0 |
| `service-areas` | 30 | 0 | yes | yes | 0 |

Only target pages changed:

```text
home
contact
service-areas
```

Non-target pages changed:

```text
0
```

Obsolete pages changed:

```text
0
```

System-managed page metadata advanced as expected:

| Page | Page version | Revision number |
| --- | --- | --- |
| `home` | 23 -> 24 | 19 -> 20 |
| `contact` | 18 -> 19 | 18 -> 19 |
| `service-areas` | 9 -> 10 | 9 -> 10 |

The page API created normal rollback snapshots from the previous root page state. Those `revision.latestSnapshot` fields still contain the pre-repair local URLs and were not manually edited.

