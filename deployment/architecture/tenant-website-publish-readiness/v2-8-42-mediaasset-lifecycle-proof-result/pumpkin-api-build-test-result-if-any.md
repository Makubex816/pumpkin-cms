# Pumpkin API Build/Test Result

Source fix required: yes.

Local validation:

- V2.8.42 MediaAsset lifecycle cleanup source test: pass.
- Pumpkin API build: pass.
- Warnings: `0`.
- Errors: `0`.

Publish artifact validation:

- Publish artifact file count: `56`.
- ZIP entry count: `61`.
- `pumpkin-api.dll` present: yes.
- appsettings/local settings entries: `0`.

Note:

The first publish form emitted only directories in this environment. Re-running publish with the project `PublishDir` property produced the valid artifact used for deployment.
