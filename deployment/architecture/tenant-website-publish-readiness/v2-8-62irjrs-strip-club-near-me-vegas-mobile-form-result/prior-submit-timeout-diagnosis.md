# Prior timeout diagnosis

The IRJRR harness exhausted its 30-second limit during parallel Admin authentication/pre-count before reaching the form-submit call. Separately, the client adapter used flat fields instead of the API's `formData` envelope. Both conditions were addressed before the replacement attempt.
