# Form Configuration Reference Rules

Form configuration packages may reference:

- form ID;
- route;
- public endpoint label;
- owner approval ref;
- validation ref;
- runtime env variable names;
- no-secret presence checks.

Form configuration packages must not include:

- endpoint secrets;
- authorization headers;
- cookies;
- mailbox credentials;
- Microsoft Graph secrets;
- raw submitted PII;
- new contact POST execution.

V2.8.19 carryforward:

- one approved synthetic non-PII contact POST was already verified.
- V2.11.1 sends no contact POST.

Any future form live verification requires a separate explicit approval.
