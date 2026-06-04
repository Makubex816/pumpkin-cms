# Route Verification

Safe read-only route probes were run against the local frontend.

| Route | URL | HTTP | Length | Marker Checks | `contactus@` |
| --- | --- | --- | --- | --- | --- |
| `/` | `http://localhost:3002/` | 200 | 178963 | `Planning more than the rink?`, `Party Pros East Coast`, `Explore Party Pros East Coast` present | absent |
| `/contact` | `http://localhost:3002/contact` | 200 | 149666 | `Request an Ice Rink Rental Quote`, `default-quote-request`, contact hero MediaAsset ID present | absent |
| `/service-areas` | `http://localhost:3002/service-areas` | 200 | 112761 | `Service Areas`, `Request a Quote`, `Portable Ice Rink` present | absent |

No draft preview route was required for this approval check. No static generation was run.
