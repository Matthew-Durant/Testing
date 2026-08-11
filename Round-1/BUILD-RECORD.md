# Build record, Round 1

**Package:** `mmb-cancellation-prototype_Round-1`
**Date:** 11 August 2026
**Source:** three high-fidelity UI frame sets, `Flow 1 / Paid in full (UI)`,
`Flow 2 / Deposit paid only (UI)`, `Flow 3 / Less than Deposit (UI)`.
**Built with:** `lofi-grayscale-prototype` for the visual system,
`mmb-usability-prototype` for the package structure, date model, money maths
and event logging. The lo-fi skill specifies this composition: that skill's
structure, this skill's `lofi.css` in place of its `styles.css`.
**Supersedes:** `cancellation-lofi-prototype_v1`, which carried Flow 1 only.

---

## 1. What shipped

Three participant flows off one moderator index, two facilitator branches,
twenty-five screens in total. Framework-free, offline, keyboard completable,
`sessionStorage` only.

States built: default, pre-commit processing, post-commit processing,
acknowledgement-gated disabled action, enabled action, success, zero-refund
success, cancelled hub, commit failure, the phone route and its contact sheet,
plus the retreat route from every decision screen.

Every folder carries the full screen set, so a days-to-departure override
always lands on a truthful screen rather than a screen that contradicts the
figures. Which screens a participant sees is decided by the routing rule in
section 3, not by which folder they started in.

## 2. Three scenarios, one formula

The flows differ only in money. Everything else, the hotel, the passengers,
the dates, the schedule, the copy, is identical, which is what makes the three
tasks comparable.

| | Total price | Paid to date | Invoice deposit | Extras |
|---|---|---|---|---|
| Flow 1 | £10,439.00 | £10,439.00 | £400.00 | £0.00 |
| Flow 2 | £10,439.00 | £400.00 | £400.00 | £0.00 |
| Flow 3 | £4,000.00 | £300.00 | £400.00 | £0.00 |

Flow 3's figures are recovered from the source rather than invented: the hub
shows an outstanding balance of £3,700.00, which is £4,000.00 minus £300.00,
and the task brief in the test plan states both numbers.

`chargePence()` is the greater of the invoice deposit and the percentage of
total price, per the source's own rule that the deposit is non-refundable even
when the charge is lower. Refund, fee-above-deposit, outstanding balance and
shortfall all derive from it. The fee schedule is the one recovered in v1 and
is unchanged:

| Band | Days before departure |
|---|---|
| Loss of deposit | 71 and over |
| 30% of total | 64 to 70 |
| 50% of total | 50 to 63 |
| 70% of total | 30 to 49 |
| 90% of total | 16 to 29 |
| 100% of total | 1 to 15 |

The default is **dtd 83**, unchanged from v1. At 83 the flows reproduce the
source frame for frame: loss-of-deposit band, £400.00 charge, 13 days until
the fee rises to 30%, and a countdown to the 06:00 outbound reading 82 days,
which is what the source frames show.

Flow selection is by `data-flow` on `<html>`, with the folder name as a
fallback so a file opened out of context still renders its own figures rather
than silently falling back to Flow 1's.

## 3. One routing rule, and what it exposes

Rather than hard-coding Flow 3 as "the phone one", the route is decided by a
single condition in every flow:

> **If today's cancellation charge is larger than the amount paid, the customer
> would owe money, no online payment path exists, and the flow goes to the
> contact centre.**

That reproduces all three designs exactly at the default position, and it
keeps the `?dtd` override truthful instead of offering an online completion
the customer could not actually make.

**It also exposes something that needs a product decision.** Flow 2 only
completes online in the loss-of-deposit band. The moment the percentage bands
start, a deposit-only customer owes money and gets Flow 3's experience. On
this scenario a deposit-only customer at 70 days owes £2,731.70 to cancel.

That is not a prototype artefact; it follows from the fee schedule and the
absence of a pay-to-cancel path. Read commercially, it means the self-serve
cancellation capability serves paid-in-full customers across the whole
schedule and deposit-only customers for a few weeks only, then hands them
back to the contact centre at exactly the point the conversation gets
difficult and the handling time gets long. The population this deflects is
smaller than the flow diagram implies. This is the same pay-to-cancel
decision Task 3 was designed to gather evidence for, and Task 2 now gathers
evidence for it too if any session runs at a lower dtd.

Recommend it is sized before build: what share of cancellations are
deposit-only and outside the first band, and what would a pay-to-cancel step
cost to deliver against the contact-centre handling time it removes.

## 4. Requirement 3, read as the two copy variants

Instruction taken as: the boundary-note A/B variants are dropped, one copy
only. Built accordingly. There is no `copy=a` / `copy=b` parameter, and no
refund-promise switch either, so the build is single-copy on both counts and
survives either reading of which requirement was simplified.

