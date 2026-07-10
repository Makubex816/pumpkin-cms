# Next Phase Prompt

Approve V2.8.61OSD resume from the V2.8.61OSE route-live gate only.

Carryforward:

- Pumpkin API submit-key provisioning route is live and auth-gated.
- V2.8.61OSE route probe returned HTTP `401` without auth or secret body.
- V2.8.61OSE did not register a Party Pros submit key.
- V2.8.61OSE did not mutate starter appsettings or restart/redeploy starter.
- V2.8.61OSE did not submit any form.
- V2.8.61OSE did not touch DNS/TLS/registrar, Ice, Airstrip, or storage keys.

Requested next-phase scope:

1. Recheck SuperAdmin auth without printing token.
2. Register Party Pros submit key hash through the live route using the approved secure handoff.
3. Set only required starter appsettings for Party Pros form submission if still required.
4. Restart/redeploy starter only if required and separately within approved count.
5. Perform exactly one controlled synthetic Party Pros form submission.
6. Read back FormEntry and prove tenant isolation.
7. Keep Party Pros preview routes no-post.
8. Run non-Airstrip runtime no-regression.

Still not approved by this OSE packet:

- no additional Pumpkin API deploy unless owner separately approves;
- no DNS/TLS/registrar changes;
- no Airstrip action;
- no Ice mutation;
- no real customer inquiry;
- no external client/customer email;
- no storage keys/listKeys/SAS;
- no secret/token/cookie/API key printing.

