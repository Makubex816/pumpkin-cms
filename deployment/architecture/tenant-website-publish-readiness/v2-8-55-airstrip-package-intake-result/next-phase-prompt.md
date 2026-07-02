# Next Phase Prompt

Approve V2.8.55A Airstrip Isolated Source Build and Local Rendering Proof only.

Use package archive `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\newest upload package\pumpkinairstrip.zip` and target domain `airstripclublasvegas.com`.

Allowed only:

- Extract ZIP into ignored `.tmp/v2-8-55a-airstrip-source-build/`.
- Run public secret/protected-config scan before installing dependencies.
- Read package metadata and source.
- Install dependencies only inside ignored `.tmp` extraction if scan passes and no protected values are required.
- Run local build/type-check/render proof only.
- Capture local screenshots and route proof.
- Produce reports and cleanup instructions.

Not approved:

- No tenant creation.
- No live record mutation.
- No deploy.
- No Azure/appsetting/DNS/indexing mutation.
- No contact POST.
- No form submission.
- No media upload.
- No package source modification.
- No package source staging.
- No binary media staging.
- No protected config value printing.
- No owner hard-copy secret read.
- No key/listKeys/SAS/connection string operation.
- No `git add -A`.

Hard stop if package build requires real secrets, external service writes, deployment credentials, or package source modification.

