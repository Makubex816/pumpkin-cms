# Cloudflare Preflight

Date: 2026-06-05

## Credential Presence

Only presence/missing status was checked. No credential values were printed.

```text
CLOUDFLARE_API_TOKEN=PRESENT
CLOUDFLARE_ZONE_ID=PRESENT
```

Cloudflare token verification result:

```text
token status: active
```

No token value was printed.

## Zone Verification

Read-only Cloudflare API verification:

```text
zone name: iceskatingrinkrentals.com
zone status: active
assigned nameservers: amy.ns.cloudflare.com, bob.ns.cloudflare.com
```

Zone ID matched the requested site. No unrelated zone was used.

## Existing Media State

Read-only DNS record check:

```text
media.iceskatingrinkrentals.com Cloudflare DNS record count: 0
```

Read-only ruleset check:

```text
existing custom media rules: 0
managed zone rulesets only before this run
```

No existing media DNS/rule conflict was found.

## Rule Product Checks

Cloudflare rejected the required Origin Rule HostHeader override:

```text
message: not entitled to use the HostHeader override
source: /rules/0/host_header
```

Cloud Connector was not available through the probed ruleset phase:

```text
phase: http_request_cloud_connector
message: unknown phase "http_request_cloud_connector"
```

Because the safe rule-based path requires HostHeader/SNI behavior for Azure Blob, setup stopped before DNS creation.

## No-Secret Confirmation

No Cloudflare token, Azure token, storage key, connection string, or SAS URL was printed.
