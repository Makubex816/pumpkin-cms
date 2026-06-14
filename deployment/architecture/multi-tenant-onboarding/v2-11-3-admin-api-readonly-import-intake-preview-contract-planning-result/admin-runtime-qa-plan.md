# Admin Runtime QA Plan

Future V2.11.4 runtime QA must verify:

- Admin route loads in fixture mode;
- Admin route shows all 15 panels;
- Ice package summary shows future-import-ready with future gate required;
- Roller package summary shows paused/no-import and not future-import-ready;
- no-go panel shows Roller blocker;
- rollback panel shows rollback plan ids;
- API mode falls back to fixture mode on error;
- all future action buttons are disabled;
- no runtime call uses POST/PUT/PATCH/DELETE.

This phase did not start a dev server or implement runtime pages.
