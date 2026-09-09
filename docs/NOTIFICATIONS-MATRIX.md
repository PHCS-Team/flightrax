# Notifications — Recipient Matrix

The specification for who receives which notification, and how each message is worded.
Derived from the 44 server actions in `modules/*/actions/` plus the `pg_cron` jobs in
`supabase/migrations/`.

Status: **agreed and complete, 2026-09-09**. No open questions.

---

## 1. Rules that apply to every notification

### Rule A — never notify the actor

**A user is never notified about something they did themselves.** If you cancel your own
flight request, you do not get "you cancelled your flight request". If you are the
instructor who cancelled a student's flight, you do not get told you did it.

This is enforced **once**, in the insert helper: the recipient set always has `actor_id`
removed before rows are written. It is not re-implemented per event type.

A useful consequence: because the actor never receives a row, messages can freely name the
actor in the second person without ever producing "Cancelled by John Doe" for John Doe.
Rule A makes the wording problem disappear by construction.

### Rule B — messages are composed per recipient, at insert time

Each `notifications` row stores its own finished `title` and `body`. They are composed in
the database trigger, which has full join access — this is how the aircraft registration
mark reaches the message even though `terminate-flight.ts` and `cancel-flight.ts` never
select it.

`actor_id` is **nullable**. When it is null the event came from a cron and the message uses
the system/passive voice:

| Origin | Wording |
| --- | --- |
| A person acted (`actor_id` set) | "Capt. Reyes cancelled your flight RP-C1234." |
| A cron acted (`actor_id` null) | "Your flight RP-C1234 was automatically cancelled (no-show)." |

### Rule B1 — a flight message must identify *which* flight

"Your flight was cancelled" is not acceptable: a user can hold several requests on the same
day and would not know which one is meant. Every flight message identifies the flight by
**plan code + registration mark + departure time**:

> "Capt. Reyes cancelled your flight **FP-3K9Q2** (**RP-C1234**, 0800Z)."

`flight_plans.plan_code` is unique (`flight_plans_plan_code_key`) and is already the
identifier shown on the request cards, so it is the discriminator a user can match against
the UI. The registration mark and departure time make the flight recognisable without
having to look the code up.

Times follow the project convention: `departure_time_raw` is zulu and is always suffixed
`Z`; the DOF day is the local Manila date (see `flight-plan-time.ts`).

### Rule C — per-flight events never broadcast

A notification about one flight goes **only to the people on that flight** — its trainee,
pilot in command, and assigned instructor (`PARTICIPANTS`). It is never sent to a role or
to everyone.

Nobody wants to hear that a colleague they have never met commenced a flight. At ~50
status changes in ten minutes across the fleet, a broadcast feed would be pure noise and
users would mute it — which would also cost us the notifications that do matter. Anyone who
wants fleet-wide awareness has the TV monitor (`/monitor`), which is exactly what it is
for.

Rule C governs `flight_commenced`, `flight_arrived`, `flight_cancelled`, `flight_no_show`
and `aircraft_status_changed`.

---

### Rule D — one row per person per event

The recipient list is a **set**. It is resolved as a union of the event's audience tokens,
deduplicated by `user_id`, and only then has the actor removed (Rule A). A person who
qualifies through more than one token still receives exactly one notification.

This matters most for `PARTICIPANTS`, whose three roles legitimately collapse:

| Case | Trainee | PIC | Instructor | Rows |
| --- | --- | --- | --- | --- |
| Student flight, instructor supervising | A | B (instructor) | B | 2 |
| PPL student as PIC | A | A | B | 2 |
| Instructor files and flies their own flight | A | A | A | **1** |
| Fully distinct | A | B | C | 3 |

`PARTICIPANTS` is the only place overlap actually occurs today. Every other event's
audiences are disjoint by construction: admins cannot file flight plans (`ROLE.ADMIN` has
no `FLIGHT_DOCUMENTS_VIEW`; `air_traffic_controller` adds only `FLIGHT_PLANS_VIEW`, the
audit view), so the requester of a flight request is never also in `DEPT:atc`.

Dedup still lives in the shared helper rather than in the `PARTICIPANTS` resolver, so the
guarantee survives any later change to who belongs to which audience.

Implementation: resolve each audience token as a query and combine them with SQL `UNION`
(which deduplicates; `UNION ALL` does not), then exclude the actor. Because dedup lives in
the one shared helper, no event type can reintroduce a double-send.

---

## 2. Audience vocabulary

