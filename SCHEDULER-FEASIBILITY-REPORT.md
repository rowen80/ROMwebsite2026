# Scheduler Feasibility Report
**Date:** March 27, 2026  
**Prepared by:** Leo (ROM subagent)  
**Status:** Pre-Implementation Analysis

---

## Executive Summary

The proposed ROM scheduling system is **technically feasible** and can be implemented in phases. The most pragmatic approach is to build it as an **n8n workflow** integrated with the existing stack, allowing for rapid iteration and easy maintenance without introducing a separate application codebase.

**Recommended Timeline:**
- **MVP (Phase 1):** 2-3 weeks - Basic scheduling with manual admin approval
- **Phase 2:** 4-6 weeks - Automated time slot suggestions based on location clustering
- **Phase 3:** 8-12 weeks - Multi-photographer support and advanced optimization

**Key Risk:** Sunset time calculation and travel time estimation accuracy will determine system quality.

---

## Requirements Analysis

### Core Functional Requirements

| Requirement | Complexity | Implementation Approach |
|-------------|------------|-------------------------|
| **Toggle on/off for maintenance** | Low | Simple boolean flag in n8n workflow or Google Sheet config |
| **Admin sets work area or "not working"** | Low | Dropdown in Google Sheet or n8n form |
| **Read listing address from booking** | Low | Already captured in booking form |
| **Review existing schedule** | Medium | Query Google Calendar API |
| **Propose time slots near other listings** | High | Geocoding + clustering algorithm |
| **Calculate shoot time per service** | Medium | Lookup table mapping services to duration |
| **Twilights at sunset time** | Medium | External API (sunrise-sunset.org or similar) |
| **Add to Google Calendar** | Low | Google Calendar API (already used) |
| **Admin records deposit + confirms** | Low | Update Google Sheet row |
| **Multi-photographer (future)** | High | Calendar per photographer, assignment logic |
| **Multi-area (future)** | Medium | Zone-based routing logic |

---

## Architecture Recommendation

### Option A: n8n Workflow (RECOMMENDED ✅)

**Pros:**
- Already in stack (n8n used for current automation)
- Visual workflow builder - easy to iterate
- Built-in Google Calendar, Sheets, and HTTP request nodes
- Can run on same infrastructure as current backend
- No new codebase to maintain
- Admin can visualize and modify logic without code changes

**Cons:**
- Complex geocoding/routing logic may be harder to debug
- State management across workflow runs requires careful design
- May need custom function nodes for advanced calculations

**Architecture:**
```
Booking Submission (via api.py)
  ↓
Trigger n8n webhook
  ↓
n8n Workflow:
  1. Check maintenance mode (Sheet config row)
  2. Check admin work area/availability
  3. Geocode listing address (Google Maps API)
  4. Query Google Calendar for existing bookings
  5. Calculate shoot duration (service lookup)
  6. If twilight: fetch sunset time (sunrise-sunset.org API)
  7. Calculate travel times to nearby listings (Google Distance Matrix)
  8. Propose 2-3 time slot options
  9. Send proposal to admin (email/Slack)
  10. Admin approves → Calendar event created + Sheet updated
```

### Option B: Separate Flask/FastAPI App

**Pros:**
- Full control over scheduling algorithm
- Easier to write complex optimization logic (Python)
- Better for machine learning integration later
- Can use libraries like ORTools, Pandas for route optimization

**Cons:**
- New codebase to deploy and maintain
- More infrastructure (separate Render service or Docker container)
- Slower iteration cycle (code → test → deploy)
- Admin needs developer for changes

**When to use:** If scheduling logic becomes highly complex (e.g., multi-vehicle routing problem with time windows)

### Option C: Google Apps Script Extension

**Pros:**
- Runs directly in Google Sheet environment
- No external hosting needed
- Admin can view/edit code in Sheet

**Cons:**
- Limited to 6-minute execution time per run
- No easy way to call external APIs asynchronously
- Poor debugging tools
- JavaScript (not Python) - harder for data science work later

---

## External APIs Needed

### 1. Geocoding (Address → Lat/Lon)
**Options:**
- Google Maps Geocoding API ($5/1000 requests)
- OpenStreetMap Nominatim (free, rate-limited)
- Mapbox Geocoding ($0.50/1000 requests)

**Recommendation:** Google Maps (already familiar, reliable, generous free tier: 40,000 req/month)

**Usage:** ~2-4 bookings/day × 365 days = ~1,000 requests/year (well under free tier)

### 2. Sunset/Sunrise Times
**Options:**
- sunrise-sunset.org API (free, no key)
- USNO Astronomical Applications API (free, government)
- OpenWeatherMap (free tier: 1,000 req/day)

