# Starter Recovery Package Verification

- SHA-256: `fd60a5c6de86feb49e222b05379dc5f176f38bc49c2666972db64189275a06d0`;
- bytes: 6,590,257;
- entries: 1,838;
- Next static entries: 44;
- backslash, unsafe, duplicate, protected-config, and missing-required entries: 0;
- strong secret findings: 0;
- Party Pros and Vegas artifact sets: present.

An initial broad query-shape rule found `&sp=` in Next's vendored `browserify-zlib`. Entry-only review classified it as library code, not a SAS value. The corrected strong scan required credential assignments or a SAS signature/version pair and returned zero findings.
