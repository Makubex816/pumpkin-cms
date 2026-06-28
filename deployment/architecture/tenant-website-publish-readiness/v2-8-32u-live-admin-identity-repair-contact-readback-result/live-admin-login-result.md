# Live Admin Login Result

Status: not run after repair.

Reason:

No Admin identity repair occurred because the source-discovered `User` container was not found. The phase stopped before attempting a post-repair login.

Carryforward:

V2.8.32T already proved live Admin login returned HTTP 401 after provider binding became active. V2.8.32U did not repeat login because it could not perform the identity repair.

Bearer token issued: no.

