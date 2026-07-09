# Pumpkin Starter App Controlled Deployment V2.8.61OH

Status: deployed once.

Source:

- `apps/starter-app`
- `package-lock.json` present
- Type-check passed
- Build passed
- Next standalone output enabled in `apps/starter-app/next.config.js`

Deployment:

- Package type: standalone zip
- Package entries: 2201
- Package bytes: 6053498
- Package SHA-256: `511a46bdfce199bcbdc30032d825b1e861f3bd5701c03fef9ad506b62b2b1343`
- Successful deploy count: 1
- Startup command: `node server.js`

Runtime:

- `/`: HTTP 200
- `/admin/login`: HTTP 200
- `/admin`: HTTP 307 to `/admin/login`

No Pumpkin API, standalone Admin UI, Airstrip, or Ice deploy was performed.
