# UP-20 recheck and freeze exact upstream source prompt

Precondition: use this only after CUR-20 is completed with an active Atlas reconciled and a final working-memory/CHAT-PACK package released. The blocked CUR-20 result does not authorize UP-20 execution yet.

```text
TASK ID: UP-20 — Recheck and Freeze Exact Upstream Source

Repository:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Branch:
feature/admin-page-editor-import-export

Inputs:
- Completed CUR-20 result package.
- Reconciled active Build Atlas.
- Latest working-memory v1.0.0 package and regenerated CHAT-PACK.
- Upstream repository: https://github.com/SDI-AI/pumpkin-cms
- Tracked branch: main

Latest CUR-20 upstream observation:
- Head: 817e176cd6af7759c58923c713c5b8ac7cf79996
- Tree: b4fed8406bd8ac8ab05ce8614d3cf3ba03cd1bbe
- Parents: 0c6e31a7184cd65d17cda66af9dc080293bd25f7, f7f83ef6614974fa9bf99b81755afb2bad959194
- Date: 2026-07-16T15:17:48Z
- Message: Merge branch 'main' of https://github.com/sdi-ai/pumpkin-cms

Objective:
Re-read upstream main, detect whether it moved after CUR-20, preserve prior observations, and create the exact immutable source-freeze plan authorized by the active Atlas. Do not qualify or merge code unless UP-20 explicitly authorizes that step after source freeze.

Required:
- current 40-character head SHA;
- tree SHA;
- parent lineage;
- commit date/message;
- compare against 18b5cea01d23298b95b5945999e66a4aec8d748b, 785e079269276c177832f9e7186ae44675e76f52, and CUR-20 head 817e176cd6af7759c58923c713c5b8ac7cf79996;
- changed path inventory;
- status/check-run readback;
- freeze artifact plan with checksums;
- no upstream push/branch/tag unless explicitly authorized by UP-20.

Boundaries:
No Azure mutation, no downstream product mutation, no package deploy, no tenant/user/form mutation, no payment work, no Airstrip public-runtime request, no indexing action.
```