**Recommendation:** sunrise-sunset.org (simple, reliable, no auth)

**Example request:**
```
GET https://api.sunrise-sunset.org/json?lat=38.3365&lng=-75.0849&date=2026-06-15
Response: { "sunrise": "5:41:12 AM", "sunset": "8:28:31 PM", "solar_noon": "1:04:52 PM" }
```

**Usage:** ~50-100 requests/year (only needed for twilight shoots)

### 3. Travel Time / Distance Matrix
**Options:**
- Google Maps Distance Matrix API ($5/1000 elements)
- OSRM (free, self-hosted OpenStreetMap routing)
- Mapbox Directions API ($0.50/1000 requests)

**Recommendation:** Google Maps (accurate, real-time traffic, batch requests)

**Usage:** ~1,000 distance calculations/year (checking nearby listings) = ~$5/year

### 4. Google Calendar API
**Options:**
- Google Calendar API (free for G Suite accounts)

**Status:** Already in use for current workflow

**Needed calls:**
- `events.list()` - fetch existing bookings
- `events.insert()` - create new booking
- `events.update()` - modify booking if rescheduled

---

## Technical Feasibility Assessment

### ✅ Highly Feasible (Low Risk)
1. **Toggle maintenance mode** - Simple boolean check
2. **Admin work area selection** - Dropdown in Sheet or n8n form
3. **Read booking data** - Already captured in current form
4. **Sunset time lookup** - Reliable free API
5. **Add to Google Calendar** - Already working in current flow
6. **Record deposit/confirmation** - Sheet update (existing pattern)

### 🟡 Moderately Feasible (Medium Risk)
1. **Calculate shoot duration** - Need to build service → duration mapping
2. **Query existing schedule** - Calendar API pagination, filter logic
3. **Geocode addresses** - Reliable but need to handle bad addresses gracefully
4. **Travel time estimation** - Works well for Ocean City area, may struggle with rural/remote

### 🔴 Challenging (High Risk / Future Work)
1. **Propose optimal time slots** - Requires clustering algorithm, constraint solving
2. **Multi-photographer support** - Complex assignment problem, calendar conflicts
3. **Multi-area routing** - Traveling salesman problem, needs optimization library

---

## Data Model

### Service Duration Lookup Table
Add to `pricing.json` or new `scheduler_config.json`:
```json
{
  "service_durations_minutes": {
    "Basic Photos": 60,
    "Catalogue Style Photos": 180,
    "Drone Photos": 20,
    "Twilight Photos": 90,
    "Interior Twilights": 60,
    "Video": 90,
    "Instagram Reels (Vertical Video)": 30,
    "Community Photos": 45,
    "Community Interiors": 30,
    "Zillow 360 Tour": 45,
    "Zillow Floor Plan": 30,
    "Matterport 360": 60
  },
  "buffer_minutes": 15,
  "travel_time_threshold_miles": 10
}
```

**Logic:** Total shoot time = SUM(selected services durations) + buffer

### Calendar Event Schema
```json
{
  "summary": "ROM Shoot: 123 Main St, Ocean City",
  "description": "Client: John Doe\nServices: Basic Photos, Drone Photos\nEstimated duration: 1h 20m\nTotal: $299",
  "location": "123 Main St, Ocean City, MD 21842",
  "start": { "dateTime": "2026-06-15T14:00:00-04:00" },
  "end": { "dateTime": "2026-06-15T15:20:00-04:00" },
  "colorId": "10",
  "extendedProperties": {
    "private": {
      "bookingId": "12345",
      "clientEmail": "john@example.com",
      "depositPaid": "false"
    }
  }
}
```

### Google Sheet Additions
New columns in ROMwebsite2026_data:
- **ScheduleProposal** - JSON array of proposed time slots
- **ScheduledDateTime** - Confirmed shoot time (ISO format)
- **ScheduledDuration** - Confirmed duration (minutes)
- **CalendarEventID** - Google Calendar event ID for updates/cancellations
- **ShootArea** - Admin-assigned area (e.g., "Ocean City", "Salisbury", "Not Working")

---

## Potential Blockers & Challenges

### 1. Address Quality Issues
**Problem:** Booking form addresses may be incomplete, misspelled, or ambiguous
- "123 Main St" without city → multiple matches
- "The Sandpiper Condos" → not a geocodable address

**Mitigation:**
- Validate address at booking time (Google Places Autocomplete widget in form)
- Fallback to city-level geocoding if exact address fails
- Flag uncertain geocodes for admin review

### 2. Twilight Time Windows
**Problem:** Twilight shoots require arriving 30-60 minutes before sunset, creating narrow time windows

