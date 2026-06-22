# Rebuild Recovery Options

## Option B1: Rebuild Image-rich Pages From Approved Owner Assets

Recommended if the older static artifact cannot be recovered.

Steps:

1. collect approved images and usage rights
2. define route/content manifest for `/`, `/service-areas`, and `/contact`
3. add images to a safe source path or approved CMS/media source
4. wire page data image fields and alt text
5. build a local artifact
6. deploy only to `swa-ice-static-isolated-staging`
7. complete owner visual/content approval
8. request separate production-bound deploy approval

## Option B2: Rebuild From CMS Snapshot Plus Media Recovery

Use if the CMS snapshot contains correct copy but the media references need restoration.

Blocker: current snapshot/static output is minimal and image-empty.

## Option B3: Rebuild From Existing Renderer Capabilities

The current renderer supports hero/media/card images. Recovery can reuse existing components, but must supply real image assets and route data.

