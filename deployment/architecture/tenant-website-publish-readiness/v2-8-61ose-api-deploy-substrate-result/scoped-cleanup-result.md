# Scoped Cleanup Result

Cleanup policy allowed deleting only confirmed malformed entries under `/home/site/wwwroot` whose names contained literal backslash characters.

Result:

| Item | Count |
| --- | ---: |
| Confirmed malformed backslash entries | 0 |
| Deleted entries | 0 |

No deletion was performed because no literal malformed path entries were confirmed in the Kudu backup inventory.

