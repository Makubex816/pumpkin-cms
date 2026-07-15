# Shared mobile consent layout standard

Package-rendered consent must use a required checkbox with a stable unique ID and semantic label association. Checkbox/radio/hidden/button/submit inputs must not inherit text-field dimensions. The control uses intrinsic compact sizing and visible keyboard focus; the label row provides the tap target, while its text flexes into the remaining width with natural wrapping and `min-width: 0`. Validate at 320, 360, 375, 390, 412, 768, and 1366 pixel widths with overflow and hit tests.
