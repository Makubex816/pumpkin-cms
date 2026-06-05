# Cost And Region Notes

Generated: 2026-06-04

## Proposed Region

```text
eastus
```

This is a concrete US East region proposal for the Ice production media origin.

## Proposed SKU

```text
Standard_LRS
```

Rationale:

- simple baseline storage SKU
- suitable for a small initial production media set
- lower cost than geo-redundant options
- can be revisited before higher traffic or stricter durability requirements

## Proposed Access Tier

```text
Hot
```

Rationale:

- media assets are expected to be web-served
- the current set is small
- Hot tier avoids cold-access assumptions during launch validation

## Cost Boundaries

This package does not create billable resources.

Future approved resource creation may create Azure costs for:

- storage account capacity
- read operations
- write operations
- egress
- metadata operations
- future CDN or Cloudflare origin traffic, if configured later

## Region Uncertainty

If the Azure subscription has a preferred region, billing constraint, policy constraint, or compliance requirement, stop and revise the proposed region before creation.

Do not create resources in a different region without explicit approval.
