# Live Admin Login Result

Status: not run.

Source-discovered login route:

`POST /api/auth/login`

Source-discovered payload shape:

`{ email, password }`

Reason login did not run:

The Admin/JWT auth setting was not bound because the approved secure file was missing `adminJwtSecretValue`.

No admin password was printed or written.

No token or cookie was requested, printed, or written.

