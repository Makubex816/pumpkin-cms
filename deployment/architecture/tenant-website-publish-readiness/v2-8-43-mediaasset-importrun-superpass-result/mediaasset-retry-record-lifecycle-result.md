# MediaAsset Retry Record Lifecycle Result

Result: pass.

- Create: HTTP `201`.
- Read: HTTP `200`, trace matched.
- Update: HTTP `200`, one metadata field update confirmed.
- Archive: HTTP `200`.
- Restore: HTTP `200`.
- Delete: HTTP `200`.
- Record absent after delete: yes.

The bearer token was not printed or written.

