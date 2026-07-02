# Source Build Result

Initial app-only build result: failed.

Initial blocker:

`pumpkin-block-views` built output could not resolve `lucide-react` from the uploaded package shape when only the app workspace had dependencies installed.

Adapted copied-workspace build result: passed.

Build command:

`npm run build`

Build output summary:

| route mode | summary |
| --- | --- |
| Static routes | Most page routes prerendered as static content |
| Dynamic routes | `/[...slug]` and `/sitemap.xml` remained server-rendered on demand |
| Build status | Passed after local package dependency installs |

Classification: `source_build_feasible_with_isolated_local_package_dependency_repair`

No source package or repo source file was modified.

