# V2.8.62IRJRS Vegas mobile form report

Final status: `blocked_replacement_submit_failed_no_retry_forms_reheld`.

The owner-reported consent and sticky-CTA defect was reproduced, repaired generically, tested, committed once, packaged, and deployed once. Live scanning confirmed an 18px required checkbox, stable label association, natural text width, zero horizontal overflow, 152px fixed-UI clearance, and zero Airstrip requests.

The prior IRJRR timeout was traced to its harness timing out before submit; the generic client envelope, correlation, and abort behavior were also hardened. No delayed IRJRR entry existed. The scoped Vegas key was activated without disclosure and exactly one replacement POST was issued. It timed out after 60 seconds. Twelve bounded authenticated readbacks found zero Vegas entries; Ice remained 5 and Party Pros 4. There is no FormEntry ID and entry-specific TenantAdmin proof could not complete. No external email was sent.

The Vegas key was deleted and the starter restarted. Apex, www, and preview are no-post. DomainBinding and the operational register were not advanced. Noindex, sitemap exclusion, and the Search Console hold remain intact. The next authorized task must diagnose the starter-to-API request hang without another public POST.
