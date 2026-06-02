# Inbound Email Routing Notes

Pumpkin's first email phase keeps form leads and mailbox email separate.

Microsoft 365 Exchange Online Plan 1 is selected for Ice and partially set up outside code. Plan 1 has been purchased, the selected mailbox/user is `contact@iceskatingrinkrentals.com`, and the Microsoft 365 verification TXT record was added at Bluehost. No Microsoft 365 users, mailboxes, aliases, DNS records, or inbound ingestion are created by this repo.

## Current Architecture

- Contact and quote forms submit to Pumpkin as `FormEntry`.
- FormEntry records are reviewed in the Pumpkin Lead Inbox.
- Pumpkin Lead Inbox remains the source of truth for form leads.
- Internal email notifications, once enabled later, are convenience alerts only.
- Email notifications must not become the source of truth for leads.
- Direct email and contact form leads are separate channels.

## Exchange Online Receives Direct Email

After Microsoft 365 setup and MX cutover, direct email to public addresses such as `contact@iceskatingrinkrentals.com` or `quotes@iceskatingrinkrentals.com` should be received by the Exchange Online mailbox or approved alias routing.

Pumpkin does not ingest mailbox replies in this phase.

## Replies

- Reply handling starts in Exchange Online and Outlook.
- Internal lead notifications should use a reply-to strategy that points replies to the submitter email when valid, or to an approved default reply-to ref otherwise.
- Autoresponders should use an approved reply-to ref, preferably a monitored mailbox.
- `no-reply@` should reject, discard, or route to a monitored mailbox according to the approved Microsoft 365 policy.

## Aliases And Routing

Current Ice address state:

- `contact@iceskatingrinkrentals.com`: selected primary mailbox/user, setup status in progress.
- `quotes@iceskatingrinkrentals.com`: proposed alias, pending Microsoft 365 admin setup.
- `admin@iceskatingrinkrentals.com`: proposed alias or separate mailbox candidate, pending Microsoft 365 admin setup.
- `no-reply@iceskatingrinkrentals.com`: proposed alias or sending identity candidate, pending Microsoft 365 admin setup.

Aliases that route to the same human/admin mailbox can be created later after Microsoft 365 setup is approved. This readiness layer does not create them.

Aliases do not automatically guarantee independent outbound sending identity behavior. Verify send-as/send-on-behalf and no-reply behavior before production.

## Future Inbound Ingestion

Pumpkin may later ingest inbound replies through:

- Microsoft Graph
- Microsoft Graph change notifications or webhook-style integration
- IMAP polling if approved and supported
- provider webhook-style routing if introduced later
- inbound parse webhooks from a relay

That future phase needs secure secret storage, Microsoft Graph/OAuth configuration, mailbox/provider credentials where applicable, replay protection, sender validation, attachment policy, spam handling, and privacy retention rules.

Do not build inbound Graph, webhook, IMAP, or JMAP ingestion until credential storage and security requirements are approved.

## Channel Separation

- Contact and quote forms create Pumpkin `FormEntry` records.
- Direct email is handled in Exchange Online first.
- Pumpkin Lead Inbox remains the source of truth for form leads.
- Email notifications are secondary delivery and should never replace Lead Inbox review.

RollerRinkRentals.com remains paused.
