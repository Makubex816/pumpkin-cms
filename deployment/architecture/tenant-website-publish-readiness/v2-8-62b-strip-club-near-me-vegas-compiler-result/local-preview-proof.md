# Local Preview Proof

Preview fixture: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-62b\preview-fixture`

Browser proof: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-62b\preview-proof\preview-result.json`

The preview fixture preserves static HTML/CSS/media structure, removes all script elements and event-handler attributes, excludes the source JavaScript file, makes submit controls inert, and neutralizes HTTP(S) links. Chrome also disabled script execution and blocked HTTP(S) before navigation.

| Route | 390x844 | 1440x1200 |
| --- | --- | --- |
| `/` | pass | pass |
| `/clubs/treasures-las-vegas` | pass | pass |
| `/guides/dress-code` | pass | pass |
| `/contact` | pass | pass |

Across 8 renders: maximum horizontal overflow 0 pixels; broken images 0; active submit controls 0; script elements 0; external request attempts 0; Airstrip request attempts 0; loading failures 0; console messages 0. Screenshots ranged from 217,918 to 1,618,248 bytes and were stored outside the repository.

No form interaction or submission occurred. Interactive source-JavaScript behavior, including the mobile menu, was intentionally not executed and remains a later runtime adapter concern.
