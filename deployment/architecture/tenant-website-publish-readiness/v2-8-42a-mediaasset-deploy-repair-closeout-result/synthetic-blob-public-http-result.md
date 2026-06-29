# Synthetic Blob Public HTTP Result

Result: blocked.

Public HTTP proof was not completed.

The continuation harness found the uploaded proof blob, then failed locally before the public HEAD probe because the Windows PowerShell session did not have `System.Net.Http.HttpClientHandler` available. The harness cleaned up the proof blob instead of leaving live residue.

No second public proof was attempted because no second blob upload was allowed.

