# Inbound Email Routing Notes

Pumpkin's first email phase should keep form leads and mailbox email separate.

## Current Architecture

- Contact and quote forms submit to Pumpkin as `FormEntry`.
- FormEntry records are reviewed in the Pumpkin Lead Inbox.
- Internal email notifications, once enabled later, are convenience alerts only.
- Email notifications must not become the source of truth for leads.

## Mailbox Provider Receives Direct Email

After a provider is selected and DNS is configured, direct email to public addresses such as `contact@iceskatingrinkrentals.com` or `quotes@iceskatingrinkrentals.com` should be received by the mailbox provider.

Pumpkin does not ingest mailbox replies in this phase.

## Replies

- Reply handling starts in the selected mail provider.
- Internal lead notifications should use a reply-to strategy that points replies to the submitter email when valid, or to an approved default reply-to ref otherwise.
- Autoresponders should use an approved reply-to ref, preferably a monitored mailbox.
- `no-reply@` should reject, discard, or route to a monitored mailbox according to the selected provider policy.

## Aliases And Routing

Recommended Ice addresses remain proposed only:

- `contact@iceskatingrinkrentals.com`
- `quotes@iceskatingrinkrentals.com`
- `admin@iceskatingrinkrentals.com`
- `no-reply@iceskatingrinkrentals.com`

Aliases that route to the same human/admin mailbox can be created later after the provider is selected. This readiness layer does not create them.

## Future Inbound Ingestion

Pumpkin may later ingest inbound replies through:

- IMAP polling
- JMAP where supported
- provider webhooks
- inbound parse webhooks from a relay

That future phase needs secure secret storage, mailbox/provider credentials, replay protection, sender validation, attachment policy, spam handling, and privacy retention rules.

Do not build inbound IMAP/JMAP/webhook ingestion until provider selection, credential storage, and security requirements are approved.

