# Risk And Open Decisions

Open decisions:

- Google/Search Console/indexing remains deferred.
- Next-lane numbering is rebaselined: V2.10 is used for platform closeout; multi-tenant onboarding is recommended as V2.11.
- The existing multi-tenant onboarding documentation family appears to be actively edited in the worktree and should be reviewed under a future scoped approval before it becomes canonical for V2.11.
- Future live provider integration remains unapproved.
- Future CMS/provider writes remain unapproved.
- Future deployment/redeployment, DNS, and custom-domain changes remain unapproved.
- Future Electron runtime remains unapproved.

Residual risks:

- Some historical docs are superseded but still present; this is intentional and preserves auditability.
- Browser-auth automation for API-backed Admin mode remains a future QA hardening opportunity, not a V2 closeout blocker.
- Deferred indexing is explicit and should not be mistaken for accidental omission.

No V2.10.1 blocker remains inside the approved local/read-only reconciliation scope.
