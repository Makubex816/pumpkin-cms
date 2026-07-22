
# Security and dependency review

Disposition: `QUALIFIED_WITH_HOLDS`

High-risk static secret findings: 0

All static scan findings: 12

Static findings:

- possible_connection_string_secret: `apps/pumpkin-api.Tests/Program.cs:98` —     password: adminPassword,  // ⚠️ REPLACE WITH YOUR SECURE PASSWORD
- possible_connection_string_secret: `apps/pumpkin-api.Tests/Program.cs:110` — Console.WriteLine($"Password:   {userPassword}");
- possible_connection_string_secret: `apps/pumpkin-api.Tests/README.md:65` —     password: "YourSecureP@ssw0rd!",  // Choose a strong password
- possible_connection_string_secret: `apps/pumpkin-api.Tests/README.md:146` — Password:   YourSecurePassword123!
- possible_connection_string_secret: `apps/pumpkin-api/Program.cs:1096` —             return Results.Problem($"Error resetting user password: {ex.Message}");
- inner_html_assignment: `apps/starter-app/src/app/admin/(workspace)/themes/_components/ThemeEditor.tsx:638` —     document.body.innerHTML = '<div class="preview-shell"><header class="pk-header"><div class="pk-header__container"><span class="pk-header__logo-text">Theme preview</span><a class="pk-header__cta" href="#">Get started</a></div></header><s
- possible_connection_string_secret: `apps/starter-app/src/app/api/admin/auth/login/route.ts:37` —       password: body.password,
- inner_html_assignment: `apps/starter-app/src/components/PageRenderer.tsx:72` —                     <div className="cms-rich-text" [redacted-long-token]{{ __html: sanitizeCmsHtml(body) }} />
- inner_html_assignment: `packages/pumpkin-block-views/src/views/BlogBlockView.tsx:10` —   /** Optional render function for the body content (e.g. to use a Markdown renderer). Falls back to dangerouslySetInnerHTML. */
- inner_html_assignment: `packages/pumpkin-block-views/src/views/BlogBlockView.tsx:65` —               <div [redacted-long-token]{{ __html: content.body }} />
- possible_connection_string_secret: `packages/pumpkin-ts-models/examples/user-example.ts:72` —   password: 'SecurePassword123!'
- possible_connection_string_secret: `packages/pumpkin-ts-models/README.md:75` —   password: 'SecurePassword123!'

`pumpkin-ts-models` npm audit:

- Total vulnerabilities: 2
- High: 2
- Critical: 0
- Finding names: brace-expansion, minimatch

Dependency audit commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 npm actual audit root | pass | 0 | 483 | `program-management/upstream-intake/UP-30-A01/logs/61_run1_npm_actual_audit_root.log` |
| run1 npm actual audit packages/pumpkin-ts-models | fail | 1 | 995 | `program-management/upstream-intake/UP-30-A01/logs/77_run1_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run1 npm actual audit packages/pumpkin-block-views | fail | 1 | 494 | `program-management/upstream-intake/UP-30-A01/logs/78_run1_npm_actual_audit_packages_pumpkin-block-views.log` |
| run1 npm actual audit starter | fail | 1 | 496 | `program-management/upstream-intake/UP-30-A01/logs/62_run1_npm_actual_audit_starter.log` |
| run2 npm actual audit root | pass | 0 | 497 | `program-management/upstream-intake/UP-30-A01/logs/71_run2_npm_actual_audit_root.log` |
| run2 npm actual audit packages/pumpkin-ts-models | fail | 1 | 744 | `program-management/upstream-intake/UP-30-A01/logs/79_run2_npm_actual_audit_packages_pumpkin-ts-models.log` |
| run2 npm actual audit packages/pumpkin-block-views | fail | 1 | 521 | `program-management/upstream-intake/UP-30-A01/logs/80_run2_npm_actual_audit_packages_pumpkin-block-views.log` |
| run2 npm actual audit starter | fail | 1 | 505 | `program-management/upstream-intake/UP-30-A01/logs/72_run2_npm_actual_audit_starter.log` |

Dependency audit remains held where package lock state was incomplete. The exact .NET SDK first run emitted a local development-certificate installation message; no trust command, deployment, or live activation was performed.
