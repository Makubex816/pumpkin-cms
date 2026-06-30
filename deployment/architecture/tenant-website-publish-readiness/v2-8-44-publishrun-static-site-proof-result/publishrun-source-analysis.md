# PublishRun Source Analysis

Source-discovered routes:

- `POST /api/admin/{tenantId}/publish-runs`
- `GET /api/admin/{tenantId}/publish-runs/{id}`
- `GET /api/admin/{tenantId}/publish-runs`

The route uses `PublishRunSanitizer.PrepareForSave(...)` and accepts tenant-scoped records with `source: cms-snapshot`, `runType: static_export`, `status: ready_for_manual_upload`, `deploymentTarget: azure-static-web-apps`, and `deploymentStatus: staged`.

No Pumpkin API source fix or deploy was required in V2.8.44.
