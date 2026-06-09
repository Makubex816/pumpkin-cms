# Standard Backup Secret Exclusion Result

Standard backups remain secret-free by contract.

The validator rejects:

- encrypted escrow payload files;
- unexpected escrow files;
- protected config filenames;
- token/JWT/credential/auth-header/cookie/connection-string/storage-key/private-key filenames;
- obvious secret-like values;
- config inventory values that are not redacted markers.

The standard backup flow still writes only `escrow/ESCROW_NOT_INCLUDED.md`. No encrypted secret escrow payload was created.
