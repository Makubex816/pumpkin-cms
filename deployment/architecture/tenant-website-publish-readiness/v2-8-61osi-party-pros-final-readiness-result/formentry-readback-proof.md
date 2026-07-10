# FormEntry Readback Proof

Fresh authentication/readback sequence:

- SuperAdmin login: HTTP 200;
- JWT token present in memory: true;
- authenticated role: `SuperAdmin`;
- JWT verify endpoint: HTTP 200;
- Party Pros Admin list before submit: HTTP 200;
- Party Pros direct readback after submit: HTTP 200.

Read-back entry:

- ID: `92f04673-9427-401a-b569-eca3b5b8089f`;
- tenant ID matched: true;
- form ID matched: true;
- form key matched: true;
- workflow status: `new`;
- spam status: `clean`;
- test marker present: true;
- phase marker present: true;
- tenant marker present: true;
- safe test-email marker present: true;
- timestamp marker present: true;
- consent accepted: true;
- honeypot filled: false.

Credentials and JWT remained in memory. No password, token, cookie, API key, key hash, or full FormEntry payload was printed or written to repository files.

