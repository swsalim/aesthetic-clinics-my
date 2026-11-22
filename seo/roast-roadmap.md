# SEO Roast Roadmap: aestheticclinics.my (2026-11-22)

Verdict: Google can crawl you. It is also being asked to rank 43 city pages that list one or two clinics.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | REVENUE | 43 of 75 city URLs list 1–2 clinics, stay `index,follow`, and sit in `server-sitemap.xml`. States under 3 clinics are already `noindex` and absent from the sitemap. | Thin city URLs teach Google the `/{state}/{area}` template is low value, which drags Petaling Jaya, Cheras and the other pages that can actually win a search. | Same floor of 3 clinics for city robots and the sitemap. Pages stay linked. | agent | shipped in this change |
| 2 | REVENUE | A clinic page’s only reliable in-body links are “Nearby Clinics”, and that block is omitted when fewer than two neighbours exist. One-clinic cities therefore have a single inbound listing link. | Those clinic URLs are the pages that should receive the enquiry. They are easy for Google to treat as orphans once the thin city URL is noindexed. | After the thin cities drop out of the index, add two contextual links from the parent state page and one guide that matches the clinic’s main service. | founder | next |
| 3 | COMPOUNDING | Clean referring-domain count was not measured. Ahrefs and DataForSEO credentials are not in this environment, so no DR or link-gap number is claimed. | Editorial links are what would move “aesthetic clinic {city}” once the thin URLs are gone. A bought-widget DR number would not. | Export dofollow, in-content, one-per-domain referring pages with traffic above 10, for this site and three directories that rank for “aesthetic clinic kuala lumpur”. Record the gap before any outreach. | founder | next |

## What already passed

- `robots.txt` on production allows every crawler and blocks `/dashboard`, `/api`, `/login`, and `/submit/success`. Sitemap lines point at `https://www.aestheticclinics.my/sitemap.xml` and `server-sitemap.xml`. Both return XML.
- `/no-such-page-xyz` and `/not-a-real-state` return 404.
- No locale tree.
- Homepage, FAQ, browse Markdown and `llms.txt` agree: 474 clinics, 15 states, 75 cities, 35 doctors, 18 guides.
- Homepage first screen has “Browse all states” and “Browse doctors”. No map wall.
- `/advertise-with-us` prints RM 59, RM 89 and RM 149 in the HTML for GPTBot.
- City FAQs insert the city name and the live count. They are not one copied answer.
- Guides are in the main nav. The sitemap lists home, browse, guides, 9 states, 474 clinic URLs and 35 doctor URLs.

## Fluff (ignore until the rows above ship)

- The committed `public/robots.txt` still says `localhost:3000`. Production overwrites it at build time. The live file is the one that matters.
- Guide cover alt text and title length.
- City H1s say “Clinics” even when the title says “1 Aesthetic Clinic”.
