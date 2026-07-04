# CDN And Front Door Separation Plan

Status: design complete.

CDN and Front Door are future hosting/edge workflows and are not part of the first App Service binding manager implementation.

Rules:

- App Service custom-domain binding is the first supported hosting target.
- Front Door target support requires a separate design and approval.
- CDN/edge certificate, routing, WAF, origin, and caching decisions must not be hidden inside the basic domain binding workflow.
- The DomainBinding model may reserve `front_door_future` as a hosting target type, but no Front Door mutation is approved in V2.8.60S.