| Token | Resolves to |
| --- | --- |
| `EVERYONE` | All approved users |
| `ROLE:student` / `ROLE:instructor` | All approved users of that role |
| `DEPT:flight_ops` | Admins in `flight_operations_personnel` |
| `DEPT:atc` | Admins in `air_traffic_controller` |
| `DEPT:safety` | Admins in `safety_personnel` |
| `EVERYONE except DEPT:x` | All approved users bar one admin department (`notification_audience_everyone_except_department`) |
| `USER:<id>` | One specific person |
| `PARTICIPANTS` | Trainee + pilot-in-command + assigned instructor on a flight |

Every audience is deduplicated (Rule D) and filtered by Rule A before rows are inserted.

---

## 3. Phase 1 events

### Account lifecycle

| Event | Source | Audience | Message |
| --- | --- | --- | --- |
| `account_submitted` | first `submitted_at` stamp | `DEPT:flight_ops` | "\<Name\> registered as a \<role\>" |
| `account_resubmitted` | `rejected → pending` | `DEPT:flight_ops` | "\<Name\> resubmitted their account" |

`submitAccountRequest` stamps `submitted_at`; the row itself is created earlier by
`handle_new_user` at auth signup, before any ID number or document exists, so INSERT is the
wrong moment to tell a reviewer there is something to review.

**Not in-app — deferred to push (see §5):** `account_approved` and `account_rejected`.
Their recipient cannot reach the in-app feed: while `approval_status` is not `approved`,
`canAccessPath` confines them to `/pending-approval`, so there is no dashboard and no bell.
The row would sit unread until approval and then show a stale rejection beside the
approval.

**Dropped entirely:** `admin_registered`. Admin accounts are never reviewed —
`handle_new_user` creates `admin_profiles` directly at signup — so there is no decision to
announce.

### Flight requests

| Event | Source | Audience | Message |
| --- | --- | --- | --- |
| `flight_request_submitted` | `submitFlightRequestAction` | assigned instructor **and** pilot in command | "\<Student\> submitted a flight request" · body names the recipient's role |
| `flight_request_approved` | `approveFlightRequestAction` | `USER:` requester **+** the other reviewer **+** `DEPT:atc` | Requester: "\<Instructor\> approved your flight request for \<aircraft\>." · ATC: "Flight plan \<code\> for \<aircraft\> was approved." |
| `flight_request_rejected` | `rejectFlightRequestAction` | `USER:` requester **+** the other reviewer | "\<Instructor\> rejected your flight request — \<reason\>." |
| `flight_request_withdrawn` | `cancelFlightRequestAction` | assigned instructor **and** pilot in command | "\<Student\> withdrew their flight request" · body names the recipient's role |

**Never fan out to all instructors.** An instructor who is not assigned to a request must
not be notified about it — that noise was explicitly rejected.

**An outcome closes the loop for the other reviewer.** Approval and rejection reach the
requester *and* whichever reviewer did not act, because either the PIC or the instructor may
review — otherwise the other one keeps a "waiting for your review" notification that never
resolves. It matters most for self-approval, a first-class flow (`SelfApproveAction`): the
requester is the actor, Rule A drops them, and before this the event produced **no
notifications at all** while the other reviewer still believed the request was pending.

The requester is removed from the reviewer group, so a requester who is also a reviewer gets
one row ("your flight request"), never two.

**Both reviewers are notified, and each is told which role they hold.**
`canActOnFlightRequest` lets either the assigned flight instructor *or* the pilot in
command approve or reject, and the review queue's "assigned" scope filters on
`pilot_in_command_id` OR `instructor_profile_id` — so notifying only the instructor left
requests sitting silently in the PIC's queue. The body reads "You are the pilot in command
for flight …" / "the flight instructor for …", and when one person holds both it collapses
to a single row reading "the pilot in command and flight instructor" (Rule D).
`pilot_in_command_id` is nullable and is simply skipped when absent.

`cancelFlightRequestAction` is requester-only (verified: it rejects when
`flightPlan.created_by !== actor.id`) and returns the request to `draft` rather than
deleting it. The instructor is notified so the request vanishing from their review queue is
explained.

### Flight lifecycle

