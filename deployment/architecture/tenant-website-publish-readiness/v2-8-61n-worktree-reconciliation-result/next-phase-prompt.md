# Next Phase Prompt

Use this only after the owner reviews `.tmp/v2-8-61n/owner-decisions/worktree-cleanup-owner-decisions.json`.

```
Approve V2.8.61O Owner-Approved Worktree Cleanup Execution only.

Carry forward V2.8.61N:
- Worktree inventory completed.
- No deletion, archive, staging, deploy, live mutation, DNS action, contact POST, form submission, customer-facing POST, or Airstrip disturbance occurred.
- Owner decision template exists at .tmp/v2-8-61n/owner-decisions/worktree-cleanup-owner-decisions.json.

Before acting:
- Read only the owner decision template.
- Do not read secure/protected file contents.
- Stop if any paths are staged at start unless the owner explicitly says staging is expected.
- Execute only owner-approved exact paths.
- Do not run git clean -fdx.
- Do not run git reset --hard.
- Do not use git add -A.

Allowed only if owner decisions approve:
- Remove exact cache/build output paths.
- Archive exact content-review paths outside the repo.
- Apply exact .gitignore additions.
- Stage exact approved commit batches only.

Still prohibited:
- Broad delete.
- Protected path sweep.
- Live mutation.
- Deploy.
- DNS/custom-domain action.
- Contact POST.
- Form submission.
- Customer-facing POST.
- Airstrip disturbance.
- Secret read/print.
```
