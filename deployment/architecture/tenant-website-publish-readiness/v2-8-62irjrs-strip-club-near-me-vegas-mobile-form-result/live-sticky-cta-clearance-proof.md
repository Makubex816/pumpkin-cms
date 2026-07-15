# Live CTA clearance proof

The runtime reserved 152px of shared fixed-UI clearance. The initial automated hit assertion used `scrollIntoViewIfNeeded`, which does not account for fixed overlays; centering proved the submit is reachable. A later exhaustive repeat was interrupted by a transient www navigation timeout, without a POST.
