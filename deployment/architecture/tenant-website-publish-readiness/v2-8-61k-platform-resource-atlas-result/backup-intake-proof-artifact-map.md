# Backup, Intake, And Proof Artifact Map

| artifactPath | artifactType | tenantOrSystem | purpose | containsSensitiveDataBoolean | repoSafeBoolean | status |
| --- | --- | --- | --- | --- | --- | --- |
| C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61a-airstrip-full-backup-proof | outside-repo backup proof | airstrip-club-las-vegas | full backup proof | true | false | exists per V2.8.61A |
| C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61b-airstrip-restore-dryrun-proof | outside-repo restore proof | airstrip-club-las-vegas | restore dry-run plan and validation | true | false | exists per V2.8.61B |
| C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61c-intake-analysis-proof | outside-repo intake proof | airstrip-club-las-vegas | uploaded package analysis | true | false | exists per V2.8.61C |
| C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61d-compiled-package-proof | outside-repo compiler proof | airstrip-club-las-vegas | normalized package compiler output | true | false | exists per V2.8.61D |
| C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\operator-workflow-proofs\v2-8-61f-airstrip-backup-intake-e2e | outside-repo operator proof | airstrip-club-las-vegas | end-to-end operator proof | true | false | exists per V2.8.61F |
| C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-61g-pre-domain-cutover-master-operator-hardcopy | outside-repo hardcopy | Pumpkin platform and Airstrip | master operator hardcopy | true | false | exists per V2.8.61G |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61a-backup-manager-export-result/ | repo result package | airstrip-club-las-vegas | repo-safe backup report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61b-backup-restore-dryrun-result/ | repo result package | airstrip-club-las-vegas | repo-safe restore dry-run report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61c-package-intake-analyze-result/ | repo result package | airstrip-club-las-vegas | repo-safe package intake report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61d-package-compiler-result/ | repo result package | airstrip-club-las-vegas | repo-safe compiler report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61e-backup-onboarding-ui-result/ | repo result package | Pumpkin Admin UI | repo-safe UI proof report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61f-operator-e2e-proof-result/ | repo result package | airstrip-club-las-vegas | repo-safe operator E2E report | false | true | committed/repo-safe |
| deployment/architecture/tenant-website-publish-readiness/v2-8-61g-pre-domain-hardcopy-result/ | repo result package | Pumpkin platform | repo-safe hardcopy index report | false | true | committed/repo-safe |

Do not stage outside-repo backup, intake, hardcopy, or proof folders.
