# Party Pros Media Rendering Repair V2.8.61OSB

V2.8.61OSB repaired the Party Pros shared-starter preview/runtime shell so custom-domain pages render tenant-scoped public blob images.

Result:

- Root cause: fixture/page media slot omission.
- Starter source repair: generic nested media hydration in `PageRenderer`.
- Host route safety: Party Pros built-in route remains `disabled-preview` by default.
- Deployment: one starter App Service redeploy, `RuntimeSuccessful`.
- Custom-domain image proof: passed for home, contact, and service areas.
- Forms remained no-post/disabled.
- Airstrip stayed untouched.

No Party Pros CMS record mutation or media upload/delete occurred.
