# Manual Visual QA Checklist

Date: 2026-06-03

Use these local URLs:
- Homepage draft preview: `http://localhost:3002/__preview/ice-rink-rentals/home`
- Contact: `http://localhost:3002/contact`
- Service areas unchanged check: `http://localhost:3002/service-areas`

Homepage notes:
- Use the draft preview URL, not public `/`.
- Load the local admin JWT in the browser session before judging the draft preview shell.
- Do not paste or capture the JWT in notes, screenshots, console logs, or reports.

## Homepage

- [ ] Hero layout is visually balanced.
- [ ] Homepage images render and crop correctly.
- [ ] PPEC section color/style matches the repaired brand treatment.
- [ ] PPEC logo is visible and clear.
- [ ] PPEC CTA wording is correct.
- [ ] PPEC CTA link behavior is correct.
- [ ] Mobile layout is readable and not cramped.
- [ ] CTA spacing is consistent.
- [ ] No stray text, debug labels, or unexpected numbers appear.
- [ ] Footer and nav remain intact.
- [ ] Email visibility follows the form-first under-review policy.
- [ ] Contact CTA behavior is correct.

## Contact

- [ ] Form layout is clear.
- [ ] Form labels are readable and aligned with fields.
- [ ] Submit CTA is visible and correctly worded.
- [ ] Mobile layout is readable and not cramped.
- [ ] PPEC/support callout, if present, does not compete with the form.
- [ ] No broken styling appears.
- [ ] No public email appears unless explicitly approved.
- [ ] No raw CF7 runtime behavior is visible.

## Service Areas

- [ ] `http://localhost:3002/service-areas` remains unchanged or 404.

