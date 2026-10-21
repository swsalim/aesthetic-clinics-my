---
type: Concept
title: How the directory is organised
description: Clinic, doctor and location pages on aestheticclinics.my and what each one shows.
resource: https://www.aestheticclinics.my/browse
tags: [directory, structure]
timestamp: 2026-10-21T02:00:00Z
---

# How the directory is organised

- **Clinic pages** at `/place/{slug}`: one page per listed aesthetic clinic, with address, contact details, treatments, opening hours and reviews where available.
- **Doctor pages** at `/doctor/{slug}`: individual aesthetic doctors. The sitemap lists 35 (21 October 2026).
- **State and city pages** at `/{state}` and `/{state}/{area}`, plus doctor lists at `/{state}/doctors`. See [locations](locations.md).
- **Guides** at `/guides`: articles on comparing clinics and understanding treatments.

The site does not assess clinical quality; ratings shown are public reviews. Every listing page also has a Markdown version for AI agents: append `.md` to the URL (homepage: `/index.md`). An index is at `/llms.txt`.

Related: [overview](../index.md), [clinic listings](clinic-listings.md).
