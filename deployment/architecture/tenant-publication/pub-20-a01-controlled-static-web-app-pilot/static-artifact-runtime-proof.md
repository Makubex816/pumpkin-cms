# Static artifact runtime proof

The immutable artifact remained SHA-256 `d02364ddd6970cc6e11a14dc753f0b240f46e14c7d8c7c2a65d41c6fbd484675` with manifest `1d95f749aa47368fb1c4accb4e240eb2ec2405c683b6cd2219cfb82f7ee7a1f7` and exactly eight expected files. Local inventory, secret, customer-payload, and absolute-path checks passed.

Runtime acceptance is blocked: the bytes contain no noindex meta, robots.txt, or X-Robots-Tag; the API origin is `api.synthetic.example.invalid`; the form has no runnable action/client or consent control; and metadata remains local-proof. Azure SWA global response headers come from `staticwebapp.config.json`, so technical noindex cannot be added without changing the frozen artifact.
