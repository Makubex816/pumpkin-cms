# API solution NuGet lockfile policy

The Pumpkin API solution commits NuGet locks for its three projects. The
policy is intentionally scoped by `apps/Directory.Build.props` to:

- `pumpkin-api`
- `pumpkin-api.Tests`
- `pumpkin-net-models`

The default API graph enables the Mongo provider and uses each project's
standard `packages.lock.json`.

`EnableMongoProvider=false` removes `MongoDB.Driver` from the API graph. NuGet
cannot truthfully represent both conditional graphs in one lock file, so the
API and test projects use `packages.cosmos-only.lock.json` for that explicit
configuration. The models project has no package dependency variance and keeps
one standard lock.

Generate or intentionally refresh the locks only during an approved dependency
change:

```text
dotnet restore apps/pumpkin-api/pumpkin-api.sln --force-evaluate
dotnet restore apps/pumpkin-api/pumpkin-api.sln --force-evaluate -p:EnableMongoProvider=false
```

Clean-room and CI verification must not update the locks:

```text
dotnet restore apps/pumpkin-api/pumpkin-api.sln --locked-mode
dotnet restore apps/pumpkin-api/pumpkin-api.sln --locked-mode -p:EnableMongoProvider=false
```

Both locked restores must pass, and all five lockfile hashes must remain
unchanged. Do not use a successful locked-mode restore as evidence when the
corresponding committed lock file is absent.
