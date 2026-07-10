# Next Phase Prompt

## V2.8.61OSHR - Party Pros Consent Rendering and Authenticated Form Reproof

Goal: close the two OSH functional blockers without changing the accepted Party Pros visual baseline.

Required owner inputs and approvals:

- provide accepted process-scoped `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header` inputs without placing the auth value in chat or repo files;
- approve a scoped `ContactFormBlock` repair that renders required FormDefinition consent as an explicit checkbox with the definition's consent text;
- approve exactly one new starter deployment for OSHR;
- approve exactly one synthetic browser-level Party Pros form submission after all preflight gates pass.

Required proof:

1. verify OSG and OSH commits and empty staging;
2. prove the custom-header can read Party Pros Admin FormEntries before mutation;
3. render required consent on custom-domain contact while keeping preview disabled/no-post;
4. type-check, build, package-scan, and deploy starter once;
5. submit exactly one synthetic request through the actual rendered live form;
6. read back the new Party Pros FormEntry using the custom-header environment variables;
7. prove the same id is absent under Ice;
8. prove no external email implementation or delivery;
9. run non-Airstrip runtime no-regression.

Still prohibited: real customer data, more than one synthetic POST, CMS/media mutation, API/Admin/Ice deploy, DNS/TLS/registrar action, storage keys/listKeys/SAS, Airstrip action, secret printing, generated artifact staging, and `git add -A`.

CMS visual persistence remains a later separately approved phase after OSHR closes.

