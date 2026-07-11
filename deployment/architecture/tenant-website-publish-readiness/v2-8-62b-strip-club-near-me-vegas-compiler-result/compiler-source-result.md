# Compiler Source Result

The canonical V1 compiler at `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs` was reviewed and not modified. It currently encodes Airstrip-specific routes, theme copy, and FormDefinition assumptions, so using it directly would have replaced source content with unsuitable placeholders.

Two ignored task-scoped tools were created:

| Tool | Bytes | SHA-256 |
| --- | ---: | --- |
| `.tmp/v2-8-62b/static-package-compiler.mjs` | 50,070 | `74eebd63bc44649e4ad0fa4075fa7466355880d92b8305d527a489a9fb65fc9b` |
| `.tmp/v2-8-62b/preview-proof.mjs` | 10,949 | `c90fbfd0007a0762f3243d4aaf1b51ba9ff0b21cfed3c8860461664cca77d339` |

Both pass `node --check`. They remain ignored and unstaged. The compiler used Chrome only as a DOM parser with script execution disabled and HTTP(S) blocked before local file navigation. It copied no source JavaScript into the preview fixture.

Compiler result: `compiled`; package path: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-62b\compiled-package`.
