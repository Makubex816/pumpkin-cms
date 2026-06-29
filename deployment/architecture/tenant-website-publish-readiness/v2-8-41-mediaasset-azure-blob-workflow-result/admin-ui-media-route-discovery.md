# Admin UI Media Route Discovery

Source-discovered Admin UI routes and client methods:

- `apps/admin/src/app/dashboard/media/page.tsx` provides the media list, upload form, and existing URL registration UI.
- `apps/admin/src/app/dashboard/media/[id]/page.tsx` provides detail, metadata update, archive, restore, and replace UI.
- `apps/admin/src/lib/api.ts` includes `getMediaAssets`, `getMediaAsset`, `createMediaAsset`, `uploadMediaAsset`, `updateMediaAsset`, `archiveMediaAsset`, `restoreMediaAsset`, and `replaceMediaAsset`.
- `apps/admin/src/app/dashboard/layout.tsx` links `/dashboard/media`.

Browser proof result:

- Host kind: isolated.
- Login page status: HTTP 200.
- Final route: `/dashboard/media`.
- Page markers observed: `Asset Manager`, upload controls, existing URL registration controls.
- API calls observed: login POST, tenant/page/auth/media GET calls.
- MediaAsset write calls observed: `0`.
- Upload/register POST calls observed: `0`.

Classification: `admin_ui_media_route_readonly_loaded`.
