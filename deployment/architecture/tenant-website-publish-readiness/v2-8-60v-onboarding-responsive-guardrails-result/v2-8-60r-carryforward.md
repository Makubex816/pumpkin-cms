# V2.8.60R Carryforward

Preserved V2.8.60R facts:

- Active Airstrip `globals.css` missed mobile nav collapse rules from the original static CSS.
- `.as-nav-right` kept the full desktop nav and CTA visible on mobile.
- Fixed/min-width grids and sections lacked scoped responsive constraints.
- The failures caused horizontal overflow, clipped request button, clipped hero/section content, and sideways mobile layout.
- Durable patch reference exists at `deployment/airstrip/patches/v2-8-60r-mobile-responsive/`.
- V2.8.60R reported local, isolated, and production responsive proof passing 28/28.
- V2.8.60R reported zero overflow, zero console errors, zero failed requests, and zero missing images.

V2.8.60V folded those lessons into the package contract, runbooks, checker, and durable docs.
