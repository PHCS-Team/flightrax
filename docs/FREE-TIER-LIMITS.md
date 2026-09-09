# Free Tier Limits & Recovery Guide

Operating constraints for FlightraX on the free tiers of **Supabase** (database, auth,
storage, realtime) and **Vercel** (hosting). Written so that any limit we design around
is written down before we hit it, and so a paused or lost project can be brought back.

> **Figures verified 2026-09-09** against `supabase.com/pricing`, `vercel.com/docs/limits`
> and `vercel.com/docs/plans/hobby`. Providers change quotas without notice — re-check
> these pages before quoting the numbers in a formal document.

---

## 1. Supabase Free Plan — quotas

| Resource | Free plan allowance | Notes for FlightraX |
| --- | --- | --- |
| Database size | **500 MB** | Shared CPU, 500 MB RAM |
| File storage | **1 GB** | Profile photos, license/certificate images |
| Egress (network out) | **5 GB / month** | Plus 5 GB cached egress |
| Monthly active users | **50,000** | Never a constraint for a flight school |
| API requests | **Unlimited** | |
| Edge Function invocations | **500,000 / month** | Relevant once push notifications ship |
| **Realtime concurrent peak connections** | **200** | **The binding limit — see §2** |
| Realtime messages | **2,000,000 / month** | Comfortable — see §3 |
| Active projects | **2** | Matters when restoring a paused project |
| Automatic backups | **Not included** | **See §6 — this is the biggest risk** |
| Log retention (API & database) | **1 hour** | Debug production issues immediately or lose the trace |
| Inactivity pause | **Paused after 1 week** | See §5 |

Point-in-Time Recovery, branching and custom SMTP branding are **not** available on Free.

---

## 2. What "200 concurrent connections" actually means

This is the question that decides whether the architecture scales, so it is worth being
exact.

**It counts websockets held open at one instant — not registered users, not daily users.**

- A user who is **logged in but has the app closed** consumes **zero** connections.
- A user with the app open holds **one** connection for as long as the tab lives.
- The browser Supabase client (`shared/lib/supabase/client.ts`) is a **singleton**, so one
  tab holds **one websocket regardless of how many channels it subscribes to**. The
  dashboard already multiplexes `flight_journeys`, `aircrafts` and `notams` over that
  single socket. Adding a notifications channel adds a **channel**, not a connection.
- **Two tabs = two connections.** A user with the dashboard and a flight plan open in
  separate tabs counts twice.
- The public monitor (`/monitor`) does **not** use realtime — it polls `/api/monitor` every
  10 s, so lobby TVs cost zero realtime connections.

**Practical ceiling: ~200 simultaneously open app sessions.** For a flight school this is
generous; the realistic worst case is a morning briefing where every student and
instructor opens the app at once. If that population approaches ~150, plan the upgrade
before it becomes an incident, because connections beyond the cap are **refused** — the
app still works (`use-supabase-table-changes` falls back to 15-second polling), but live
updates stop for the users who could not connect.

---

## 3. Realtime message budget

A "message" is **one event delivered to one subscriber**. Fan-out multiplies: one row
change seen by 30 subscribers is 30 messages.

Rule 19 in `AGENTS.md` exists to protect this budget. The two techniques that matter:

- **Per-user filters.** Subscribing with `filter: "user_id=eq.<uid>"` means a notification
  row insert is delivered to exactly **one** client — 1 message instead of a fan-out that
  every other client receives and discards.
- **One subscription per table per page.** Two components needing the same table share one
  hook mount, or the message count doubles.

**Worked estimate for the notifications feature:**

```
500 notification rows/day (generous for a school)
  x 1 delivery each (per-user filter)
  = 500 messages/day
  = ~15,000 messages/month
  = 0.75% of the 2M quota
```

Even a careless implementation without per-user filters (500 events x 50 connected
clients = 750,000/month) stays inside the quota. **Messages are not the risk;
connections are.**

