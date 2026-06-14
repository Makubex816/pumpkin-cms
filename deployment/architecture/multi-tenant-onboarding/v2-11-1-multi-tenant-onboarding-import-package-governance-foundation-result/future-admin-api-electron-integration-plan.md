# Future Admin API Electron Integration Plan

Admin/API future path:

- expose import package validation results in Admin as read-only first;
- use existing Admin/API governance and Audit Jobs evidence patterns;
- keep write/import execution disabled until a future explicit approval;
- require tenant/site scope and owner/operator approvals;
- require no-go matrix pass before any execution gate.

API future path:

- first endpoint should be GET/read-only or local validator wrapper only;
- mutation/import endpoints require separate future approval;
- no live provider integration without explicit approval.

Electron future path:

- plan-only;
- no Electron runtime implemented in V2.11.1;
- future Electron packaging/storage/security model requires separate approval.
