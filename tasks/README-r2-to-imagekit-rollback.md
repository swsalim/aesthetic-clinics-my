# R2 → ImageKit reverse migration (aesthetic-clinics-my)

Runnable checklist for this repo. Full plan: [`.cursor/plans/r2_to_imagekit_rollback.plan.md`](../.cursor/plans/r2_to_imagekit_rollback.plan.md)

Reference implementation (completed): `../dental-clinic-close-to-me-my`

## Mapping

| | This repo |
|--|--|
| Folder root | `aesthetic-clinics-my` |
| Places / persons / location | `{root}/places` · `{root}/persons` · `{root}/location` |
| R2 CDN | `https://media.aestheticclinics.my` |
| Copy scripts from | `dental-clinic-close-to-me-my/tasks/backfill-imagekit-from-r2.ts`, `delete-r2-assets.ts` |

## Order

1. New ImageKit keys in `.env.local` + spot-check static URL
2. Copy/adapt backfill script → `npm run backfill-imagekit:sample` → `--execute --concurrency=10`
3. Restore `/api/upload-imagekit` + `/api/delete-imagekit` (missing here) + flip forms/serving
4. Replace hardcoded `yuurrific` static URLs via `imageKitUrl()`
5. Smoke-test (Network → `ik.imagekit.io/<new-id>`)
6. `npm run delete-r2-assets` → `--execute`

## npm scripts to add

```bash
"backfill-imagekit": "tsx ./tasks/backfill-imagekit-from-r2.ts"
"backfill-imagekit:sample": "tsx ./tasks/backfill-imagekit-from-r2.ts --sample"
"delete-r2-assets": "tsx ./tasks/delete-r2-assets.ts"
```
