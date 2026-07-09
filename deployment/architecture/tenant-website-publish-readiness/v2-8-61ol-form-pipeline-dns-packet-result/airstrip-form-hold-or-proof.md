# Airstrip Form Hold Or Proof

Tenant: `airstrip-club-las-vegas`

## OL Scope

Airstrip remained frozen in OL.

No Airstrip live POST was approved or run.

No Airstrip public runtime probe was run in OL runtime no-regression.

## Read-Only FormDefinition Evidence

The existing Airstrip backup contains FormDefinition `airstrip-reservation`:

- tenant/siteKey: `airstrip-club-las-vegas`
- status: `active`
- formType: `airstrip-reservation`
- submitAction: `form-entry`
- runtimeSubmitPath: `/api/forms/airstrip-club-las-vegas/submit/airstrip-reservation`
- required fields: `package`, `date`, `time`, `guests`, `name`, `phone`, `consent`
- hidden fields: `tenantid`, `sitekey`, `formkey`, `sourcepage`
- consent field: `consent`
- honeypot field: `honeypot`

Notification and lead recipient refs are present in backup metadata, but values were not printed.

## Live Boundary Check

Unauthenticated readback of:

```text
/api/admin/forms/airstrip-club-las-vegas/definitions
```

returned `401`, as expected for Admin API routes without a JWT.

## Result

Airstrip form state is source/backup-audited only. Airstrip live POST remains held until a separate owner approval.
