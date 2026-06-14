# Dashboard Layout Dirty File Review

Status: safe to edit with narrow patch.

Start-state review showed `apps/admin/src/app/dashboard/layout.tsx` was already dirty before V2.9.5. The pre-edit diff was:

- add `Link2` import from `lucide-react`;
- add an `Outbound Links` navigation item pointing at `/dashboard/outbound-links`.

The file had no staged changes. V2.9.5 did not revert or rewrite that existing work. The V2.9.5 edit only expanded the lucide import to include `FileSearch` and added the adjacent Audit Jobs nav entry.

Known unrelated worktree changes remain outside this phase and were not touched.
