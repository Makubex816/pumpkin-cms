# Root Cause Analysis

## Finding

The failure was a contract persistence gap, not a missing-field problem in the updated home/contact package. The normalized candidate JSON already carried the full homepage media asset ids, production-render fields, explicit `selectedMailbox`, and explicit `publicEmailDisplayPolicy`. The previous readback returned a narrower persisted/serialized shape.

## Contributing Causes

1. Several block models did not expose the updated package fields as first-class typed properties, including block media refs, section labels, CTA objects, service-area teaser metadata, and form mailbox metadata.
2. The page design guard did not enforce the updated home/contact domain routing contract for the `ice-rink-rentals` tenant.
3. The import preflight did not fail hard on this exact persistence loss pattern for the updated home/contact package. Its persistence phase also did not catch all production-render-compatible candidates and route variants.
4. The .NET contract tool lacked a dedicated paired home/contact validation command for this package and was coupled closely enough to the API project that validation could be affected by live API build locks.
5. The revision change-source allowlist did not include `updated_home_contact_package_import`, creating a risk that a valid import source would be normalized to `manual_unknown`.

## Non-Causes

- This was not caused by missing homepage media in the candidate file.
- This was not caused by an absent selected mailbox or email display policy in the candidate file.
- This run did not touch MediaAsset records, Theme records, static generation, deployment, DNS, email provider configuration, or protected config.
