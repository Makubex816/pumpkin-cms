# Pre-Cutover Public Baseline

Generated: 2026-06-06

## Public HTTPS Before Cutover

| URL | Result |
| --- | --- |
| `https://iceskatingrinkrentals.com` | unable to connect |
| `https://www.iceskatingrinkrentals.com` | unable to connect |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 200 |

## Interpretation

The Azure default hostname was already serving the validated Ice static output. The production apex and `www` hostnames were not serving usable HTTPS before the approved custom-domain and DNS cutover.

## Boundary

This was a read-only public HTTP check.
