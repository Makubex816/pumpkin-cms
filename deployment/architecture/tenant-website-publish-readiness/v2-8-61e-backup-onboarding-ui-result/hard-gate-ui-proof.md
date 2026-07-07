# Hard Gate UI Proof

The new UI surfaces display hard gates before custom-domain cutover:

- Backup/restore proof must remain complete and repo-safe.
- Package analysis and compiler validation must remain complete.
- Mobile responsive proof must remain complete.
- Production runtime GET checks must remain green.
- DNS/custom-domain/indexing remain separate explicit approvals.

The UI does not expose controls to run backup jobs, restore tenants, upload package ZIP files, deploy tenant sites, mutate DNS, or request indexing.
