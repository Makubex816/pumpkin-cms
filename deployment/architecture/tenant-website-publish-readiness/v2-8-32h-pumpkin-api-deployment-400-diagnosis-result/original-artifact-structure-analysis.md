# Original Artifact Structure Analysis

Original artifact:

`.tmp/v2-8-32c/pumpkin-api.zip`

Observed structure:

| Field | Value |
| --- | --- |
| SHA256 | `05E9567DD47F7B59288569EA66815DC5059DF903481F097E3222F0036EE5B854` |
| ZIP entries | `61` |
| File entries | `56` |
| Root file count | `44` |
| Backslash entry count | `17` |
| App-settings-like entries | `0` |
| Root `pumpkin-api.dll` | present |
| Root `pumpkin-api.runtimeconfig.json` | present |
| Root `pumpkin-api.deps.json` | present |
| Root `web.config` | present |

Backslash entry examples:

- `DataSample\html-blocks.json`
- `DataSample\page.json`
- `runtimes\unix\lib\net6.0\System.Drawing.Common.dll`
- `runtimes\win\lib\net6.0\System.Windows.Extensions.dll`
- `runtimes\win-x64\native\vcruntime140.dll`

Conclusion: the publish-root layout was otherwise correct, but the ZIP used Windows path separators for nested entries. That matched the Kudu rsync failure and explained the server-side HTTP `400`.
