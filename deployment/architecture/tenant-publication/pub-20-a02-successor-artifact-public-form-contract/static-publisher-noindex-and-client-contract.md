# Static publisher noindex and client contract

The generic publisher emits robots.txt, page noindex,nofollow,noarchive metadata, global X-Robots-Tag, an empty sitemap, safe public identifiers, accessible consent and honeypot controls, and a bounded public-live client.

Preview mode sends no request. Public-live mode acquires a ticket and retries with one logical seed. No reusable tenant credential or secret is emitted. Static publisher tests passed 81/81.
