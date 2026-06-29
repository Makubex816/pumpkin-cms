# V2.8.34 Controlled Key Rotation Result

Classification: `controlled_static_contact_key_rotation_blocked_isolated_http_400_rollback_complete`.

Result: blocked before production; rollback complete.

V2.8.34 generated a fresh tenant/static contact key, updated the source-discovered `ice-rink-rentals` Tenant auth record, bound isolated Static Web App contact appsettings, and ran the approved isolated verification path. The single isolated POST returned HTTP 400 and was not visible through Admin readback, so the hard stop blocked production. Tenant auth and isolated appsetting changes were rolled back.

The owner-only hard-copy and checksum were created outside the repo. Repo files contain no secret values.
