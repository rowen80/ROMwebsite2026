# ROM Website 2026 — Task 9: Backend Changes to Replace Zapier with n8n

## Owner
**Leo task list item**

Bardo is coordinating and documenting the work, but this task is written as the implementation brief for **Leo**, the photography/studio specialist. This matches the architecture decision that Bardo is the orchestrator and Leo is the studio/web build specialist.

Execution preference:
- For large implementation tasks, Leo should use **Claude Code**.

## Purpose
Convert the rebuilt backend in `ROMwebsite2026` from a Zapier-based intake handoff to an n8n-based intake handoff.

This task is specifically about the code path used when the rebuilt request form submits a job.

## Repo / root
Canonical project root:
`/Users/ai/lab/projects/rom/website-lab/romwebsite2026`

Canonical GitHub repo:
`https://github.com/rowen80/ROMwebsite2026`

Do not treat `GithubRequestFormWORK` as the active project root anymore. That is now legacy/archive naming.

## Scope
This task covers:
- backend intake handoff for `/jobs`
- n8n webhook config
- normalized payload creation
- response/error handling
- `.env.example` update for the new architecture

This task does **not** cover:
- changing the live ROM spreadsheet
- changing the live production website
- frontend redesign
- password reset migration unless explicitly pulled into a later task
- invoice-generation redesign
- full authentication redesign

## Current code state (observed)
Primary backend file:
- `api.py`

Current booking handoff env vars in `.env.example` and `api.py`:
- `ZAPIER_WEBHOOK_URL`
- `RESET_ZAPIER_WEBHOOK_URL`

Current helper functions in `api.py`:
- `send_booking_email_via_zapier(payload: dict)`
- `send_password_reset_email_via_zapier(email: str, temp_password: str)`

Current booking route:
- `POST /jobs`

Current `/jobs` behavior:
1. validates incoming request via `JobCreate`
2. builds estimate via `build_estimate(job_in)`
3. creates/gets customer
4. creates local `Job` DB row
5. builds a flat Zapier payload inline
6. POSTs that payload to Zapier
7. commits DB transaction
8. returns `JobResponse`

## Desired architecture after Task 9
New booking flow:

Client form
-> backend `/jobs`
-> validate
-> build estimate from `pricing.json`
-> normalize payload
-> POST to n8n intake webhook
-> n8n handles:
   - client confirmation email
   - internal notification email
   - Google Sheets append to `ROM_DATA_2026`

## Required code changes

### 1. Update env/config naming for intake handoff
Replace booking-intake use of Zapier-specific env vars with n8n-specific ones.

Recommended additions:
- `N8N_INTAKE_WEBHOOK_URL`
- `N8N_INTAKE_SECRET`

Temporary note:
- `RESET_ZAPIER_WEBHOOK_URL` may remain for now if password-reset flow is not yet migrated.

### 2. Add a dedicated n8n booking helper
Create a helper function in `api.py` conceptually like:
- `send_booking_to_n8n(payload: dict)`

Expected behavior:
- read `N8N_INTAKE_WEBHOOK_URL`
- include secret header, e.g. `x-rom-intake-key`
- POST JSON payload
- use timeout
- raise or return structured failure on non-2xx
- ideally parse any returned JSON response

### 3. Add a normalized payload builder
Create a helper function in `api.py` conceptually like:
- `build_n8n_booking_payload(job_in, customer, job, estimate)`

The payload should be structured, not flat.

Recommended top-level sections:
- `meta`
- `customer`
- `listing`
- `timing`
- `access`
- `services`
- `estimate`
- `flags`

### 4. Update `/jobs` to use the new n8n path
Replace the inline Zapier payload construction and `send_booking_email_via_zapier(...)` call.

New `/jobs` flow should be:
1. build estimate
2. create `raw_form`
3. get/create customer
4. create local `Job` row
5. build normalized n8n payload
6. send payload to n8n
7. if n8n handoff succeeds, commit
8. return `JobResponse`
9. if n8n handoff fails, rollback and return error

### 5. Preserve pricing behavior exactly where appropriate
Keep current local pricing behavior in backend:
- `build_estimate(job_in)`
- `pricing.json`
- line-item generation
- estimated total generation

Also preserve the human-readable semicolon-separated line-item text pattern.

Expected format example:
`Drone Photos: $59.00; Twilight Photos: $199.00; Video: $299.00; Community Photos: $49.00;`

### 6. Do not migrate password reset in this task unless asked
Leave `send_password_reset_email_via_zapier(...)` alone for now unless this task is explicitly expanded.

That keeps scope focused on website intake.

## Exact files Leo should inspect/edit

### Primary edits
- `api.py`
- `.env.example`

### Secondary review
- any deploy/runtime config that injects env vars for the backend
- docs that still mention booking Zapier flow

## Proposed env example after Task 9
Recommended `.env.example` direction:

```env
N8N_INTAKE_WEBHOOK_URL=
N8N_INTAKE_SECRET=
RESET_ZAPIER_WEBHOOK_URL=
SECRET_KEY=
FRONTEND_BASE_URL=
PRICING_FILE=pricing.json
```

If password reset is migrated later, the reset webhook naming can also be cleaned up then.

## Suggested normalized payload shape
Recommended payload structure:

```json
{
  "meta": {
    "source": "romwebsite2026",
    "requestId": "generated-id",
    "submittedAt": "ISO timestamp",
    "jobId": 123,
    "customerId": 456
  },
  "customer": {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "agency": "...",
    "isFirstTime": true
  },
  "listing": {
    "address": "...",
    "city": "...",
    "buildingName": "...",
    "bedrooms": "...",
    "bathrooms": "...",
    "listingSize": "...",
    "estimatedPriceBand": "...",
    "usage": "..."
  },
  "timing": {
    "dateListingReady": "...",
    "dateToGoLive": "...",
    "desiredDate": "...",
    "isVacant": "...",
    "duringShootAgreement": true
  },
  "access": {
    "accessType": "...",
    "accessCode": "...",
    "ownerContactInfo": "..."
  },
  "services": {
    "selected": ["..."],
    "views": ["..."],
    "finishedBasement": "...",
    "notesForPhotographer": "..."
  },
  "estimate": {
    "currency": "USD",
    "subtotal": 0,
    "estimatedTotal": 0,
    "lineItems": [],
    "lineItemsText": "...",
    "meta": {}
  },
  "flags": {
    "termsAccepted": true
  }
}
```

## Success criteria
Task 9 is complete when:
- `/jobs` no longer uses `ZAPIER_WEBHOOK_URL` for booking intake
- backend sends normalized payload to n8n
- backend still computes estimate locally from `pricing.json`
- backend returns failure honestly when n8n handoff fails
- `.env.example` reflects n8n intake config
- no live spreadsheet is touched

## Cautions / safety notes
- Do not point anything at the live ROM spreadsheet.
- Do not reconnect this rebuild path to Zapier for booking intake.
- Do not change Google Sheets schema in this task.
- Keep this task isolated to backend handoff logic.
- Preserve rollback ability.

## Recommended next task after Task 9
After Task 9 is implemented, the next likely practical task is:
- verify/create the exact n8n webhook config and test payload acceptance

Or, if needed first:
- add the approved right-side columns to `ROM_DATA_2026`

## Coordinator note
Bardo should continue to:
- track the task list
- check the architecture against the user's rules
- make sure Leo does not cross the boundary into risky live-sheet/live-site changes without explicit permission
