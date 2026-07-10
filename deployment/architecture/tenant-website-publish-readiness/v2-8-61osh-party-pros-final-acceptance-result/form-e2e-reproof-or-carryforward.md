# Form E2E Reproof or Carryforward

OSH result: OSF carryforward retained; OSH reproof blocked before POST.

The custom-domain form mode changed from disabled to live, so OSH prepared for the one approved synthetic reproof. Before mutation, it used the required custom-header request shape:

- mode: `custom-header`;
- header name source: `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`;
- header value source: `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`;
- auth value printed: no.

Admin preflight results:

- `/api/admin/tenants`: 401;
- `/api/admin/forms/party-pros-philadelphia/entries`: 401.

OSH stopped before POST. Submission count: 0. New FormEntry count: 0. No customer data or real inquiry was used.

Source inspection also found that the live custom Contact form omits the required consent control. A direct crafted payload could include consent, but that would not prove the actual browser form. OSH therefore does not claim a fresh E2E result.

Current proven E2E carryforward remains OSF FormEntry `43dcad71-0f9c-47b2-97db-69374ee9560f`, which returned HTTP 201 on creation and was read back under Party Pros.

