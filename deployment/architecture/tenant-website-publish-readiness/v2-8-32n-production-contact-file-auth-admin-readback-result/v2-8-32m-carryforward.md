# V2.8.32M Carryforward

V2.8.30 selected `admin-persistence-required`: accepted contact submissions must create Pumpkin `FormEntry` records in the backend read by Admin. Email-only delivery does not close this gate.

V2.8.31 implemented the local compat `/api/static-contact` path for Admin persistence through Pumpkin API mode. It did not deploy and did not send a contact POST.

V2.8.32A through V2.8.32J moved Pumpkin API runtime readiness forward, including health endpoint implementation, Central US runtime selection, and the V2.8.32J live health recovery where `/health` and `/api/health` returned `200 OK`.

V2.8.32K completed provider/contact binding preflight and Static Web App contact binding. It did not submit a contact form and left the contact gate open pending live POST plus Admin FormEntry readback.

V2.8.32L confirmed health and contact page checks, but Admin FormEntry readback returned HTTP `401` without approved auth. It sent zero production POSTs and classified `readback_auth_missing`.

V2.8.32M selected custom-header readback mode, but the header name/value were not visible to Codex through env. It sent zero production POSTs and classified `readback_custom_header_env_missing`.

V2.8.32N resolves the env-inheritance blocker by using the single approved ignored auth file. That file was readable and complete, but the Admin route still returned HTTP `401`, so the remaining blocker is now `readback_auth_invalid_or_insufficient`.

