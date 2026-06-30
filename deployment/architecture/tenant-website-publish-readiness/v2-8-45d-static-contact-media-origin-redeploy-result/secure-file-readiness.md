# Secure File Readiness

Approved secure files:

| File | Read | Git ignored | Use |
| --- | --- | --- | --- |
| `.tmp/v2-8-45c/secure/static-contact-swa-redeploy.json` | yes | yes | Retained V2.8.45C token carryforward if needed |
| `.tmp/v2-8-45d/secure/static-contact-media-origin-redeploy.json` | yes | yes | V2.8.45D artifact validation and SWA redeploy retry |

The older V2.8.45B secure file was not required and was not read.

Secret fields were not printed and were not written to repo reports. The D secure handoff is deleted after successful closeout; the retained C handoff remains available only as prior carryforward unless the operator removes it separately.
