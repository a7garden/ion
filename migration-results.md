# Migration Results — 2026-06-13

**Project:** `lvetasjrpxhcjqbfoefl`

---

## Migration 1: `planet_replace_avatar` ✅ Success

- **Dropped:** `avatar_url` column from `profiles`
- **Added:** `planet` column (`text NOT NULL DEFAULT 'moon'`)
- **Constraint:** `profiles_planet_check` — valid values: `moon`, `earth`, `mars`, `crystal`, `saturn`, `jupiter`, `venus`, `neptune`, `uranus`, `pluto`

---

## Migration 2: `add_reports_blocks_resonances` ✅ Success

### Tables created:
| Table | Purpose | RLS |
|-------|---------|-----|
| `reports` | Post reports (spam, harmful, inappropriate, other) | ✅ Enabled |
| `blocks` | User blocks (composite PK: blocker_id, blocked_id) | ✅ Enabled |
| `resonances` | Mutual like detection (user_a, user_b + post refs) | ✅ Enabled |

### RLS Policies:
| Table | Policy | Type |
|-------|--------|------|
| `reports` | `reports: insert own` | INSERT — `auth.uid() = reporter_id` |
| `reports` | `reports: read own` | SELECT — `auth.uid() = reporter_id` |
| `blocks` | `blocks: manage own` | ALL — `auth.uid() = blocker_id` |
| `resonances` | `resonances: read own` | SELECT — `auth.uid() IN (user_a, user_b)` |
| `resonances` | `resonances: update own` | UPDATE — `auth.uid() IN (user_a, user_b)` |

### Index:
- `idx_resonances_unseen` on `(user_a, user_b, seen) WHERE seen = false`

---

Both migrations applied without errors.
