# Responsive Checker Tool Result

Status: implemented and exercised.

Tool:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs`

Capabilities:

- accepts `--base-url`;
- accepts comma-separated `--routes` or `--routes-file`;
- runs the V2.8.60V viewport matrix;
- detects horizontal overflow using scroll width, client width, and viewport width;
- records console errors, failed requests, bad responses, missing images, and navigation status;
- writes JSON proof through `--out`;
- does not submit forms;
- does not create screenshots unless `--screenshots-dir` is explicitly supplied.

Run result against Airstrip production default host: completed, but valid=false due mobile overflow on `/airstrip-the-club`.
