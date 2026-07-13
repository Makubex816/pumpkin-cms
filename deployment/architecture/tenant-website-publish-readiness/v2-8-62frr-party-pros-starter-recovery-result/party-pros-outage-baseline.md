# Party Pros Outage Baseline

Before recovery:

- public custom-domain routes: 0/16, HTTP 404;
- Azure preview routes: 0/8, HTTP 404;
- required theme alias: 0/1, HTTP 404;
- accepted CMS and media data remained intact;
- root cause: the clean shared package did not contain Party Pros runtime artifacts.

This was a deployment completeness defect, not tenant data deletion.
