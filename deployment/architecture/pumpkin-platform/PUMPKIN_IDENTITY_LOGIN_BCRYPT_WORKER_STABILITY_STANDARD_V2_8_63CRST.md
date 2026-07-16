# Identity login BCrypt worker-stability standard V2.8.63CRST

Every logical password login must make exactly one BCrypt verification unless a separately reviewed design proves otherwise. Never reduce the work factor, replace a customer hash, bypass verification, cache a successful password result beyond the logical request, or run duplicate verification through legacy and new compatibility paths.

Capture safe per-request stage metadata: worker digest, total duration, bounded locator and point-read duration, BCrypt count and duration, login accounting, identity write, session write, audit write, process CPU, available worker threads, and pending thread-pool work. Correlate exact request IDs in restricted logs and require one terminal record per proof request. Repository results must omit credentials, hashes, tokens, raw identity IDs, and non-required customer email addresses.

Worker stability is an outcome gate. Test both workers warm, restart once, then test the first identity request on each fresh worker before normal repetition and a maximum two-request burst. Health HTTP 200 is insufficient when it does not probe the identity dependency. A known post-start dependency delay must be represented by a truthful non-200 readiness endpoint and enforced by App Service routing/warmup.

CRST demonstrated one BCrypt call per accepted logical login. Its retained first-touch failures occurred before BCrypt and writes; later proofs reached maximum BCrypt durations of 2,442 ms in Stage A and 1,748 ms in stabilized Stage B. The package still failed worker-readiness acceptance because first-touch HTTP 503 remained routable.
