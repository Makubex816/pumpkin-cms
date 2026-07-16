# Next phase prompt

Do not begin V2.8.63D. V2.8.63CRST is blocked with `blocked_three_corrected_slot_candidate_cycles_failed` after consuming all three materially corrected slot candidates.

Request explicit owner approval for one fourth materially corrected slot candidate. The correction must be packaged with the runtime, not represented only by an operator delay. Implement a truthful readiness endpoint that returns non-200 until both conditions hold:

1. The current process is at least 90 seconds old.
2. A bounded, zero-write identity/Cosmos dependency probe succeeds on that process.

Configure the supported App Service startup, health, and swap-warmup controls so only HTTP 200 from that endpoint admits the worker or completes a swap. Prove the configuration on both S2 workers, including a restart and the first identity request on each worker, without prewarming the identity path through unrecorded traffic.

Begin from clean source `6d781337` / branch source `2864c664`; preserve all earlier source commits, the final package hash `0eed05a93c21f1291a8d2d1e89c15ef7c7b00d6dca3d729f7987a17e9e7aae29`, deployment `31667716-211b-473d-8027-e98e92d0e895`, both retained first-touch failures, and the passing 136.542-second proof. Build a new immutable package only after approval, count it explicitly as candidate four, and rerun all Stage A and Stage B schedules. Do not promote on an operator sleep alone.

Keep production unchanged with dual-write disabled, retain S2/two workers, and keep the validation slot stopped until the approved continuation begins. Continue to prohibit tenant rename, Airstrip public runtime, indexing changes, capacity above S2/two workers, another paid plan, and secret exposure.

The current S2 approval expires at 2026-07-18T19:54:40.8078855Z. If the approved continuation or safe S2 retention will extend beyond that timestamp, obtain an explicit owner extension before the window expires.
