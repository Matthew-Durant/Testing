# MMB cancellation, release validation round

Four clickable, neutral grayscale scenarios of the post-study cancel flow,
built as the stimulus for the short unmoderated validation round before
release (TRR-6900).

Source: Figma `MMB Cancellation Flow (UK&I) TRR-6900`, page
"Validation round · Mobile", node `424:1356`.

Revised 20 Nov 2026 to follow the component set in the master file copy
"Getting ready for DOR" (Figma `v2RW5QZqWZU2rKglfrutFj`). Scenarios, amounts
and tasks are unchanged; layout and some copy changed. See BUILD-RECORD.md
section 7.

## Launch

Open `index.html`. It is the researcher page: it holds the participant link,
brief, tasks and pass criteria for each scenario. Send participants the
scenario link, never the index. No build step and no network requests; it also
runs from disk with wifi off.

## The four scenarios

| | Days to departure | Total | Paid | Cost today | Outcome | Route |
|---|---|---|---|---|---|---|
| **A** Part-paid, partial refund | 55, 50% band | £10,439.00 | £7,000.00 | £5,219.50 | £1,780.50 back | Online |
| **B** Deposit only, owes money | 66, 30% band | £10,439.00 | £400.00 | £3,131.70 | £2,731.70 to pay, £0.00 back | Call us |
| **C** Low deposit, owes money | 82, loss of deposit | £4,000.00 | £300.00 | £400.00 | £100.00 to pay, £0.00 back | Call us |
| **D** Paid in full, refund | 82, loss of deposit | £10,439.00 | £10,439.00 | £400.00 | £10,039.00 back | Online |

## Flow map

```
index.html                 Researcher page. Not linked from any participant screen.
scenario-a/ .. scenario-d/
  01-quote.html            Quote and schedule. Online or call-us layout, by the routing rule.
                           Call-us layout carries the contact sheet (bottom sheet, same page).
  02-confirm.html          Breakdown, warning, acknowledgement gate, commit. Online route only.
  03-cancelled.html        Success: booking cancelled, refund, what happens next. Online route only.
  end.html                 Neutral end-of-scenario screen.
```

**Routing rule.** If today's cost to cancel is more than has been paid, the
customer owes money, there is no online payment path, and the quote screen
shows the call-us layout. Every folder carries the full screen set so an
override always lands on a truthful screen.

## Dates

Every date is computed from the day the link is opened: departure is today
plus the scenario's days to departure. The amounts never move; the dates do.
The draft's dates assumed a session on Mon 12 Oct 2026.

- `?today=2026-10-12` pins the session date, to compare against the draft.
- `?dtd=N` moves a scenario along the schedule.

Both last for the tab session only (`sessionStorage`).

## Simulated

- Amounts are computed in the browser from the schedule in `assets/mmb.js`.
- Cancel my booking goes to the success screen. Nothing is cancelled and no
  email is sent. Back to my account, Keep my booking and the close control
  go to the end-of-scenario screen.
- The Call button places no call; it shows "Calls are switched off in this
  test". The frequently asked questions link is inert.

## Unmoderated differences from the Round 1 package

- **Invisible reset, top right of every participant screen.** A transparent
  44 by 44 square at the very top of the screen. It clears the session and
  returns to the first screen of that scenario, never to the index. It
  scrolls with the screen, so scroll to the top to use it. It is out of the
  tab order and hidden from screen readers.
- No trip summary hub: each scenario opens on the quote, as in the draft.
- Events are logged to `sessionStorage` only (`LOFI.events()` in the console).
  They are not sent anywhere, so they cannot be collected from a remote
  participant. Use the testing platform's recording for evidence.

## Files

```
index.html          Researcher page
README.md           This file
BUILD-RECORD.md     Decisions, divergences, open questions, validation
assets/lofi.css     The visual system, one file (section 27 is new for this round)
assets/lofi.js      window.LOFI: state, sheet, toast, audit
assets/mmb.js       window.MMB: four scenarios, dates, schedule, money
scenario-a/ .. -d/  Four screens each
```
