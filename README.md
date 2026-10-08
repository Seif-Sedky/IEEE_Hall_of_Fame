# IEEE GUC Hall of Fame
Dev: `npm install && npm run dev`
Deploy: push to `main` on repo `IEEE_Hall_of_Fame`, then Settings > Pages > Source: GitHub Actions.
Update content: edit `src/data/*.json` (scores, tiers/cutoffs, Drive link, teams). Photos: replace files in `public/members/` keeping the same names.
Add an event: write a component in `src/events/`, then register it in `src/events.config.jsx` with `status:'live'`.
