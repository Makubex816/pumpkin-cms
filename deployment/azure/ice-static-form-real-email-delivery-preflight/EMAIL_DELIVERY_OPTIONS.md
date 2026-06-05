# Email Delivery Options

Generated: 2026-06-05

## Option A: Microsoft Graph `sendMail`

Use Microsoft Graph `POST /users/{id | userPrincipalName}/sendMail` from the server-side Azure Function.

Recommended authorization shape:

- Function managed identity or dedicated Microsoft Entra app
- `contact@iceskatingrinkrentals.com` as sender identity
- `Mail.Send` capability scoped to the contact mailbox through Exchange Online RBAC for Applications where available
- secret material stored only in Azure server-side settings or Key Vault references

Pros:

- best fit for Microsoft 365 mailbox delivery
- no mailbox password in app settings
- server-side only; no frontend credential exposure
- can preserve existing validation and sanitization
- can keep dry-run rollback mode

Risks and requirements:

- requires explicit Microsoft 365 and Exchange Online admin work
- requires endpoint code changes
- requires Graph error handling and throttling handling
- `202 Accepted` is not a delivery receipt; inbox verification is required

## Option B: SMTP AUTH With OAuth

Use Exchange Online SMTP client submission only with OAuth and approved Exchange Online configuration.

Pros:

- familiar protocol for simple mail delivery
- may be useful if Graph is blocked by policy

Risks and requirements:

- Basic authentication for SMTP client submission is not an acceptable plan in this 2026-06-05 preflight
- SMTP AUTH may be disabled globally or per mailbox
- OAuth SMTP/App RBAC setup is more fragile than Graph for this small endpoint
- requires more protocol-specific code and testing

Recommendation:

```text
not first choice
```

## Option C: Approved Transactional Email Provider

Use an approved provider API such as SendGrid, Mailgun, Postmark, or SES after a separate provider approval.

Pros:

- good delivery tooling and webhook diagnostics
- avoids Microsoft 365 app-permission setup

Risks and requirements:

- new vendor approval required
- API key and DNS authentication required
- SPF/DKIM/DMARC changes may be required
- not currently approved

Recommendation:

```text
viable fallback only after separate provider and DNS approval
```

## Option D: Keep No-Email Mode

Continue using the deployed endpoint in `dry-run` mode.

Pros:

- current safest operational state
- no Microsoft 365 or Azure setting changes
- validators already pass for local/staging no-email context

Limitations:

- does not deliver contact submissions
- contact form production readiness remains `no`

Recommendation:

```text
default until Microsoft 365/email approval is explicit
```

## Official Reference Notes

Microsoft Graph `sendMail` supports delegated and application `Mail.Send` permission and can address `/users/{id | userPrincipalName}/sendMail`.

Microsoft documents that application `Mail.Send` can send as any user unless scoped. New Exchange Online access configuration should prefer RBAC for Applications over legacy Application Access Policies.

Microsoft documents removal of Basic authentication for SMTP client submission in March 2026, so mailbox-password SMTP is not a production path for this project.

