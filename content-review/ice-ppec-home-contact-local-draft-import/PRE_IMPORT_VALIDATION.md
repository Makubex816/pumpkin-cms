# Pre-Import Validation

- API reachable: yes HTTP 200
- Auth status: VALID
- Temp JWT loaded from temp file: yes
- Temp JWT deleted after success: yes
- Temp JWT retained on failure: no
- Temp JWT final status: MISSING
- JSON parse: passed
- Homepage preflight local draft: yes
- Contact preflight local draft: yes
- .NET home/contact pre-import: yes
- designSystem: yes
- media: yes
- defaultForm: yes
- tailwindNavigation: yes
- pageIntakeNormalizer: yes
- Unsafe/route/secret scan: yes
- Candidate differs from previous PPEC readback: yes
- Final hygiene checks: yes

Artifacts:

- homepage-ppec-import-preflight-result.json
- contact-ppec-import-preflight-result.json
- dotnet-updated-home-contact-ppec-pre-import-result.json
- validation-command-results.json