| Event | Source | Audience | Message |
| --- | --- | --- | --- |
| `flight_commenced` | `commenceFlightAction` | `PARTICIPANTS` | "\<Aircraft\> has departed — flight \<code\>." |
| `flight_arrived` | `terminateFlightAction` | `PARTICIPANTS` | "\<Aircraft\> has arrived — flight \<code\>." |
| `flight_cancelled` | `cancelFlightAction` | `PARTICIPANTS` | "\<Actor\> cancelled your flight \<code\> (\<aircraft\>, \<time\>Z)." |
| `flight_no_show` | `cancel-no-show-flights` cron | `PARTICIPANTS` | "Your flight \<code\> (\<aircraft\>, \<time\>Z) was automatically cancelled (no-show)." |

`cancelFlightAction` permits instructors and superadmins to cancel another user's flight
(`canManageAll`), so the actor genuinely varies — Rule A and Rule B both matter here.

The `standby-arrived-flights` cron is internal state cleanup and produces no notification.

### Operational broadcasts

| Event | Source | Audience | Message |
| --- | --- | --- | --- |
| `notam_posted` | `createNotamAction` | `EVERYONE` **except** `DEPT:flight_ops` | "\<Severity\> NOTAM: \<title\>" → `/dashboard` |
| `aircraft_status_changed` | `updateAircraftStatusAction` | `PARTICIPANTS` of live journeys on that aircraft (§7) | "\<Aircraft\> is now \<status\> — your flight \<code\> may be affected." |
| `instructor_unavailable` | `addInstructorUnavailabilityAction` | `ROLE:student` | "\<Instructor\> is unavailable on \<date\>." → `/instructors` |

Flight operations admins are excluded from NOTAMs: they hold no `NOTAMS_VIEW`, and
`getDashboardHomeSurface` routes their `/dashboard` to the `"aircrafts"` surface, which does
not render `NotamsSection`. They have nowhere to read one. Their remit is aircraft and user
management. Every other role lands on `flight-board` or `organized-board`, both of which
show NOTAMs.

Instructor unavailability goes to **all students**, deliberately — resolving which specific
students have flights with that instructor was rejected as over-complication.

`deleteNotamAction` and `removeInstructorUnavailabilityAction` produce no notification.

---

## 4. Explicitly excluded

No notification is emitted for any of these.

| Action(s) | Reason |
| --- | --- |
| `changePasswordAction`, `savePasscodeAction` | Self-action — you changed it, you know |
| `registerSuperadminAction` | Not needed |
| `loginAction`, `logoutAction` | Noise |
| `uploadProfilePhotoAction`, `removeProfilePhotoAction`, `saveSignatureAction` | Self-action |
| `createLicenseAction`, `updateLicenseAction`, `deleteLicenseAction` | Self-action (expiry warnings are separate — §5) |
| `createCertificateAction`, `updateCertificateAction`, `deleteCertificateAction` | Self-action (§5) |
| `createFlightPlanAction`, `updateFlightPlanAction`, `deleteFlightPlanAction` | Private drafts |
| `saveWeightBalanceAction` | Part of the private draft flow |
| `createAircraftTypeAction`, `deleteAircraftTypeAction`, `setAircraftTypeWbSpecsAction`, `setAircraftWeightBalanceAction` | Configuration housekeeping |
| `createAircraftAction`, `updateAircraftAction`, `deleteAircraftAction` | Housekeeping — revisit if flight ops want an audit feed |
| `standby-arrived-flights` cron | Internal state cleanup |

---

## 5. Deferred to a later phase

| Event | Blocked on |
| --- | --- |
| Schedule uploaded / changed | **`modules/schedule/` is empty scaffolding** — only `schedule-page.tsx` and `constants/permissions.ts` exist, there are zero schedule actions. Nothing to hook into yet. |
| License expiry warning | Needs a new `pg_cron` job; no expiry-check job exists today |
| Certificate expiry warning | Same |
| `account_approved` push → `/dashboard` | Phase 3 (push). Useless in-app because the recipient cannot reach the feed before approval; a push reaches a signed-out device. |
| `account_rejected` push → `/pending-approval` | Phase 3 (push). Same reason. The type strings remain in the `notifications` check constraint so no schema change is needed then. |

---

## 6. Prerequisites before Phase 1

Two changes to existing code that the matrix depends on.

### 6.1 Make `flight_requests.instructor_profile_id` NOT NULL

The matrix routes `flight_request_submitted` and `flight_request_withdrawn` to the assigned
instructor and to nobody else, so the column cannot be null.

**The application layer already enforces this:**

- `modules/flight-documents/schemas/flight-plan-schema.ts:133` —
  `instructorId: z.string().trim().uuid("Choose a flight instructor.")`, not optional
- `modules/flight-documents/actions/create-flight-plan.ts:122` and
  `update-flight-plan.ts:79` — both reject when the id is not an instructor profile

