# Deferred Gates Summary

Deferred from V2.8.29:

- Deployment or redeployment.
- Azure app setting inspection or mutation.
- Protected config inspection.
- Production POST or API calls.
- Inbox/provider login.
- DNS/custom-domain changes.
- Search Console, sitemap, URL Inspection, or indexing actions.

Deferred remediation gates:

- Decide whether Admin inbox persistence is required.
- Decide whether email-only delivery is acceptable.
- Decide whether dual delivery should be implemented.
- Approve protected binding/config inspection or operator-provided public-safe binding status.
- Approve any deploy/config mutation in a separate phase.
- Approve any future production POST in a separate phase.

