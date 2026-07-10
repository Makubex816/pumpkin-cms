# CMS Persistence Decision Packet

## Current Model

The accepted OSG visual repair is currently delivered by shared starter runtime source plus a compiled Party Pros fixture and a tenant stylesheet. It is not represented as the authoritative Party Pros CMS page/theme structure.

## OSH Decision

Keep the current runtime/fixture implementation as the accepted live baseline for now. Do not mutate Party Pros CMS records in OSH.

Open a separately approved persistence phase after form closure to:

1. model the accepted structured blocks, site chrome, theme tokens, page metadata, FormDefinition binding, and safe media references as tenant CMS records;
2. update the package compiler so the accepted visual structure is reproducible rather than hand-maintained in a deployed fixture;
3. compare CMS-rendered output against the accepted OSG baseline at desktop and mobile widths;
4. switch runtime source only after readback, owner acceptance, backup, and rollback evidence;
5. preserve the current fixture until CMS output reaches visual and functional parity.

## Standard Decision

Future tenant publish-readiness claims should require an owner-supplied visual reference when one exists, safe static inventory without executing uploaded code, structured visual mapping, responsive proof, and explicit owner acceptance before publish.

CMS mutation count in OSH: 0.