**Mitigation:**
- Mark twilight bookings as "high priority" - schedule first
- Block out 2-hour window around sunset
- Allow admin to manually adjust if multiple twilight shoots same day

### 3. Calendar Conflicts
**Problem:** Admin may have personal events, maintenance, or other commitments

**Mitigation:**
- Check "ROM Photographer" calendar AND personal calendar
- Allow admin to mark date ranges as unavailable
- Propose 2-3 alternative time slots, not just one

### 4. Travel Time Accuracy
**Problem:** Google Maps estimates may not account for ferry waits, beach traffic, parking

**Mitigation:**
- Add configurable "travel time multiplier" (e.g., 1.3x for summer months)
- Use historical traffic data (Google Maps API supports departure time)
- Allow admin to override travel time estimates

### 5. Same-Day Bookings
**Problem:** Client books shoot for tomorrow, no time to optimize route

**Mitigation:**
- Prioritize urgent bookings over optimization
- Suggest "earliest available" slot instead of optimal
- Admin can manually reschedule later if needed

---

## What Might Box Us In Later

### 🚨 Critical Design Decisions (Get These Right Now)

1. **Calendar as Source of Truth**
   - ✅ DO: Use Google Calendar event ID as canonical reference
   - ❌ DON'T: Store schedule only in Sheet, risk of conflicts
   - **Why:** Multiple systems (Sheet, Calendar, n8n) need to stay in sync

2. **Photographer Identifier**
   - ✅ DO: Store photographer email/ID with each booking NOW (even if only one photographer)
   - ❌ DON'T: Assume single photographer, retrofit later
   - **Why:** Adding multi-photographer support later requires data migration

3. **Time Zone Handling**
   - ✅ DO: Store all times in ISO 8601 with explicit time zone (America/New_York)
   - ❌ DON'T: Store local time strings ("2:00 PM") without time zone
   - **Why:** Daylight saving time changes, future expansion to other regions

4. **Service Bundles**
   - ✅ DO: Store selected services as array, not comma-separated string
   - ❌ DON'T: Hard-code service names in scheduler logic
   - **Why:** Easy to add/remove services, rename, or bundle without code changes

5. **Geocoding Cache**
   - ✅ DO: Cache geocoded addresses (address → lat/lon) in Sheet
   - ❌ DON'T: Re-geocode same address every time
   - **Why:** Avoid API costs, faster scheduling, offline fallback

### 🟡 Things That May Need Refactoring (But Manageable)

1. **Single Calendar Assumption**
   - Current design: One "ROM Photographer" calendar
   - Future: Multiple calendars per photographer
   - **Migration path:** Add "assigned_photographer_calendar_id" column, backfill existing events

2. **Ocean City Focus**
   - Current design: Travel times optimized for Delmarva region
   - Future: Expand to DC, Baltimore, or other metros
   - **Migration path:** Zone-based routing, per-zone optimization

3. **Manual Proposal Approval**
   - MVP: Admin receives email with time slot proposals, clicks "approve"
   - Future: AI auto-approves if confidence high (e.g., no conflicts, good route)
   - **Migration path:** Add "auto_approve_threshold" config flag

---

## Phased Implementation Plan

### Phase 1: MVP - Manual Scheduling Assistant (2-3 weeks)

**Goal:** Reduce admin scheduling workload by 50%

**Features:**
- ✅ Calculate shoot duration from selected services
- ✅ Fetch sunset time for twilight shoots
- ✅ Propose 2-3 "naive" time slots (next available days)
- ✅ Admin clicks link to approve, creates Calendar event
- ✅ Toggle maintenance mode on/off

**Skip for MVP:**
- ❌ Location-based optimization (just suggest next open day)
- ❌ Travel time calculation
- ❌ Multi-photographer

**Deliverables:**
- n8n workflow: `booking-to-schedule-proposal.json`
- Service duration config: `scheduler_config.json`
- Google Sheet columns: ScheduleProposal, ScheduledDateTime, CalendarEventID
- Admin approval page (simple HTML form hosted on Render)

**Testing:**
- 10 test bookings across various services
- Verify sunset time accuracy for 5 different dates
- Confirm Calendar events created correctly

---

### Phase 2: Location Intelligence (4-6 weeks after Phase 1)

**Goal:** Cluster shoots geographically, reduce drive time by 30%

**Features:**
- ✅ Geocode all incoming listing addresses
- ✅ Query existing Calendar events for same day
- ✅ Calculate travel times between listings
- ✅ Propose time slots that cluster nearby shoots (e.g., 2 Ocean City shoots same afternoon)
- ✅ Display map visualization of proposed schedule (optional)

**New APIs:**
- Google Maps Geocoding
- Google Maps Distance Matrix

