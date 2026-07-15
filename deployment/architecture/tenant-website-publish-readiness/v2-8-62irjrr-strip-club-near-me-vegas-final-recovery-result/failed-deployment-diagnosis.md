# Failed deployment diagnosis

IRJR deployment `dbbe5740-8af7-44b3-a80c-7141474d3a60` failed because Windows `Compress-Archive` wrote backslash ZIP entry names. Linux Kudu extracted literal backslash names and parallel rsync failed with `Invalid argument (22)` across the package.

