# Extension Validation and Testing

Required checks:

- manifest JSON parse
- manifest schema validation
- permission review
- tenant scope validation
- migration dry run
- unit tests for extension logic
- integration tests for routes/API/components
- static export validation if frontend output changes
- secret scan
- rollback test or rollback review

Production enablement is blocked until tests pass.