**The surviving boundary copy is the one without "You don't need to decide
today."** That is what the Flow 2 and Flow 3 frames show, and it matches the
later of the two expressions of intent on record. Flow 1's frame still carries
the sentence, so **this needs a one-line confirmation.**

Two things follow, and both are recorded rather than resolved:

1. **Nothing in the study will now arbitrate whether the fee ladder reads as
   pressure.** What is left on the screen is a six-step escalating schedule, a
   day count, and a date at which it gets worse, with no counterweight. If
   that question still matters, a single-cell "I felt rushed to decide" rating
   recovers most of it without the two-study structure.
2. **The note had to be made true at the edges.** "13 days at the current fee
   level" is fine mid-band, but on the last day of a band it would read as
   reassurance that is about to expire, and in the 100% band there is no next
   increase at all. The copy now reads "Today is the last day at the current
   fee level" at one day, and "This is the highest fee level" at the top. Both
   were verified either side of every boundary.

## 5. Divergences from the source, with reasons

Carried forward from v1 and still applying: UK spelling corrections
("cancelation", "canceling"), the masked card string rendered as "Visa card
ending 1083", one email address used consistently, no close control on the
post-commit processing screen, de-branded content, comma rather than em dash
on status suffixes, and the landing focus ring suppressed on screen headings.

New in this round:

1. **The Contact us sheet has its hierarchy inverted, and it is reproduced as
   drawn.** In the source, "Close" is the filled primary button and "Call 0203
   451 2688", the only action that resolves the participant's task, is
   outlined and subordinate. The lo-fi system would normally reassign the
   filled treatment to the primary action, but the skill is explicit that a
   hierarchy problem in the source is not fixed quietly in conversion, because
   exposing it may be the point of the test. **Recommend swapping before
   build**; it is a one-class change either way.
2. **"To cancel today will costs more than you've paid"** corrected to "will
   cost". A grammatical error in a stimulus makes participants critique the
   prototype instead of the design.
3. **"£400" normalised to "£400.00"** on the Flow 3 quote card. The other two
   flows use two decimal places and a participant doing all three tasks would
   otherwise meet two money formats for the same figure.
4. **Three phone numbers in the source** (0203 451 2688 on the contact sheet,
   01 693 7700 in the footer, and an unresolved `{{Contact-center-phone}}` on
   the confirm screen). Standardised on **0203 451 2688**, the number the
   design puts on the one screen whose entire purpose is calling. Note it is a
   real, dialable number; in an unmoderated study a non-routable placeholder
   may be safer. **Needs a decision.**
5. **The Paphos, Cyprus background** on Flow 3's final frame, and its "Want to
   make a change? Your holiday cannot be amended online" banner, look like a
   re-used screenshot from another file: the booking is a different holiday,
   and the banner contradicts the hub, which does offer amend links. The
   participant's own Playa Blanca hub is used instead and the banner is not
   included. **Confirm the banner was not deliberate.**
6. **Returning after cancelling now shows a cancelled hub.** The success
   screen's "Back to my account" previously landed on a live booking that
   still offered Cancel booking, which contradicts the screen the participant
   had just read and would answer any "what happens next" question against a
   false state. The hub now shows a cancelled status block and hides the
   payments, countdown and amend sections. See section 6 for why this is not
   the same thing as the terminal-page requirement.
7. **Flow 1 shows a "Non-refundable extras" line at £0.00 and Flow 2 does
   not.** Both reproduced as drawn. See open question 1.
8. **The hub renders behind the contact sheet, inert and `aria-hidden`,**
   rather than the minimal app bar used behind the full-height dialogs. A
   bottom sheet with nothing behind it reads as a rendering fault.

## 6. Open questions and outstanding decisions

**Needing a decision before fielding**

1. **The breakdown labels still contradict the quote screen.** The quote says
   "Today's cost of cancellation: £400.00 your deposit". The breakdown then
   lists "Cancellation fee today £0.00". The arithmetic is right, but nothing
   on the line says "deducted", and £0.00 is readable as "cancelling costs me
   nothing". Raised in v1, unanswered, and it now appears in two of the three
   flows. If it is not what the study is for, the fix is to label the lines as
   deductions and show the deposit as the charge.
2. **Flow 3 never says how much more.** "To cancel today will cost more than
   you've paid" is true, but the participant is not told the shortfall is
   £100.00. This is the largest honesty gap in the three designs, and RQ6 asks
   precisely whether people feel informed or ambushed. `MMB.shortfallPence()`
   and a `data-mmb="shortfall"` hook are already in the build, so adding the
   figure is a copy change, not a rebuild. **Recommend testing it with the
   figure shown**, or at minimum recording that its absence was deliberate.
