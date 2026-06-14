# Future API Implementation Boundary Summary

Status: future-gated.

V2.9.9 may be proposed as a fixture-backed GET-only implementation phase, but only after explicit approval.

Minimum future implementation boundaries:

- add route group `/api/admin/audit-jobs`;
- add only GET methods;
- add DTO contracts and read-only service/provider;
- register the service/provider in Pumpkin API dependency injection;
- keep provider fixture-backed first;
- add route and service tests;
- add no-write scans;
- do not deploy;
- do not wire live provider data until a later approval.

Any write method, live provider write, CMS write, deployment, indexing, contact-form POST, Azure mutation, protected config read, or Electron runtime remains outside the API implementation boundary.

