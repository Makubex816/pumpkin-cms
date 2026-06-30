# Admin Dashboard Truth Proof

Source behavior:

- `apps/admin/src/lib/api.ts` computes dashboard stats from `apiClient.getPages`.
- It does not call a separate dashboard aggregate endpoint.
- `mediaFiles` in the dashboard source counts `Hero` and `Gallery` blocks in Page content, not MediaAsset records.

Final authenticated readback:

- Total pages: `3`.
- Published pages: `3`.
- Draft pages: `0`.
- Dashboard-source media file count: `3`.
- Actual MediaAsset records: `9`.

The `Media Files` tile and the Media Library count intentionally describe different source concepts in the current Admin UI.
