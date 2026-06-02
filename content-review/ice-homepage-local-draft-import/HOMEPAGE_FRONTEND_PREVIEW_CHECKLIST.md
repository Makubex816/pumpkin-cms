# Homepage Frontend Preview Checklist

Frontend preview was not checked after import because no import occurred.

API reachability before auth check:

- `http://localhost:5064`: reachable

Manual preview URL for the next successful local draft import:

```text
http://localhost:3002/
```

After a successful import, verify:

- the Ice frontend route `/` renders the CMS homepage draft or refreshes into the new draft state
- hero and use-case images resolve through bound local MediaAsset URLs
- the quote form renders as the Pumpkin `default-quote-request` form block
- no public email or phone value appears unless explicitly approved
- `/contact` and `/service-areas` are unchanged

