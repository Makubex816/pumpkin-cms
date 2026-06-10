# Rendering Control Model

Rendering control ensures disabled outbound links are not accidentally emitted as clickable anchors.

## Decision Inputs

- Global outbound link status.
- Specific instance status.
- Tenant/site outbound link policy.
- Preview mode.
- Static export mode.

## Rendering Decision Order

1. Resolve the instance by tenant, site, and location path.
2. Resolve the linked registry record.
3. Apply blocked-domain policy.
4. Apply global link status.
5. Apply instance status.
6. Apply tenant disabled behavior.
7. Emit deterministic output.

## Active Link Rendering

Active links render as anchors with safe rel behavior from policy. Default recommended rel values:

- `noopener`
- `noreferrer`

`nofollow` should be a tenant policy decision, not a hidden platform default.

## Disabled Behaviors

`plain_text`: render anchor text without an `href`.

`hidden`: omit the link and optionally omit surrounding decoration.

`disabled_state`: render visible text with a disabled style and no navigation.

`fallback`: render a tenant-approved fallback URL or fallback text.

## Static Export

Static output must be deterministic. A static export cannot depend on a live Admin lookup at render time. It must use a resolved outbound link state snapshot from the build input, tenant bundle, or CMS data snapshot.

## Preview

Privileged preview may show disabled links with labels for operators. Public output must not expose operator-only status metadata.
