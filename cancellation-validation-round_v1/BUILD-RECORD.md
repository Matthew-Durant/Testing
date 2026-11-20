# Build record, release validation round

**Package:** `cancellation-validation-round_v1`
**Date:** 20 November 2026
**Source:** Figma node `424:1356`, "Validation round · Mobile" (already drawn
in neutral grayscale).
**Built with:** `lofi-grayscale-prototype`. `lofi.css` and `lofi.js` are
carried over from `Cancellation-prototype_v2`; `mmb.js` is rewritten for the
four scenarios.

## 1. What shipped

Four scenarios, twelve participant screens, one researcher index.

States built: online quote, call-us quote, passed / today / upcoming schedule
bands, contact sheet (open, closed), acknowledgement-gated disabled action,
enabled action, end of scenario, plus the override edges (top band, last day
of a band, zero refund).

## 2. Conversion decisions

The draft is already neutral, so most of this is confirming that no meaning
rests on shade alone.

| Job in the draft | Carried here by |
|---|---|
| Passed band, "greyed" | The word "Passed", canvas-value row, label drops from 700 ink-900 to 600 ink-700, shorter-value bar. Text stays at 7.74:1. |
| Current band | 2px ink-900 border, ink-900 bar, filled "Today" badge |
| Cost level across bands | Bar length plus the percentage written on every row |
| Lead quote panel | The only filled enclosure above the fold, 18px 700 headline |
| Warning | fill-100 surface, 3px ink-900 rule, the word "Important" in the copy |
| Call-us alert | White card, 3px ink-900 rule, 18px title |
| Primary vs retreat action | One filled pill per region, retreat is outlined |
| Disabled commit | fill-100 with ink-400 label, plus the written hint beneath |

Copy is verbatim from the draft.

## 3. Divergences from the draft

1. **Dates are dynamic.** Required by the draft's own note. The frames show
   12 Oct 2026 dates; the build shows dates relative to the session.
2. **Pages, not a fixed dialog.** Screens scroll as normal pages so a phone
   participant gets native scrolling. Visually the same header and close.
3. **Type and spacing snap to the system scale** (23/18/16/14/13, 8pt
   spacing, 8px bars rather than 4px, 44px minimum targets).
4. **End-of-scenario screen added.** The draft stops at the confirm screen
   and the contact sheet. Something has to follow Cancel, Keep and close.
5. **Call button acknowledges the tap** with a short message. See 4.2.
6. **Edge wording** for the top band and the last day of a band is written
   here, not in the draft. Only reachable with `?dtd`.

## 4. Open questions

1. **Schedule boundaries are one day off the Round 1 build.** The draft's
   dates give bands of 70+, 63 to 69, 49 to 62, 29 to 48, 15 to 28 and 0 to 14
   days. `Cancellation-prototype_v2` used 71+, 64 to 70, 50 to 63, 30 to 49,
   16 to 29 and 1 to 15. This build follows the draft, because all four of its
   bookings are internally consistent on those boundaries. One of the two is
   wrong against the booking terms. Confirm before release copy is signed off.
2. **Call button message.** "Calls are switched off in this test" is
   prototype wording, not product copy. It is there because nobody is present
   to explain a dead button in an unmoderated session. Remove it if you would
   rather observe the dead-end reaction.
3. **No success screen.** Scenario A task 4 and scenario D task 3 ask the
   participant to continue "as if" cancelling. If they tap Cancel my booking
   they get the end-of-scenario screen. If the confirmation screen is in
   scope, it needs designing with current copy.
4. Resolved in section 7: the call-us quote card and alert are now built
   from rendered master frames.
5. Carried from the draft: passed-band state not in the master file; the
   scenario B reason line; interim refund timing; "Still to pay" depends on
   the front-end calculation answer.

## 5. Observations on the design, not changed here

- **The checkbox restates two amounts.** A participant who ticks without
  reading still passes the gate, so a tick is weak evidence of comprehension.
  The pass criteria rightly rest on what they say, not on the tick.
- **Scenario B shows two "still owed" figures on one screen**, £2,731.70 to
  pay and a £10,039.00 balance they will not pay. The pass criteria already
  watch for this. It is the most likely misreading in the round.
- **"You don't need to decide today"** sits directly above "Call us as soon
  as you can" in scenarios B and C. The two lines pull in opposite directions.

## 6. Validation evidence

- `scripts/audit.sh`: clean (grayscale purity, radius and spacing scale,
  offline, sessionStorage only, scaffolding, copy, accessibility smoke).
- Headless Chrome at 375px, network offline, session pinned to 12 Oct 2026:
  every amount, date range, day count and boundary sentence in all four
  scenarios matches the draft. Sheet traps focus, Escape closes it, focus
  returns to the opener. Confirm gate starts disabled and enables on tick.
  No console errors, no failed requests, no horizontal scroll.
