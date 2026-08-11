# MMB cancellation, Round 1

Three clickable, offline, neutral grayscale flows of the self-serve
cancellation journey, built as the stimulus for the TRR-6900 usability test.

One booking, one fee schedule, one formula. The only thing that changes
between the flows is how much has been paid, which is what decides whether the
customer gets money back, gets nothing back, or owes money.

## Launch

Unzip anywhere and open `index.html` in Chrome or Safari. No build step, no
local server, no network. Test it with wifi off before the first session.

Participants start on the flow their task brief matches. Nothing links between
flows, so a participant cannot wander from one task into another.

## The three flows

| | Total price | Paid | Charge today | Outcome at the default position |
|---|---|---|---|---|
| **Flow 1**, paid in full | £10,439.00 | £10,439.00 | £400.00 | £10,039.00 refunded |
| **Flow 2**, deposit paid only | £10,439.00 | £400.00 | £400.00 | £0.00 back, nothing owed |
| **Flow 3**, low deposit offer | £4,000.00 | £300.00 | £400.00 | £100.00 owed, no online route |

## Task briefs

Verbatim from the test plan, section 5.

**T1, Flow 1.** "You booked a £10,439 all-inclusive holiday for two, departing
in about 12 weeks. You have paid in full. Your plans have changed and you need
to cancel. Use the booking page to find out what you would get back, and cancel
the booking."

**T2, Flow 2.** "Same holiday, but this time you have only paid the £400 deposit
so far. Find out what cancelling would mean for you, and decide what to do."

**T3, Flow 3.** "You booked a £4,000 holiday on a £300 low-deposit offer. You
need to cancel. See what your options are."

## Flow map

```
index.html
  flow1-paid-in-full/ , flow2-deposit-only/ , flow3-low-deposit/
    01-trip-summary.html          Hub. Cancel booking sits at the foot of Amend booking.
    02-checking-cost.html         Pre-commit processing, 1.6s, routes on the rule below.
    03-refund-quote.html          Online path. The quote, the schedule, the terms.
    03-how-to-cancel.html         Phone path. Costs more than has been paid.
    04-confirm-cancellation.html  Breakdown, warning, acknowledgement gate, commit.
    04-contact-us.html            Phone path terminal. Contact sheet over the hub.
    05-cancelling.html            Post-commit processing, 1.6s, no way out.
    06-cancelled.html             Confirmed. Refund, what happens next.

branches/cancel-failed-flow1.html   Facilitator only. Commit fails, phone route.
branches/cancel-failed-flow2.html   Same on the deposit-only booking.
```

Every folder carries the full set so a days-to-departure override always lands
on a truthful screen. Which screens a participant actually sees is decided by
the routing rule, not by the folder.

### The routing rule

**If today's cancellation charge is larger than the amount paid, the customer
would owe money, no online payment path exists, and the flow goes to the
contact centre.**

That one rule reproduces all three source designs at the default position.
Flow 3 meets the condition at every point on the schedule, so it never offers
an online completion path. Flows 1 and 2 meet it only under an override.

Retreat routes (`Keep my booking`, and the close control) return to the hub
from every decision screen. There is no back navigation inside the dialog
sequence, matching the real product.

## Moving the scenario across the fee schedule

Today is always the participant's real date. Departure is computed as today
plus days-to-departure, so nothing on screen can quietly go stale. Add
`?dtd=N` to any entry link and every date, day count, percentage and amount
recomputes together. The value persists for the session; garbage input falls
back to the default.

**The default is 83.** At 83 the flows reproduce the source designs exactly:
loss-of-deposit band, £400.00 charge, 13 days until the fee rises to 30%, and
a countdown to the 06:00 departure reading 82 days, which is what the source
frames show.

| dtd | Band | Flow 1 | Flow 2 | Flow 3 |
|---|---|---|---|---|
| 83 (default) | Loss of deposit | £10,039.00 back | £0.00 back | owes £100.00, phone |
| 71 | Loss of deposit | £10,039.00 back | £0.00 back | owes £100.00, phone |
| 70 | 30% of total | £7,307.30 back | owes £2,731.70, phone | owes £900.00, phone |
| 50 | 50% of total | £5,219.50 back | owes £4,819.50, phone | owes £1,700.00, phone |
| 40 | 70% of total | £3,131.70 back | owes £6,907.30, phone | owes £2,500.00, phone |
| 10 | 100% of total | £0.00 back | owes £10,039.00, phone | owes £3,700.00, phone |

> **Flow 2 only completes online in the loss-of-deposit band.** A deposit-only
> customer is past the routing rule the moment the percentage bands start, so
> any Flow 2 link at fewer than 71 days behaves like Flow 3. That is the design
> working correctly rather than a bug, but know it before you move Flow 2, and
> read it as a finding in its own right: see BUILD-RECORD.md section 3.

## Simulated

- Both processing screens are fixed 1.6s timers, not real work.
- The fee is computed in the browser from the schedule in `assets/mmb.js`,
  not quoted by a booking system.
- No email is sent, no refund is raised, and no call is placed. The Call
  button on the contact sheet logs an event and does nothing else.
- The commit always succeeds. To show a failure, open the facilitator branch
  from the index after the participant reaches the confirm step.

## Omitted, and why

- **The hotel photograph.** A neutral block stands in. If the study needs to
  see whether the photo makes people hesitate, drop a real image in and give it
  `filter: grayscale(1)`.
- **Inert controls, deliberately present.** The Extras and Documents tabs, the
  amend, edit and payment links, and the Make a payment button do nothing. They
  stay in the stimulus because removing them would change what the cancellation
  route competes against for attention on the hub.
- **Brand.** No logo, no brand colour, no brand typeface. The operator prefix
  is off the hotel name and the carrier name is off the flights.
- **Trust marks and company registration boilerplate.** The financial
  protection wording is kept, condensed, in a disclosure.

## Not built yet

Three requirements from section 8 of the test plan are outstanding and need a
decision before fielding. They are listed in BUILD-RECORD.md section 6:
completion codes, a hidden or renamed Reset link, and whether the success
screen is terminal.

## Between participants

Hit **Reset**, bottom right on every screen. It clears session state, the
days-to-departure override, the cancelled flag and the event log, then returns
to the index. State is `sessionStorage` only, so a fresh tab also starts clean.

Reset matters more in this build than the last one: a completed cancellation
marks that booking cancelled for the rest of the session, so the next
participant would otherwise start on a cancelled hub.

## For the moderator, in the browser console

- `LOFI.events()` reads the exact event sequence fired this session. Every
  event carries the flow it came from.
- `LOFI.audit()` checks computed styles on the current screen for chromatic
  colour, tap targets under 44px and a missing screen heading.

## Files

```
index.html              Moderator landing, roots into all three flows
README.md               This file
BUILD-RECORD.md         Decisions, divergences, open questions, validation
assets/lofi.css         The whole visual system, one file
assets/lofi.js          window.LOFI: state, dialogs, reset, audit
assets/mmb.js           window.MMB: three scenarios, dates, fee schedule, money
flow1-paid-in-full/     Eight screens
flow2-deposit-only/     Eight screens
flow3-low-deposit/      Eight screens
branches/               Facilitator-only states
```
