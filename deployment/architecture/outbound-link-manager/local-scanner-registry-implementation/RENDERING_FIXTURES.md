# Rendering Fixtures

Rendering fixtures:

- `render-active-links.fixture.json`
- `render-disabled-global-link.fixture.json`
- `render-disabled-instance.fixture.json`
- `render-hidden-mode.fixture.json`
- `render-plain-text-mode.fixture.json`
- `render-fallback-mode.fixture.json`
- `render-domain-blocked.fixture.json`
- `render-pending-review.fixture.json`

Fixtures are fake local JSON only. They select render targets by domain, instance, link, page, normalized URL, or location path and may provide fixture-only render modes such as hidden, plain text, or fallback.

Fixtures do not crawl URLs, read protected config, write CMS data, or call live services.