The column was left nullable only so the original migration could backfill rows that
already existed; its own comment says *"Nullable at the database level for existing rows;
the app requires it on every create and update."*

**Done** — `supabase/migrations/20260909000000_flight_request_instructor_required.sql`
backfills any residual nulls from `pilot_in_command_id` and then applies `set not null`.
Written as a new timestamped file; `20260904100000_flight_request_instructor.sql` is
already applied and was not edited.

### 6.3 Make `flight_plans.pilot_in_command_id` NOT NULL

Same shape as 6.1. `flight-plan-schema.ts:131` declares `pilotInCommandId` as a
non-optional uuid and both create and update actions write and validate it; only the
database column was left nullable in `20260817030000`.

It matters because the PIC is a reviewer — `canActOnFlightRequest` lets either them or the
assigned instructor approve — so `flight_request_submitted` and `flight_request_withdrawn`
are addressed to both. A null PIC would be a request nobody is told about.

**Done** — `supabase/migrations/20260910060000_flight_plan_pic_required.sql`. No backfill:
unlike `instructor_profile_id`, which could be derived from the PIC, no other column
reliably identifies the pilot in command.

### 6.2 Registration mark in the flight lifecycle actions

`terminate-flight.ts` and `cancel-flight.ts` select only
`id, status, flight_requests!inner(requested_by)` — no aircraft registration.
`commence-flight.ts` does select `aircraft_identification`.

**This does not block notifications.** Under Rule B the message is composed in the database
trigger, which joins to `flight_plans` itself and gets the registration mark regardless of
what the action selected. Adding it to the action selects would only improve those actions'
own toast copy ("Flight RP-C1234 cancelled" instead of "Flight cancelled"). Optional, and
independent of the notifications work.

---

## 7. Implementation status

| Slice | Contents | State |
| --- | --- | --- |
| 1 | `instructor_profile_id` NOT NULL; `notifications` table, RLS, realtime, `create_notifications()` | **Delivered** — `20260909000000_*`, `20260909010000_*` |
| 2 | Read path, bell badge, panel, `/notifications` page, mark-read | **Delivered** — `modules/notifications/` |
| 3 | Triggers emitting the 16 events | **Delivered** — `20260910000000_*` … `20260910030000_*` |

**Actor propagation.** Triggers cannot use `auth.uid()`: every write in this app goes
through the service-role admin client, so it is null. The actor is instead read from the
row that changed — `approved_by`, `rejected_by`, `commenced_by`, `terminated_by`,
`cancelled_by`, `created_by`, or the subject's own `profile_id` for registrations. Two
consequences worth remembering:

- `flight_requests` had no `rejected_by` (the reject action nulls `approved_by` and stored
  only the reason), so `20260910000000_flight_request_rejected_by.sql` adds it and
  `reject-flight-request.ts` now records it.
- The no-show cron sets `cancelled_at` but never `cancelled_by`. That null is exactly what
  distinguishes `flight_no_show` from `flight_cancelled`, and it gives the passive voice
  Rule B requires — no extra flag needed.

`aircrafts` records no actor for a status change, which is harmless: its audience is flight
participants and the actor is an admin, so Rule A never needs to exclude them.

**Flight request resubmission.** A rejected request is editable
(`EDITABLE_FLIGHT_REQUEST_STATUSES`), so it goes `rejected → pending_approval` directly
rather than back through `draft`. Two consequences:

- `rejected_by` must be cleared on resubmit *and* on approve, alongside the
  `rejected_reason` reset those actions already did. Otherwise a pending or approved
  request still names the reviewer who once rejected it.
- The instructor is told it is a *re*submission (`old.status = 'rejected'`), since they may
  have rejected this very request. Same `flight_request_submitted` type — the type drives
  the icon and grouping, the title carries the nuance — so the check constraint is
  untouched.

---

## 8. Resolved — `aircraft_status_changed` audience

**Participants only.** When an aircraft changes status, the notification goes to the
trainee and assigned instructor of the flight(s) scheduled on that aircraft — not to all
students and instructors.

This is Rule C applied. Grounding an aircraft does not cancel a flight already scheduled on
it, so the people whose flight is now in doubt are exactly the ones who need telling;
everyone else can read fleet status off the TV monitor.

Resolution: fleet aircraft → live journeys on that aircraft (`scheduled` / `active`) →
their participants. Aircraft with no live journey produce no notification at all.

The matrix has **no open questions remaining.**
