# MMB cancellation, lo-fi grayscale stimulus

Flow 1, paid in full. A clickable, offline, neutral grayscale prototype of the
booking cancellation journey, built for moderated usability testing.

## Launch

Unzip anywhere and open `index.html` in Chrome or Safari. No build step, no
local server, no network. Test it with wifi off before the first session.

Participants start at **Flow 1, paid in full** on the index. Everything on the
cancel path is live.

## Task briefs

**Task 1, the main path.** "You booked this holiday with your wife and you have
paid for it in full. Something has come up and you are thinking about
cancelling. Find out what it would cost you, and cancel if you decide to."

**Task 2, comprehension probe, ask after Task 1.** "Without going back, tell me
how much you got back and how much it cost you to cancel."

## Flow map

```
index.html
  01-trip-summary.html        Hub. Cancel booking sits at the foot of Amend booking.
  02-checking-cost.html       Pre-commit processing, 1.6s, auto-advances.
  03-refund-quote.html        The quote, the fee schedule, the terms. Decision point.
  04-confirm-cancellation.html Breakdown, warning, acknowledgement gate, commit.
  05-cancelling.html          Post-commit processing, 1.6s, no way out.
  06-cancelled.html           Confirmed. Refund, what happens next.

branches/cancel-failed.html   Facilitator only. Commit fails, phone route.
```

Retreat routes from 03 and 04 (`Keep my booking`, and the close control) return
to 01. There is no back navigation inside the dialog sequence, matching the
real product.

## Moving the scenario across the fee schedule

Today is always the participant's real date. Departure is computed as today
plus days-to-departure, so nothing on screen can quietly go stale. Add `?dtd=N`
to any entry link and every date, day count, percentage and amount recomputes
together. The index has four presets:

| dtd | Band | Charge | Refund |
|---|---|---|---|
| 83 (default, reproduces the source design) | Loss of deposit | 400.00 | 10,039.00 |
| 67 | 30% of total | 3,131.70 | 7,307.30 |
| 40 | 70% of total | 7,307.30 | 3,131.70 |
| 10 | 100% of total | 10,439.00 | 0.00 |

The value persists for the session. Garbage input falls back to the default.

## Simulated

- Both processing screens are fixed 1.6s timers, not real work.
- The fee is computed in the browser from the schedule in `assets/mmb.js`,
  not quoted by a booking system.
- No email is sent and no refund is raised.
- The commit always succeeds. To show a failure, open the facilitator branch
  from the index after the participant reaches step 4.

## Omitted, and why

- **The hotel photograph.** A neutral block stands in. If the study needs to
  see whether the photo makes people hesitate, drop a real image in and give it
  `filter: grayscale(1)`.
- **Inert controls, deliberately present.** The Extras and Documents tabs, and
  the amend, edit and payment links on the hub, do nothing. They stay in the
  stimulus because removing them would change what the cancellation route
  competes against on the page.
- **Brand.** No logo, no brand colour, no brand typeface. The operator prefix
  is off the hotel name and the carrier name is off the flights. See
  BUILD-RECORD.md.
- **Trust marks and company registration boilerplate.** The financial
  protection wording is kept, condensed, in a disclosure.

## Between participants

Hit **Reset**, bottom right on every screen. It clears session state, the
days-to-departure override and the event log, then returns to the index.
State is `sessionStorage` only, so a fresh tab also starts clean.

## For the moderator, in the browser console

- `LOFI.events()` reads the exact event sequence fired this session.
- `LOFI.audit()` checks computed styles on the current screen for chromatic
  colour, tap targets under 44px and a missing screen heading.

## Files

```
index.html              Moderator landing
README.md               This file
BUILD-RECORD.md         Decisions, divergences, open questions, validation
assets/lofi.css         The whole visual system, one file
assets/lofi.js          window.LOFI: state, dialogs, reset, audit
assets/mmb.js           window.MMB: scenario, dates, fee schedule, money
flow1-paid-in-full/     Six participant screens
branches/               Facilitator-only states
```
