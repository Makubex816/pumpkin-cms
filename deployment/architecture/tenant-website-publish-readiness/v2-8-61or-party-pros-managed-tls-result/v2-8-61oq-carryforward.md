# V2.8.61OQ Carryforward

OQ was committed before OR:

- Commit: `006d586b Add V2.8.61OQ Party Pros custom domain proof`.

Accepted OQ carryforward:

- Custom hostnames were bound to `app-pumpkin-starter-preview-centralus-001`.
- HTTP routing worked for apex and `www`.
- Generic starter host routing was implemented and deployed once in OQ.
- OQ starter redeploy id: `b15e7fae-e4b7-4853-a3b5-e9b474a09d89`.
- Forms rendered disabled/no-post.
- OQ managed TLS attempt timed out.
- OQ final readback showed no bound cert, `sslState=Disabled`, and `httpsOnly=false`.
- OQ non-Airstrip runtime no-regression passed 23/23.

OR did not deploy or redeploy source.
