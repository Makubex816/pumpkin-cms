# Consent root cause

The checkbox inherited the broad text-input width, height, and padding rules. Its flex sibling consequently collapsed, producing one-word wrapping. The repair gives checkbox/radio controls compact intrinsic dimensions and gives label text the remaining width with `min-width: 0`.