Broad, unfiltered subscriptions on chatty machine-written tables are the pattern that
would break this. Check the Supabase dashboard → Realtime after launching any new
realtime surface and confirm the counts match the estimate.

---

## 4. Vercel Hobby Plan — quotas

| Resource | Hobby allowance |
| --- | --- |
| Function invocations | **1,000,000 / month** |
| Edge requests | Up to **1,000,000** |
| Fast Data Transfer | **100 GB** |
| Fast Origin Transfer | Up to **10 GB** |
| Active CPU | **4 CPU-hrs** |
| Provisioned Memory | **360 GB-hrs** |
| Function max duration | 300 s (default 10 s, configurable to 60 s) |
| Deployments per day | **100** |
| Builds per hour | **100** |
| Build time per deployment | 45 min |
| Concurrent builds | **1** |
| Cron jobs per project | 100 |
| Image transformations | First **5,000** |
| Runtime log retention | **1 hour** |
| Git organization repos | **Not supported on Hobby** |

**Two Hobby restrictions that affect this project specifically:**

1. **Non-commercial use only.** Vercel's fair-use guidelines restrict Hobby to
   "non-commercial, personal use only."

   **This is fine for FlightraX today.** It is a research/capstone project, not a system
   in commercial service, which is exactly why every tier here is deliberately free.
   Hobby's restriction is not currently being breached.

   It becomes a live question only if the client adopts FlightraX for real flight
   operations — and that is their decision to make, not the project's. If that happens,
   the hosting tier has to move with it: **Vercel Pro ($20/month)**, since an account
   suspension mid-semester would be far more disruptive than the fee. Record it as a
   hand-over condition rather than a task.
2. **Hobby cannot connect to Git-organization repositories.** This repo lives under the
   `PHCS-Team` organization, so deploying it from that org requires a Vercel **Team**
   (Pro). Verify how the current deployment is wired before assuming Hobby is viable.

Exceeding a Hobby usage limit generally pauses the feature **until the 30-day window
resets** — there is no pay-as-you-go overflow.

---

## 5. The 7-day inactivity pause

### What happens

Supabase pauses Free-plan projects that show minimal activity over a 7-day period. This
is a real risk for FlightraX during **semester breaks**, when nobody opens the app.

When a project is paused:

- The API, database, auth and storage all go **offline**. The app returns errors.
- **Your data is retained.** Pausing is not deletion.
- The project keeps its **project ref, URL and API keys**, so nothing in `.env` or Vercel
  environment variables needs to change after restoring.

### Preventing it

Any genuine API or database traffic resets the inactivity clock. Options, best first:

1. **A scheduled external ping** — **implemented**:
   `.github/workflows/keep-supabase-awake.yml` calls `/api/monitor` every Monday and
   Thursday, so the longest gap is ~4 days against the 7-day threshold. That endpoint is
   public, `force-dynamic`, and runs the `get_flight_monitor_board` RPC, so each ping is a
   genuine database read rather than a static page hit; the workflow asserts `generatedAt`
   is present to prove it.

   It needs the repository variable **`APP_URL`** (Settings → Secrets and variables →
   Actions → Variables), e.g. `https://flightrax.vercel.app`, with no trailing slash. The
   workflow fails loudly if it is missing, and can be run by hand from the Actions tab.

   ⚠️ GitHub disables scheduled workflows in a repository with no commits for 60 days —
   over a long break, confirm this workflow is still enabled.
2. **Upgrade to Supabase Pro ($25/month)** — Pro projects are never paused for inactivity.

> **Do not rely on the existing `pg_cron` jobs** (`standby_arrived_flights_cron`,
> `no_show_scheduled_cron`) to keep the project awake. They run *inside* the database and
> it is not documented that internal cron activity counts toward the inactivity check.
> Treat an external HTTP ping as the only trustworthy keep-alive.

