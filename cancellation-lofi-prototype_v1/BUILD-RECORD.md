# Build record

**Package:** `cancellation-lofi-prototype_v1`
**Source:** `Lane / Flow 1 / Paid in full (UI)`, a high-fidelity six-frame TUI
MMB cancellation flow.
**Built with:** `lofi-grayscale-prototype` for the visual system,
`mmb-usability-prototype` for the package structure, date model, money maths
and event logging. The lo-fi skill specifies this composition: that skill's
structure, this skill's `lofi.css` in place of its `styles.css`.

---

## 1. What shipped

Six participant screens covering the whole cancellation journey, one
facilitator branch, a moderator index. Framework-free, offline, keyboard
completable, `sessionStorage` only.

States built: default, pre-commit processing, post-commit processing,
acknowledgement-gated disabled action, enabled action, success, failure,
plus the retreat route from both decision screens.

## 2. The fee schedule, recovered rather than copied

The source shows six fee bands as calendar date ranges against a 21 Oct 2026
departure. Read as days-to-departure they resolve to a clean schedule:

| Band | Days before departure | Source range, checked |
|---|---|---|
| Loss of deposit | 71 and over | until 11 Aug |
| 30% of total | 64 to 70 | 12 Aug to 18 Aug |
| 50% of total | 50 to 63 | 19 Aug to 1 Sept |
| 70% of total | 30 to 49 | 2 Sept to 21 Sept |
| 90% of total | 16 to 29 | 22 Sept to 5 Oct |
| 100% of total | 1 to 15 | 6 Oct to 20 Oct |

All six ranges reproduce exactly from `departure - maxDtd` to
`departure - minDtd`, which is what makes the dynamic date model possible.

The default is **dtd 83**, not the framework's 82. At 83 the flow reproduces
the source frame for frame: loss-of-deposit band, 400.00 charge, 10,039.00
refund, and 13 days until the fee rises to 30%. The source's own countdown
("82 days 12 hours") is consistent with this, because it targets the 06:00
outbound departure rather than midnight.

**One formula.** `chargePence()` is the greater of the deposit and the
percentage of total price, per the source's own rule that the deposit is
non-refundable even when the charge is lower. Every figure on every screen
derives from it. Verified across the whole schedule: charge is monotonic,
refund never negative, deposit floor holds, and the quote screen, the
breakdown, the acknowledgement text and the confirmation all agree at every
dtd tested (100, 83, 71, 70, 64, 63, 50, 49, 30, 29, 16, 15, 1).

## 3. Colour audit and substitutions

Every place colour carried meaning in the source, and what replaced it.

| Job colour was doing | Substitute |
|---|---|
| Brand identity, logo, brand type | Deleted. System UI stack. |
| Primary CTA, filled | `.lo-btn`, ink-600 fill, pill, full width |
| Destructive CTA, filled red | Same as primary. Consequence carried by the explicit verb, the acknowledgement gate and the warning, never by hue. |
| Retreat CTA, outlined | `.lo-btn.is-secondary` |
| Paid-in-full tick, green | `.lo-status.is-success`, surface plus tick plus the word |
| Refund panel, green | `.lo-status.is-success` |
| Quote panel, lilac | `.lo-quote`: fill-100, 12px radius, 3px ink-900 rule, value at 23px/700. Enclosure and size do what the tint did. |
| Warning panel, amber | `.lo-status.is-warning`, 3px ink-900 rule, suffix "Important" |
| **Fee schedule, five-step warm hue ramp** | **The hard one.** The ink ramp gives about four distinguishable steps, so shade alone would have failed. Severity re-encoded as bar length, the percentage written on every row, the date range written on every row, and the live band marked with a 2px ink-900 border plus a Today badge. |
| Current band, navy border and pill | `.is-selected` plus `.lo-badge` |
| Disabled commit button | `.lo-btn[disabled]`, fill-100 on ink-400, plus the existing hint line |
| Links, blue | `.lo-linkbtn`, ink-900, underlined |
| Notification dot, red | `.lo-badge`, ink-900 pill with the count |
| Sun illustration on processing | `.lo-spinner` plus `role="status"` and `aria-live="polite"` |
| Hotel photograph | Neutral `.lo-media` block. See open question 4. |

Radius descent holds throughout: dialog 16, cards inside it 12, fee rows 8,
severity tracks 4, buttons pill.

## 4. Divergences from the source, with reasons

1. **"Cancelation" and "canceling"** corrected to UK spelling in two headings
   and one body paragraph. A misspelling in a stimulus makes participants
   critique the prototype instead of the design.
2. **`{{Contact-center-phone}}`** shipped unresolved in the source. Substituted
   with 01 693 7700, the number the source's own footer shows.
3. **"VISA400000XXXXXX1083"** changed to "Visa card ending 1083". A
   card-number-shaped string is a data-hygiene smell in a test artefact, and
   "ending 1083" is what a participant actually recognises.
4. **Confirmation email address.** The source shows `j.smith@gmail.com` on the
   success screen but `john.smith@gmail.com` in the passenger record. Used the
   passenger record on both. A participant who spots the mismatch will spend
   the rest of the session on it.
5. **The close control is removed from the post-commit processing screen.** The
   source offers a close X on a screen whose copy says not to close the window,
   after an irreversible commit. Both the framework convention and the copy say
   there should be no way out here. **This is a design decision, not a
   conversion detail. Flagging for confirmation.**
