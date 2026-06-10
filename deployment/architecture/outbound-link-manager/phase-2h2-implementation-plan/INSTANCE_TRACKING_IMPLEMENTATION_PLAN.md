# Instance Tracking Implementation Plan

The instance tracker owns placements of registered outbound links.

## Local Responsibilities

- compute deterministic instance id from link id and location path;
- record page, content type, block id, field name, anchor text, and location path;
- validate each instance references a known link;
- detect duplicate placements without collapsing them;
- classify stale instances by comparing previous and current scans.

## Required Fixture Cases

- no links;
- one link;
- duplicate same URL in multiple fields;
- same URL across multiple pages;
- same URL with different anchor text;
- missing previous instance becomes stale;
- disabled instance remains disabled even when global link is active.

## Future Runtime Behavior

Future runtime writes must never delete stale instances immediately. Mark stale first, then allow operator archive through a later approved action.
