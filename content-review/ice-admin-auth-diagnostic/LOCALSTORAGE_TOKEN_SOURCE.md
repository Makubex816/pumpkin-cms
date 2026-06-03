# LocalStorage Token Source

Expected key:

```js
localStorage.getItem('pumpkin_auth_token')
```

Expected value shape:

- Raw JWT string only.
- Exactly three dot-separated parts.
- No `Bearer ` prefix in the file.
- No JSON wrapper.

Related keys that should not be copied as the token:

- `pumpkin_user`
- `pumpkin_current_tenant`

Safe browser console discovery command:

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

Safe copy command for the expected raw token:

```js
copy((localStorage.getItem('pumpkin_auth_token') || '').replace(/^Bearer\s+/i, '').trim())
```

PowerShell command to write the copied token to the expected temp file:

```powershell
Set-Content -NoNewline -Path "$env:TEMP\pumpkin-admin-jwt.txt" -Value (Get-Clipboard)
```

Do not paste the token into chat.

