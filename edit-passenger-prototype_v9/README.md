# Edit Passenger Details — Mobile Usability Test Prototype

A low-fidelity, clickable prototype of the TUI MMB "Edit Passenger Details" flow for use in **unmoderated mobile usability testing**. Built from the next-version Figma designs (Use to build a usability test, file `U5wxNZut2mZBE9bJmwHmwR`).

## Launch

Open `index.html` in any modern browser. From the moderator landing page, choose:

- **Flow 1 — Lead pax · Free correction** — change within the 3-character limit (e.g. `John` → `Jon`). No fee.
- **Flow 2 — Lead pax · Chargeable name change** — change exceeding the 3-character limit (e.g. `John` → `Jonathan`). £25 per passenger.

The flow path is determined by which entry the moderator launches. The participant's **task brief** drives them to make the right kind of edit for that flow. Live validation runs throughout — character counting, "Unsaved change" tag, and the free→chargeable boundary all respond in real time — but the navigation target stays fixed to the selected flow.

A small **↻ Reset** link is pinned to the bottom-left of every screen. Tap it between participants to clear session state and return to the moderator landing page.

## Suggested task briefs

**Flow 1**
> "You've just realised your first name is spelled `John` on the booking but your passport says `Jon`. Use the booking management page to correct it."

**Flow 2**
> "You've just realised your first name is spelled `John` on the booking but your passport says `Jonathan`. Use the booking management page to update it."

## Flow map

```
Flow 1 (free correction, in-modal success)
   01 Booking confirmation
     └── Log in to myTUI
   02 MMB hub
     └── Edit details (lead passenger card)
   03 Edit modal — entry → modified state (live AMD-PD validation)
     └── Confirm changes FREE
   05 Confirm dialog (changes summary, £0 fee)
     └── Confirm changes FREE
   06 Saving (1.6s spinner)
     └── auto-advance
   07 Success modal (what changed / what next)
     └── Return to my booking
   08 MMB hub — updated passenger name

Flow 2 (chargeable name change, out-of-modal review + pay)
   01 Booking confirmation
   02 MMB hub
   03 Edit modal — entry → modified state (live AMD-PD validation)
     └── Continue
   05 MMB hub UNSAVED (top banner, Review & confirm CTA)
     └── Review & confirm
   06 Review changes (full-page, 30-min hold timer starts)
     └── Confirm changes
   07 Pay page (card form, timer continues)
     └── Pay now
   08 Success page (what changed / what next, £25 fee)
     └── View my booking
```

## What the prototype simulates faithfully

- **Live form validation** per AMD-PD-002, AMD-PD-003, AMD-PD-005:
  - Per-field character-change counter (Levenshtein)
  - "Unsaved change" warning tag on changed fields
  - Per-field validation copy (`X Character(s) changed. Counts as a free name correction` / `Counts as name change`)
  - Dynamic footer alert (free correction info / £25-per-passenger warning)
  - Dynamic primary CTA label (`Close` → `Confirm changes FREE` → `Continue`)
- **Real countdown timers**:
  - Days/hours/mins/secs to departure on MMB hub (ticks every second)
  - 30-minute session-hold timer on Flow 2 review/pay pages — persists across both screens so the participant sees a single continuous countdown
  - 1.6-second saving spinner
- **Name carry-through** — the edited first/surname value flows through the confirm dialog, success summary, derived confirmation email, MMB hub passenger card, and greeting

## What is intentionally omitted

- TUI branding (logo, brand colours, custom typography) — neutral palette and system fonts only
- Fee calculation logic beyond display (always £0 free / £25 charged)
- Real session holds beyond visible countdown
- Login screen content beyond the "Log in to myTUI" link
- Non-primary CTAs and secondary content on screens 01 and 02
- Server interaction, persistence beyond the browser session

## Files

```
index.html                       Moderator landing
assets/
  styles.css                     Single shared stylesheet
  prototype.js                   Validation engine + helpers
flow1/                           Free correction flow (in-modal)
  01-confirmation.html
  02-mmb-entry.html
  03-edit.html                   Combines Figma screens 03 + 04 (live state)
  05-confirm.html
  06-saving.html
  07-success.html
  08-mmb-updated.html
flow2/                           Chargeable name change flow
  01-confirmation.html
  02-mmb-entry.html
  03-edit.html
  05-mmb-unsaved.html
  06-review.html
  07-pay.html
  08-success.html
```

## Running locally

Any static file server works. Easiest:

```bash
cd prototype
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from the file system also works in most browsers, though `sessionStorage` behaves identically.
