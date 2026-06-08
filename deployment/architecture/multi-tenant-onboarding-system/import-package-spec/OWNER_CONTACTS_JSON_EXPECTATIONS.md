# Owner Contacts JSON Expectations

`owner-contacts.json` assigns humans or teams to onboarding decisions and support paths.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `contacts`

Required per contact:

- `role`
- `name`
- `contactMethod`
- `responsibility`
- `backupStatus`

Recommended roles:

- business owner
- content owner
- legal/privacy reviewer
- form inbox owner
- DNS owner
- hosting owner
- Cloudflare owner
- Azure owner
- rollback owner
- indexing owner

Do not include passwords, mailbox contents, login codes, or private credential links.