### Restoring a paused project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the paused project — it is labelled **Paused** in the project list.
3. Click **Restore project** and confirm.
4. Wait. Restore typically takes a few minutes; a larger database can take longer. The
   project shows **Restoring** until it is done.
5. Confirm the project ref still matches `supabase/.temp/project-ref`, then verify the app:
   sign in, load `/dashboard`, and open `/monitor`.
6. If realtime does not reconnect immediately, hard-refresh the client — the socket
   reattaches with a fresh token on reload.

**Caveats**

- The Free plan allows only **2 active projects**. If both slots are occupied you must
  pause or delete another project before restoring this one.
- Restore is a resume of retained data — **no migration re-run and no data re-import is
  needed**, and `supabase db push` should report nothing new to apply.
- Supabase does not publicly guarantee that a paused project's data is retained
  *indefinitely*. **Before any break longer than a few weeks, take your own backup (§6).**
  Never let a paused project be the only copy of the data.

---

## 6. Backups — the free tier does not take them for you

**The Free plan includes no automatic backups and no downloadable backups.** If the
database is dropped, corrupted, or the project is deleted, there is nothing to restore
from unless you made a copy yourself. This is a larger risk than the inactivity pause.

### Taking a manual backup

Run these before every semester break, before any destructive migration, and on a
regular schedule during active use. The Supabase CLI is already a dev dependency and the
project ref lives in `supabase/.temp/project-ref`.

```bash
# Connection string: Supabase dashboard -> Project Settings -> Database -> Connection string
DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

npx supabase db dump --db-url "$DB_URL" -f roles.sql  --role-only
npx supabase db dump --db-url "$DB_URL" -f schema.sql
npx supabase db dump --db-url "$DB_URL" -f data.sql   --use-copy --data-only
```

Keep all three files together — roles, then schema, then data is also the restore order.

**Storage files are not included in a database dump.** Profile photos, license images and
certificate images live in Supabase Storage buckets and must be downloaded separately
(dashboard → Storage, or the Storage API) if they need preserving.

Store backups **outside this repository** — they contain personal data and must never be
committed.

---

## 7. Web Push has no provider quota

Worth stating plainly, because it is a common worry when planning push notifications:

- Delivering a push message costs **nothing** and is **not metered by Supabase**. Messages
  go from our server to Apple's and Google's push services, which are free.
- What *is* metered is whatever sends them. If push is sent from a Supabase Edge Function
  triggered by a database insert, each notification costs **one** of the 500,000 monthly
  Edge Function invocations — roughly 16,000/day of headroom.
- Batch the fan-out. One function invocation that sends to all recipients of an event is
  far cheaper than one invocation per recipient.

---

## 8. When to upgrade

| Signal | Action |
| --- | --- |
| Peak realtime connections regularly above ~150 | Supabase Pro — the 200 cap is close |
| Database approaching 400 MB | Supabase Pro (8 GB) |
| Storage approaching 800 MB | Supabase Pro (100 GB) |
| Monthly egress above ~4 GB | Supabase Pro (250 GB) |
| The client adopts it for real flight operations | **Vercel Pro** — Hobby forbids commercial use. A hand-over condition, not a task for now |
| Deploying from the `PHCS-Team` org | **Vercel Pro** — Hobby cannot use org repos |
| Data loss would be unacceptable | Supabase Pro for automatic daily backups, or maintain a disciplined manual backup routine (§6) |

Indicative cost of removing every limit above: **Supabase Pro $25/month + Vercel Pro
$20/month = $45/month.**

---

## 9. Monitoring checklist

Check monthly, and after launching any new realtime surface:

- **Supabase → Reports → Realtime** — peak concurrent connections and monthly messages
- **Supabase → Settings → Usage** — database size, storage, egress
- **Supabase → Edge Functions** — invocation count (once push ships)
- **Vercel → Usage** — function invocations, data transfer, Active CPU
- Confirm a recent backup exists (§6)
