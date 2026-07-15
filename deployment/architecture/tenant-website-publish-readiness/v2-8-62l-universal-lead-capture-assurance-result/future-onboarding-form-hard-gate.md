# Future Onboarding Form Hard Gate

`form-readiness-gate.mjs` implements all 30 required gates. Any absent evidence returns `forms_held_no_post` and throws `FORMS_HELD_NO_POST` if public activation is attempted. Only a complete 30/30 evidence record returns `ready_forms_live`. Focused tests cover both outcomes.
