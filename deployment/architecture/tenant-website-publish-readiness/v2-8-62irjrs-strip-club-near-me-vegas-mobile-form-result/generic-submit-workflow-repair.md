# Generic submit workflow repair

The shared client now sends the FormEntry envelope, generates a correlation UUID, applies a 45-second abort, retains the correlation for readback, and has no automatic retry path.
