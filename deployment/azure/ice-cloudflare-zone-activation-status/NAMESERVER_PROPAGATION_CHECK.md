# Nameserver Propagation Check

## Expected Nameservers

```text
amy.ns.cloudflare.com
bob.ns.cloudflare.com
```

## Local Resolver Check

Command:

```text
nslookup -type=ns iceskatingrinkrentals.com
```

Result:

```text
iceskatingrinkrentals.com nameserver = amy.ns.cloudflare.com
iceskatingrinkrentals.com nameserver = bob.ns.cloudflare.com
```

## Cloudflare Resolver Check

Command:

```text
nslookup -type=ns iceskatingrinkrentals.com 1.1.1.1
```

Result:

```text
iceskatingrinkrentals.com nameserver = amy.ns.cloudflare.com
iceskatingrinkrentals.com nameserver = bob.ns.cloudflare.com
```

## Google Resolver Check

Command:

```text
nslookup -type=ns iceskatingrinkrentals.com 8.8.8.8
```

Result:

```text
iceskatingrinkrentals.com nameserver = amy.ns.cloudflare.com
iceskatingrinkrentals.com nameserver = bob.ns.cloudflare.com
```

## Propagation Status

Nameserver propagation to Cloudflare is visible from the checked resolvers.

