# Race-safe idempotency proof

The canonical identity binds tenant, publication, mapping, and logical seed. Cosmos uses atomic create and Mongo uses a unique partial index; neither relies on check-then-insert. Focused API groups passed 7/7; backup/restore tests passed 97/97.

First submit returned 201, replay returned 200 with the same identity, and changed payload returned 409.

The offline restore proof ran 2 times deterministically; evidence SHA-256 0cc8f36cefd630f9ab976cf5495de0d52003c514259f1984c9064f5a3df0a4d2. Restored publications are held_pending_revalidation, inactive, indexing-disabled, blank-key-ID, and require revalidation. Canonical ID, identity, and digest remain exact; duplicate/conflict are rejected. No live restore write occurred.
