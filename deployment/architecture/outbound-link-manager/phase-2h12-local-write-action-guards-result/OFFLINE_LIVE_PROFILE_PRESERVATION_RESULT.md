# Offline Live Profile Preservation Result

Local/offline remains the default.

Action request normalization preserves:

- fake provider behavior
- offline bundle behavior
- local file-backed store behavior
- live-readonly as explicit only
- live write approval as false
- production write approval as false

Future Azure/Admin/API wiring must retain local/fake/offline profiles and keep live-readonly separate from live-write provider paths.
