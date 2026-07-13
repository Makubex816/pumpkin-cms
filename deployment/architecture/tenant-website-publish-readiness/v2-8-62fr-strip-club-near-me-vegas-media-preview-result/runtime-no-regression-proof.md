# Runtime No-Regression Proof

The post-deployment GET-only matrix failed 60/85 passed, 25/85 failed.

| Surface | Result |
| --- | ---: |
| Ice public and static-contact health | 8/8 |
| Pumpkin API | 2/2 |
| Admin UI | 4/4 |
| Starter core | 3/3 |
| Vegas preview | 43/43 |
| Party Pros public | 0/16 |
| Party Pros preview | 0/8 |
| Required Party Pros theme asset | 0/1 |

Before deployment, V2.8.62F proved Party Pros public 16/16 and preview 8/8. After clean deployment all 24 representative Party Pros routes returned 404. The required `/themes/party-pros-orange-slate-v1.css` also returned 404.

Root cause: Party Pros' latest runtime fixture was an external deployment-only artifact, not a committed fixture. The FR ZIP required the Vegas fixture but omitted the external Party Pros fixture, and clean extraction removed it. A recoverable external copy remains available with SHA-256 `2e19d8c084a9cbcb6d5897e1ed7da0380274e96ee7e2662e4210a0c28459dd26`.

Methods were GET only. POST requests and Airstrip requests remained zero. No second deployment was attempted.
