# Media Inventory

Physical media:

- total files: 473;
- bytes: 39,521,491;
- WebP: 446;
- JPG: 23;
- PNG: 2;
- SVG: 2;
- unique SHA-256 content hashes: 302;
- duplicate-content groups: 157.

Reference accounting:

- distinct local image paths referenced: 165;
- physical images confirmed referenced: 154;
- unreferenced physical images: 319;
- broken image-reference occurrences: 12, representing 11 distinct bad paths on the single legacy route.

The package contains a 171-file secondary guide-image tree in addition to the primary guide asset tree. Media must be selected and deduplicated by content hash before any import. Do not upload all 473 files blindly.

The static package is the media source, but rights and explicit-content review are not proven. Human review must classify each import candidate before media upload. V2.8.62A did not visually certify, upload, delete, or rewrite any image.

Planned destination after separate approval: existing shared media storage account, tenant-scoped container `strip-club-near-me-vegas-media`.
