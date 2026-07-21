# Build Atlas tools

Use Node/PowerShell in this workspace:

- `node tools/build-chat-pack.mjs`
- `node tools/validate-package.mjs`
- `powershell -ExecutionPolicy Bypass -File tools/build-release-package.ps1 -Out .tmp/cur-20-a04/release -Label run1`

The original v3 Python tools are retained only as historical package inputs if present; v4 local validation uses the commands above.
