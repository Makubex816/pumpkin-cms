# Next Phase Prompt

Approve V2.8.60W Airstrip `/airstrip-the-club` Mobile Overflow Repair and Responsive Re-Proof only.

Carry forward from V2.8.60V:

- The tenant onboarding responsive guardrails are implemented.
- The Airstrip normalized package still validates with a legacy responsive-file warning.
- GET no-regression route health passed.
- The new responsive checker found mobile overflow on production default-host `/airstrip-the-club`.
- Read-only element probe identified `.as-club-info` blocks as the overflow source at mobile widths.

Approved V2.8.60W scope should be:

- inspect Airstrip source for `.as-club-info` responsive behavior;
- apply a narrow source or overlay fix only for the `/airstrip-the-club` mobile overflow;
- run local responsive proof;
- deploy isolated first only if approved;
- deploy production only after isolated proof passes and if approved;
- rerun `check-responsive-output.mjs` against `/`, `/request-booking`, `/packages`, and `/airstrip-the-club`;
- keep DNS/custom-domain, indexing, contact POST, form submission, media upload/delete, and unrelated content mutation out of scope.

Hard stops:

- no DNS/custom-domain action;
- no indexing;
- no contact POST or form submission;
- no media/content mutation;
- no secret reads or printed secrets;
- no storage keys/listKeys/SAS;
- no `git add -A`;
- no production deploy before isolated proof succeeds.
