# Google Indexing Deferred Carryforward

Google/Search Console/indexing remains deferred by hard stop.

Admin bridge requirements:

- keep `INDEXING_DEFERRED` warning visible;
- keep `google-indexing-deferred` next gate visible;
- keep request indexing future action disabled;
- do not call Search Console;
- do not submit sitemaps;
- do not use URL Inspection API;
- do not use Google Indexing API;
- do not request indexing;
- do not run crawls or outbound live checks.

The future API bridge may display indexing state from the API envelope, but it must not turn the displayed state into an executable action.