3. **Which boundary copy survives** (section 4).
4. **The contact sheet's button hierarchy** (section 5, item 1).
5. **The contact centre number** (section 5, item 4).
6. **"7 to 14 business days"** and the 14-day invoice promise are reproduced
   from the source. An earlier MMB build flagged that April discovery recorded
   refunds as manually fulfilled with no verified SLA. Direct conflict, still
   open with ops. Six occurrences across the package.
7. **"Amend" appears in participant copy** in the hub section heading "Amend
   booking" and in the confirm screen's "You can amend your booking". A
   previous MMB study banned the word on cancellation surfaces. Confirm
   whether that still applies; both come straight from the source.

**Test-plan requirements not built, deliberately**

This round was scoped to the three flows and the index. Three section 8
requirements are outstanding:

8. **Completion codes.** A quiet four-character code on each flow's final
   screen. Not added, because it is participant-visible copy that was not in
   scope for this build. Trivial to add once the codes are chosen.
9. **The Reset link.** Still visible and labelled "Reset", bottom right. It
   needs hiding or renaming before an unmoderated session.
10. **Terminal success page.** The requirement says no return to the booking
    hub after cancellation. The build currently keeps the source's "Back to my
    account" button and makes the destination truthful instead. Removing the
    button satisfies the requirement literally; keeping the cancelled hub is
    what production will have to do anyway and gives an extra observation.
    **Pick one.**

**Still prototype-defined**

11. **The analytics event list.** No approved list has been supplied, so the
    names remain prototype-defined: `cancel_entry_opened`,
    `cancel_quote_viewed`, `cancel_quote_continue`, `cancel_quote_keep`,
    `cancel_confirm_viewed`, `cancel_ack_ticked`, `cancel_submitted`,
    `cancel_confirm_keep`, `cancel_completed`, `cancel_failed`,
    `cancel_back_to_account`, plus four added this round for the phone route:
    `cancel_phone_route_viewed`, `cancel_contact_opened`,
    `cancel_contact_viewed`, `cancel_contact_closed`, `cancel_call_tapped`.
    Every event now carries the flow it came from.
12. **The hotel photograph** is a neutral block. If whether the photo makes
    people hesitate is in scope, supply a real image; it goes in desaturated.
13. **All three flows use the same hotel, resort and dates.** That is what the
    source shows, and it keeps the tasks comparable, but a participant running
    all three in sequence may read them as one booking changing rather than
    three different customers. A different destination on Flow 3 would remove
    the ambiguity at the cost of comparability, and would also strengthen the
    closing attention check. Worth a decision before fielding.

## 7. Validation evidence

**Static.** `lofi-grayscale-prototype/scripts/audit.sh` exits clean: no
chromatic colour, all radii and spacing on scale, no external requests, no
CDN, `sessionStorage` only, every screen scaffolded with a viewport meta, lang
attribute, stylesheet link and screen heading, copy clean, images and icon
buttons labelled. `mmb-usability-prototype/scripts/sweep.sh` clean for em
dashes, external URLs, `localStorage` and per-test banned terms. One false
positive was checked and dismissed: the string "placeholder" in `lofi.css` is
the `::placeholder` pseudo-element, not placeholder copy.

**Dynamic.** Playwright, Chromium, Europe/London, 393px, offline `file://`:
**539 assertions, 0 failures, 0 console errors.**

- Every date, charge, refund, fee-above-deposit, outstanding balance and
  shortfall independently recomputed in Python from the scenario data and
  matched against what renders, at dtd 83, 71, 70, 67, 50, 30, 16, 10 and 1,
  across all three flows.
- The routing rule verified against the recomputed shortfall at every point.
- Flow 3 confirmed to offer no online completion path at fourteen positions
  spanning the whole schedule, including both sides of every band boundary.
- Boundary note verified at every position, including the last-day wording and
  the top-band wording, and asserted to contain no reassurance variant.
- Exactly one band marked live per screen, correct label, six bands present.
- Acknowledgement copy recomputed and matched in both its deposit-band and
  percentage-band forms; commit disabled before the tick and enabled after.
- Refund destination line and success refund block shown only when the refund
  is greater than zero.
- Returning to the hub after a commit shows the cancelled state and no cancel
  entry.
- Garbage `?dtd` input ("abc", "-5", "0", "99999", empty) falls back to 83.
- Landing focus lands on the screen heading on all five sequential screens.
- Full event sequence fired in order, every event tagged with its flow.
- No horizontal overflow on any screen at 320px or 393px.

**Still outstanding**

- Keyboard-only completion end to end, and 200% zoom, on the machine the
  moderator will actually use.
- A pass in the moderator's real browser, from `file://`, with wifi off.
- The three hierarchy questions in section C of the lo-fi QA checklist, which
  need a colleague who has not seen the source.
- A Figma mirror of Flows 2 and 3 alongside the Flow 1 mirror built in v1.
