# Current Live Form Mode Recheck

Before repair:

| Surface | Mode | Button | Result |
| --- | --- | --- | --- |
| apex `/contact` | `disabled-preview` | disabled `Preview only` | no-post |
| `www` `/contact` | `disabled-preview` | disabled `Preview only` | no-post |
| explicit preview `/contact` | compiled preview | disabled `Preview only` | no-post |

Existing starter settings were checked without exposing values:

- Party Pros tenant setting present and matched: yes;
- API key setting present: yes;
- API URL setting present: yes;
- configured host-route override present: no.

After repair and deployment:

| Surface | Mode | Button | Form attributes |
| --- | --- | --- | --- |
| apex `/contact` | `live-submit` | enabled `Send Details` | React handler; no static action/method |
| `www` `/contact` | `live-submit` | enabled `Send Details` | React handler; no static action/method |
| explicit preview `/contact` | compiled preview | disabled `Preview only` | no static action/method |

The client handler targets `/api/forms/submit/party-pros-quote-request` with POST only after an enabled live form is submitted. All mode/readback checks themselves used GET only.

Functional source warning: `ContactFormBlock` renders `formDefinition.fields` but not `formDefinition.consent`. The Party Pros definition requires consent, so browser-level submission must not be declared ready until a visible consent control is implemented and reproven.