6. **De-branded content.** "TUI BLUE Flamingo Beach" to "Flamingo Beach";
   carrier name dropped, flight numbers kept; logo, trust marks and company
   registration boilerplate removed; financial protection wording kept,
   condensed, in a disclosure.
7. **Status suffix punctuation.** The shipped `lofi.css` appends a CSS-escaped
   em dash, which swallows the following space and renders as "undone -Important",
   and the MMB convention bans em dashes on prototype surfaces. Overridden to a
   comma in the added section. Worth fixing upstream in the skill.
8. **Landing focus ring suppressed on the screen heading.** The programmatic
   focus painted a 2px ink-900 rectangle, which in this system means "selected".
   One shade with two meanings makes both unreadable. The heading is
   `tabindex="-1"` so the ring can only come from the landing focus, which
   screen readers announce without it being drawn.

## 5. Open questions for the research lead

1. **The breakdown labels contradict the quote screen.** Step 3 says "Today's
   cost of cancellation: 400.00 your deposit". Step 4 then lists "Cancellation
   fee today 0.00". The arithmetic is right (deposit lost, plus fee above
   deposit, plus extras), but nothing on the line says "deducted", and a
   participant can reasonably read 0.00 as "cancelling costs me nothing".
   Reproduced verbatim because it may be exactly what the study is for. If it
   is not, the fix is to label the lines as deductions and show the deposit as
   the charge. **Needs a decision before fielding.**
2. **"Amend your booking" appears on the confirm screen.** A previous MMB study
   banned "amend" on cancellation surfaces. No banned-terms list was supplied
   for this build. Confirm whether it still applies.
3. **The analytics event list is prototype-defined**, since no brief was
   supplied: `cancel_entry_opened`, `cancel_quote_viewed`, `cancel_quote_continue`,
   `cancel_quote_keep`, `cancel_confirm_viewed`, `cancel_ack_ticked`,
   `cancel_submitted`, `cancel_confirm_keep`, `cancel_completed`,
   `cancel_failed`, `cancel_back_to_account`. Replace with the approved list.
4. **The hotel photograph.** Currently a neutral block. If whether the photo
   makes people hesitate is in scope, supply a real image; it goes in
   desaturated. Removing an image that carried decision weight changes the
   finding.
5. **"7 to 14 business days"** and the 14-day invoice promise are reproduced
   from the source. Confirm the backstage process can keep both. Past MMB
   studies banned refund timeframes that fulfilment could not meet.

## 6. Validation evidence

- `scripts/audit.sh` **exits clean**: no chromatic colour, all radii and
  spacing on scale, no external requests, no CDN, `sessionStorage` only, every
  screen scaffolded, copy clean, images and icon buttons labelled.
- Two failures were found and fixed rather than waived: an off-scale 7px
  padding used to compensate for a selection border, replaced by a
  colour-swapped 2px border so geometry never shifts; and the masked card
  string, which was a genuine finding, not a false positive.
- Fee and date maths recomputed at 13 points across the schedule; every screen
  agrees at every point.
- All eight pages rendered headless at 393px with **zero console errors**.
- Grayscale integrity: no image assets, no emoji, no `accent-color` default
  reaching a control, audit reports zero chroma.

### Still outstanding

- The three hierarchy questions in section C of the QA checklist, which need a
  colleague who has not seen the source.
- Keyboard-only completion end to end, and 200% zoom, on the machine the
  moderator will actually use.
- A pass in the moderator's real browser, from `file://`, with wifi off.

---

## 7. The Figma mirror

Built into `figma.com/design/6IXjgx7aQ8ow9sIjoVfBEf`, page **MMB cancellation,
lo-fi grayscale**, section **Flow 1, paid in full, lo-fi grayscale**. Six
frames matching the six coded screens, plus a legend panel recording the
colour substitutions.

### It is a token mirror, not a pixel trace

The file was empty, so the system was built first and the screens from it:

- **Variable collection `LoFi tokens`**, 26 variables: the ink ramp
  (900/700/600/500/400), surfaces (surface, canvas, fill/100, fill/200,
  line/100, line/200, inverse), the radius scale (hero 40, lg 16, md 12,
  sm 8, xs 4, pill 999) and the 8pt spacing scale with its 12 half-step.
  Scopes are set explicitly per variable rather than left at ALL_SCOPES.
- **Seven text styles** for the type ramp at 23/18/16/14/13/11, line height
  130% throughout, three weights only.
- Every fill, corner radius, padding and gap on every screen is **bound to a
  variable**, so retuning a token restyles all six frames at once and the
  Figma file and the CSS cannot drift apart silently.

### One judgement call worth recording

The linked file `LhQvVEQbYA1fjDMvjKqtDL` node `25-608` is a sticky note holding
the skill download link, not a component library. The real content is section
`0:227`, which is the **TUI Unify source** the tokens were extracted from in
the first place, and its components are branded.

Importing those components would have reintroduced exactly the brand read this
stimulus exists to remove. So the grayscale components were built fresh from
the documented token set, which is itself the extraction of that file. The
provenance chain is intact; the brand is not.

### Divergences from the coded prototype, and why

- Icons are omitted. The system specifies 1.5px stroke line icons; drawing the
  full set as vectors adds no research value at this fidelity, and their
  absence does not change what a participant reads. Labels carry every meaning.
- The processing spinner is a static ring, since Figma frames do not animate.
- Disclosures render collapsed, matching their default state.
- The hero photograph is a `fill/100` block with the 40px bottom radius, as in
  the coded version.
