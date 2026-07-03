# Local Server Result

Render mode:

`production_next_server_localhost`

Server command:

`node node_modules/next/dist/bin/next start -p <dynamic-port> -H 127.0.0.1`

Result:

| check | result |
| --- | --- |
| Localhost-only server started | pass |
| Homepage returned HTTP 200 | pass |
| Screenshot capture completed | pass |
| Server stopped after capture | pass |

The local preview server used an ephemeral localhost port and was stopped after screenshot capture.

