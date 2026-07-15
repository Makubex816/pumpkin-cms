# Hydration root cause

`ensureConsent` called `form.insertBefore(label, submit)` although the selected submit control can be nested below the form. DOM `insertBefore` requires the reference node to be a direct child, so Chromium raised `NotFoundError` and Next rendered its client application error state.

