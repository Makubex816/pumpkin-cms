# Post-Deploy Production Route Check Result

Status: not run.

Reason:

```text
deployment_failed_before_success
```

The approved post-deployment checks were allowed only after a successful deployment. Because the deployment failed, no production-domain GET checks were run.

| URL | Result |
| --- | --- |
| `https://iceskatingrinkrentals.com/` | not run |
| `https://iceskatingrinkrentals.com/service-areas` | not run |
| `https://iceskatingrinkrentals.com/contact` | not run |
| `https://www.iceskatingrinkrentals.com/` | not run |
| `https://www.iceskatingrinkrentals.com/service-areas` | not run |
| `https://www.iceskatingrinkrentals.com/contact` | not run |

No crawl, outbound link follow, form submission, contact endpoint POST, or indexing trigger occurred.

