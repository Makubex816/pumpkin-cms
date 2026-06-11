# Readback Plan Result

Status: passed.

The generated readback plan requires:

- tenant/site scoped reads only
- expected record count of 48
- expected entity counts
- targetRecordId and targetEntity comparison
- before/after/readback hash comparison where available
- stop on missing records, duplicates, tenant mismatch, partition mismatch, checksum mismatch, or unexpected entity count

