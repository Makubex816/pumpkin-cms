# Link Instance Tracking Model

An outbound link instance is one placement of a registered outbound URL.

## Required Tracking Fields

- tenant and site scope;
- registry link id;
- content type;
- page or route id when applicable;
- block/component id when applicable;
- source field name;
- deterministic `location_path`;
- anchor text;
- instance status;
- first and last detection timestamps.

## Location Path

`location_path` should be stable enough for scanner diffing and operator review. Examples:

- `pages/home/blocks/hero/ctaLinks/0/url`
- `navigation/main/items/2/href`
- `theme/footer/socialLinks/1/url`
- `forms/contact/helpText/links/0`

The path must not include raw HTML snippets or full content payloads. It should identify where the link was found.

## Instance Lifecycle

1. New placement found: create instance with `enabled` or `pending_review`.
2. Existing placement found again: update `last_detected_at`.
3. Placement missing in later scan: mark `stale`, do not delete immediately.
4. Operator disables one placement: set instance status to `disabled`, `hidden`, `plain_text`, or `fallback`.
5. Global link disabled: all enabled instances render according to policy without mutating each instance.

## Duplicate Handling

Multiple placements on one page are separate instances if they have distinct location paths. Identical URL and anchor text in different blocks must not collapse into one record.
