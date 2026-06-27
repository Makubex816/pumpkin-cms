# Next Phase Prompt: V2.8.32L Live Contact POST Plus Admin FormEntry Readback

Approve V2.8.32L only: perform one bounded live production contact POST against the already-bound Ice static contact endpoint, then perform the minimum Admin FormEntry readback needed to prove the exact returned entry is visible in the Pumpkin Admin-readable backend.

Approved if granted:

- Confirm V2.8.32K result package and Static SWA binding carryforward.
- Confirm no deploy is needed.
- Confirm production endpoint `https://iceskatingrinkrentals.com/api/static-contact`.
- Submit exactly one no-PII contact payload for tenant `ice-rink-rentals` and form ID `default-quote-request`.
- Capture returned status, `ok`, and `entryId`.
- Perform only approved Admin FormEntry readback needed to find that exact `entryId`.
- Record whether the exact entry is visible in Admin.

Not approved unless explicitly added:

- Deployment or redeployment.
- SWA deploy or Web App deploy.
- More than one contact POST.
- Appsetting list/show.
- Appsetting mutation.
- Protected config read.
- Key Vault secret query.
- keys/listKeys.
- Connection string or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Provider/inbox login beyond the approved Admin readback path.

Success condition:

The exact submitted contact entry ID is present in Admin FormEntry readback for tenant `ice-rink-rentals`.

Failure condition:

The POST fails, the API rejects the tenant key, the write does not create a FormEntry, or Admin readback cannot find the exact entry.
