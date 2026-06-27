# Runtime 500 Root Cause

Root cause:

`Jwt:SecretKey` was missing from the no-secret runtime environment, and the JWT bearer option setup directly called `Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)`.

Why health failed:

Authentication middleware initialized JWT bearer options before the health handler could return. Because the secret key was null, option initialization threw `System.ArgumentNullException`, producing HTTP `500` for both health routes.

What it was not:

- Not an Azure deployment failure
- Not a ZIP path-separator failure
- Not a .NET runtime stack mismatch
- Not a provider database dependency
- Not a contact-form dependency
- Not a FormEntry dependency
- Not an Admin live read dependency

Final local source fix makes missing JWT config non-fatal for unauthenticated requests and preserves protected-route behavior as unauthenticated without a valid token.
