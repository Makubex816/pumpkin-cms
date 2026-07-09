# Party Pros Unpublished Preview Proof V2.8.61OJ

Status: live GET proof passed.

Preview host:

`https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`

Party Pros unpublished preview routes:

| Route | Status | Party Pros content | Preview disabled marker | Quote form marker |
| --- | ---: | --- | --- | --- |
| `/preview/party-pros-philadelphia` | 200 | yes | yes | yes |
| `/preview/party-pros-philadelphia/contact` | 200 | yes | yes | yes |
| `/preview/party-pros-philadelphia/service-areas` | 200 | yes | yes | yes |

Admin/default host boundaries:

| Route | Status | Result |
| --- | ---: | --- |
| `/` | 200 | starter default page served |
| `/admin/login` | 200 | login page served |
| `/admin` | 307 | redirected to `/admin/login` |

The proof used GET-only requests. It did not publish Party Pros pages, mutate Party Pros CMS records, submit a form, POST to contact endpoints, change DNS, or touch Airstrip.
