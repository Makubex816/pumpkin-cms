# Safety Guard Policy

## Policy

Keep staged-path protection strict.

The guard must continue to block paths that suggest raw inputs, generated output, protected config, env files, key material, JWTs, tokens, auth material, or credential-bearing files.

## Documentation Naming Rule

Safe documentation should avoid high-risk path terms even when the content is about security or protected-path handling.

Preferred neutral filename terms:

- `PROTECTED`
- `CREDENTIAL_BOUNDARY`
- `ACCESS_CONTROL`
- `CONFIG_BOUNDARY`
- `SAFETY_GUARD`

Avoid high-risk filename terms in staged documentation paths:

- `secret`
- `token`
- `jwt`
- `api-key`
- `.env`
- `appsettings`
- `local.settings`

## Blocker Handling

If the staged-path safety check returns any path:

- do not commit;
- unstage the path;
- determine whether it is real protected material or a documentation filename false positive;
- for documentation false positives, rename to a neutral filename and update references;
- never weaken the guard to make a path pass.
