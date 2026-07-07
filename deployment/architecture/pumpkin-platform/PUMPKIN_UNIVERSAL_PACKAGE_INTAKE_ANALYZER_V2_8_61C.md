# Pumpkin Universal Package Intake Analyzer V2.8.61C

Status: implemented.

Tool:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs`

The tool accepts a ZIP path, output directory, and tenant ID. It quarantines/extracts the ZIP under ignored `.tmp`, inventories source shape, detects framework/build mode candidates, discovers routes/media/forms/theme hints, detects protected config filenames without reading contents, classifies rendering mode, and produces owner and compiler handoff outputs.

The tool does not execute uploaded scripts, install packages, run builds, deploy, mutate live systems, submit forms, upload media, or read protected config contents.
