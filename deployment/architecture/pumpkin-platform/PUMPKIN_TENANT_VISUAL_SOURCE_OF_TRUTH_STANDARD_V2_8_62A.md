# Pumpkin Tenant Visual Source of Truth Standard V2.8.62A

## Identification

Every tenant intake must name one authoritative presentation source or explicitly state that no visual source exists. Record exact archive discovery, bytes, SHA-256, and package shape without guessing truncated filenames.

## Safe Inspection

- reject archive traversal, absolute, duplicate, and malformed path entries;
- extract only to ignored or outside-repository workspaces;
- do not execute uploaded scripts, build hooks, macros, or binaries;
- parse HTML with scripts disabled or use a non-executing parser;
- inventory protected filenames without reading protected values;
- never stage source packages or extracted content.

## Classification

Classify the source as static HTML, framework source, mixed/hybrid, compiled output, or unknown. A compiled static site can be the visual source of truth while still being unsuitable for direct import.

## Conversion Rules

- preserve hierarchy, navigation, typography, imagery, and route intent;
- compile into structured tenant records and runtime fixtures;
- repair broken references only in generated output;
- leave the source archive immutable;
- deduplicate media by content hash and import only selected/approved assets;
- replace unsafe form behavior with the shared form pipeline;
- keep previews noindex and non-public until owner approval.

If one complete package contains the intended HTML, CSS, media, and interaction design, a separate visual-reference package is unnecessary unless the owner identifies a competing source.
