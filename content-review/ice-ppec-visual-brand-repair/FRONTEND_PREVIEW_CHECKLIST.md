# Frontend Preview Checklist

- Preview checked: yes
- Preview HTTP status: 200
- Preview contains PPEC class: yes
- Preview server HTML contains PPEC logo URL: no
- CMS readback contains PPEC logo URL: yes
- Preview note: The `/__preview` route server response is the client preview shell; actual draft content is fetched in-browser with a local admin JWT.
- URL: `http://localhost:3002/__preview/ice-rink-rentals/home`

Manual browser review remains required before static regeneration or production/indexing.
