# V2.8.61OSD Carryforward

OSD source route work was complete, but both approved OSD API deploy attempts failed before route activation.

Carryforward facts:

| Item | Result |
| --- | --- |
| Submit-key route source | implemented |
| Focused OSD source test | passed |
| API build | passed |
| OSD first deploy | failed before activation |
| OSD second deploy | failed, deployment id `5c2830c0-ef2f-46f1-a18a-5ad85ea80252` |
| OSD route probe after failed deploys | HTTP `404` |
| OSD form/key/starter actions | not performed |

The second failed deploy showed Kudu/OneDeploy rsync errors involving Windows-style backslash path entries. OSE corrected the package shape and proved the route live.

