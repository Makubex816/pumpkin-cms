# Next Auth Retry Steps

1. In the admin browser session at `http://localhost:3000`, confirm the token source:

```js
Object.keys(localStorage)
  .filter((key) => /pumpkin|auth|token|tenant|user/i.test(key))
  .map((key) => {
    const value = localStorage.getItem(key) || '';
    return {
      key,
      length: value.length,
      looksJwt: value.split('.').length === 3,
      startsBearer: /^Bearer\s+/i.test(value.trim()),
      startsJson: value.trim().startsWith('{')
    };
  })
```

2. Copy the raw JWT only:

```js
copy((localStorage.getItem('pumpkin_auth_token') || '').replace(/^Bearer\s+/i, '').trim())
```

3. Write the copied token to the temp file from PowerShell:

```powershell
Set-Content -NoNewline -Path "$env:TEMP\pumpkin-admin-jwt.txt" -Value (Get-Clipboard)
```

4. Run the safe shape helper:

```powershell
node tools\auth-diagnostics\inspect-admin-jwt-shape.mjs
```

Expected safe signs:

- `tokenPresent: true`
- `partsCount: 3`
- `expired: false`
- `tenantId: "ice-rink-rentals"` or `role: "SuperAdmin"`

5. Run the safe auth probe without consuming the temp file:

```powershell
node tools\auth-diagnostics\probe-admin-auth.mjs --api-base http://localhost:5064
```

Expected result before import retry:

- `status: 200`
- `safeCategory: "valid"`

6. Only after the probe is valid, rerun the guarded homepage/contact local draft import.

Still blocked before static regeneration or production/indexing:

- Manual browser review.
- Separate approval for static regeneration.
- Separate approval for production publishing, deployment, indexing, DNS/email/provider, Azure, Cloudflare, Bluehost, and Roller work.