- `LOFI.audit()`: no chromatic colour. Two target-size notes, both accepted:
  the 24px checkbox (its 86px label is the target) and the inline, inert
  frequently asked questions link.
- Not done: the three hierarchy questions with a colleague who has not seen
  the source, a real-device pass on iOS Safari, and a screen-reader pass.

## 7. Revision, 20 November 2026: aligned to the master file

**Source:** Figma `v2RW5QZqWZU2rKglfrutFj`, "Getting ready for DOR". Read:
Flow 1 quote and confirm (`1:3245`, `1:3253`), Flow 3 phone route and contact
modal (`1:3578`, `1:3589`). Not read: Flow 2, loading, processing, success,
error, the tablet and desktop breakpoints, market variants, accessibility
annotations.

### Changed to match the master

| Area | Before | Now |
|---|---|---|
| Surface | Grey canvas, 16px white cards | One white modal surface, bordered 12px cards |
| Hero | Placeholder circle | Island-with-cross icon as a neutral line icon, rule under the title |
| Booking block | "Flamingo Beach Hotel", "Playa Blanca, ..." | "Flamingo Beach", "In Playa Blanca, ..." |
| Lead quote | 18px heading | Info-alert block, 16px heading, 600 message. Info icon on the owes-money variant only, as drawn |
| Schedule labels | "30% of total" | "30% of total price" |
| Schedule dates | Ranges, "5 Oct - 18 Oct" | Start only, "From 5 Oct". First band still "Until ..." |
| Schedule rows | Label and range stacked on every row | Label left, date right. Rows with a state word stack the date under the label |
| Terms | Four open paragraphs | Accordion, "Cancellation explained", first item open. New titles "Receiving cancellation notice" and "Booked with a low deposit" |
| Owes-money quote card | Paid, Cost, Still to pay, Refund £0.00 | Paid, Cost with "Includes your deposit..." note, Still to pay. **Refund row removed** |
| Call-us alert | Three paragraphs, reference second | One paragraph, then the reference line in bold |
| Confirm | No back route | "Back" link under the header |
| Confirm warning | "Important: once cancelled..." | "Once cancelled..." with a warning icon |
| Confirm actions | Cancel, hint, Keep | Keep, Cancel, hint |
| Contact sheet | Title "Call us to cancel" | Title "Cancel your booking", reference in bold, compact hours |

### Deliberately not taken from the master

1. **Brand.** Colour, typeface and the "TUI BLUE" hotel prefix stay out.
   The warm-to-red ramp on the schedule is not reproduced: cost level stays
   on bar length and the written percentage.
2. **The pointer on the current band** and the corner-mounted "Today" tag.
   The 2px border and the pill badge already do that job.
3. **Passed bands.** Still not in the master, still needed for A and B.
   Rendered with no fill and no border plus the word "Passed".
4. **Band boundaries.** The master's own example puts 90% "From 22 Sept" on
   a 21 Oct departure, which is 29 days out; the validation draft and the
   other five rows put that boundary at 28. Treated as a one-day slip in the
   master. This build keeps 70+, 63 to 69, 49 to 62, 29 to 48, 15 to 28,
   0 to 14. Confirm against the booking terms.
5. **Two copy slips in the master**, corrected here: a missing full stop in
   "goes up on 13 Aug Call us", and the unresolved `{{Contact-center-phone}}`
   token, shown as the number.
6. **"Important" on the warning.** The master drops the word and relies on
   the amber surface and icon. With no hue, the icon and the 3px rule carry
   it visually; "Important:" is kept for screen readers only.

### New open questions

1. **The Refund £0.00 row is gone but the test plan still depends on it.**
   Scenario C lists "Whether Refund £0.00 is noticed" as a watch-for, and B
   and C pass on the participant stating "£0.00 back". Nothing on the
   owes-money screen now states the refund. Either the row returns or the
   criteria change. As built, a participant can only infer it.
2. **Info icon on one lead-quote variant and not the other.** Built as
   drawn. If unintended, it is a visible difference between A/D and B/C that
   participants in a rotated design will meet.
3. **Accordion hides three of the four terms by default.** Scenario D asks
   where the £400 goes; the "Non-refundables" text that answers it is now
   collapsed. Watch whether anyone opens it.
4. **Back label.** The master instance shows "back" in lower case on what
   looks like a default label. Built as "Back".
5. **Keep above Cancel on the confirm step.** The retreat action now comes
   first and the committal one sits last, next to its hint. Worth watching
   for mis-taps on Keep by participants who intend to cancel.

### Validation

Same checks as section 6, re-run after the change: audit clean; all four
scenarios match their figures and dates at a pinned 12 Oct 2026 session;
back link, action order, sheet focus handling and the removed Refund row
asserted in headless Chrome at 375px with the network offline.