**Deliverables:**
- Updated n8n workflow with geocoding + clustering
- Geocoding cache in Sheet (Address, Lat, Lon, GeocodedAt)
- Travel time calculation function
- Route optimization logic (nearest-neighbor algorithm)

**Testing:**
- 20 test scenarios with varying address clusters
- Verify travel time estimates within 20% accuracy
- Stress test: 5 bookings in one day, ensure optimal route

---

### Phase 3: Multi-Photographer & Advanced Optimization (8-12 weeks after Phase 2)

**Goal:** Scale to 2-3 photographers, optimize across entire team

**Features:**
- ✅ Photographer assignment logic (prefer closest available, balance workload)
- ✅ Per-photographer calendars and availability
- ✅ Cross-photographer route optimization (assign shoots to minimize total drive time)
- ✅ Conflict resolution (auto-reschedule if one photographer overbooked)
- ✅ Photographer preference tracking (e.g., prefers twilights, avoids long drives)

**New Tools:**
- OR-Tools (Google's optimization library) or similar
- Separate scheduling service (may need to move from n8n to Python app)

**Deliverables:**
- Photographer management UI (admin assigns/removes photographers)
- Assignment algorithm (constraint-based or heuristic)
- Multi-calendar sync logic
- Performance monitoring (avg shoots/day per photographer, utilization %)

**Testing:**
- Simulate 50 bookings across 3 photographers over 2 weeks
- Verify workload balanced within 10%
- Measure scheduling runtime (should be <10 seconds)

---

### Phase 4: AI-Powered Automation (Future / 12+ weeks)

**Potential Features:**
- Auto-approve schedule if confidence score >90%
- Predict no-shows / cancellations based on historical data
- Dynamic pricing based on schedule density (surge pricing for tight slots)
- Client self-scheduling (show available slots, client picks)
- SMS reminders 24h before shoot
- Weather-based rescheduling suggestions

---

## Cost Estimate

### Development Time (Phase 1 MVP)
- n8n workflow design: 8 hours
- Scheduler config + duration mapping: 2 hours
- Google Sheet schema updates: 2 hours
- Calendar event creation logic: 4 hours
- Admin approval page: 4 hours
- Testing + bug fixes: 6 hours
- **Total: ~26 hours (~3 weeks part-time)**

### Ongoing Operational Costs
| Service | Usage | Cost |
|---------|-------|------|
| Google Maps Geocoding | ~1,000 req/year | Free (under 40k/mo limit) |
| Google Maps Distance Matrix | ~1,000 req/year | ~$5/year |
| sunrise-sunset.org | ~100 req/year | Free |
| Google Calendar API | Unlimited (G Suite) | Free |
| n8n hosting | Existing | $0 (already deployed) |
| **TOTAL** | | **~$5/year** |

### Scaling Costs (Phase 3)
- OR-Tools library: Free (open source)
- Potential dedicated scheduler service: ~$7/month (Render)

---

## Recommendation

### Immediate Next Steps

1. **Approve Phase 1 MVP scope** (2-3 weeks)
2. **Create `scheduler_config.json`** with service durations
3. **Add Sheet columns:** ScheduleProposal, ScheduledDateTime, CalendarEventID
4. **Build n8n workflow** for basic scheduling
5. **Test with 10 real bookings** before launch

### Go / No-Go Criteria

**GO if:**
- ✅ Admin spends >3 hours/week manually scheduling
- ✅ Willing to test MVP for 2-4 weeks before full rollout
- ✅ Can tolerate occasional manual override for edge cases

**NO-GO if:**
- ❌ Booking volume <5/week (not worth automation yet)
- ❌ Need 100% perfect scheduling (humans currently faster/better)
- ❌ Can't dedicate time to refine system based on feedback

### Risk Mitigation

- **Start with manual approval** (admin always reviews before confirming)
- **Parallel run** for 2 weeks (scheduler proposes, admin schedules manually, compare)
- **Fallback mode** (if scheduler fails, revert to manual workflow)
- **Incremental rollout** (start with Basic Photos only, add services one by one)

---

## Conclusion

The ROM scheduling system is **technically sound and strategically valuable**. An n8n-based MVP can deliver immediate time savings with minimal dev overhead. The architecture scales gracefully through Phase 2 (location optimization) and Phase 3 (multi-photographer), with clear migration paths.

**Bottom line:** Build it. Start simple. Iterate based on real usage.

**Estimated ROI:**
- Admin time saved: 2-4 hours/week × $50/hour = $100-200/week
- Development cost (MVP): 26 hours × $0 (in-house) = $0
- Payback period: Immediate

---

**Prepared by:** Leo (ROM subagent)  
**Date:** March 27, 2026  
**Next Review:** After Phase 1 MVP testing
