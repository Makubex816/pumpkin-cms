# V2.8.61OI Carryforward

V2.8.61OI commit: `13710ee9`.

V2.8.61OH commit: `f1d92953`.

Carried forward from OI:

- Existing starter preview host was available.
- Starter default route served 200.
- Starter `/admin/login` served 200.
- Starter `/admin` redirected to `/admin/login`.
- Party Pros preview routes were blocked by missing adapter/runtime source, not by host availability.
- No OI deploy, appsetting mutation, DNS/custom-domain action, Party Pros mutation, POST, or Airstrip action occurred.

OJ resumed from that state, reviewed existing OJ source changes, built the adapter, and redeployed only the starter preview App Service.
