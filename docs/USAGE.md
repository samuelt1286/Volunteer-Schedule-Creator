# 📋 Volunteer Scheduler — User Guide

This guide walks through every feature of the Volunteer Scheduler from first open to printing a finished schedule.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Step 1 — Roles](#step-1--roles)
3. [Step 2 — Volunteers](#step-2--volunteers)
4. [Step 3 — Events](#step-3--events)
5. [Step 4 — Setup (Draft)](#step-4--setup-draft)
6. [Step 5 — Schedule (Published)](#step-5--schedule-published)
7. [Exporting & Sharing](#exporting--sharing)
8. [Data Import / Export](#data-import--export)
9. [Tips & Tricks](#tips--tricks)

---

## Quick Start

1. Open `index.html` in any modern browser
2. Create at least one **Role** in the Volunteers & Roles tab
3. Add **Volunteers** and assign them to roles
4. Create at least one **Event** in the Events tab
5. Go to **Setup**, pick a month, select your service days, drag volunteers onto slots
6. Click **📤 Publish** — your finalized schedule appears in the Schedule tab
7. **Print** or **Export JPG** to share

---

## Step 1 — Roles

Navigate to **👥 Volunteers & Roles** and click **+ Add Role**.

| Field | Description |
|---|---|
| **Role Name** | A short label (e.g. `OBS`, `AV`, `USHER`, `GREETER`). Automatically uppercased. |
| **Color** | Choose a color scheme — used throughout the app to distinguish roles at a glance. |

**Key points:**
- Roles are **global** — they are shared across all events. Create all roles before building events.
- Renaming a role updates it everywhere automatically (events, volunteers, schedule).
- Deleting a role removes it from all events and volunteers.

**Available colors:** `obs` (blue), `pre` (green), `set` (yellow), `flex` (purple), `coral` (orange-red), `pink`, `teal`, `amber`

---

## Step 2 — Volunteers

In the same tab, click **+ Add Volunteer**.

| Field | Description |
|---|---|
| **Name** | Full name or initials |
| **Primary Role** | The role this person is primarily assigned to |
| **Also Available For** | Optional secondary roles — used when scheduling and swapping |

**Volunteer stats:** The Volunteers tab shows how many times each person has been assigned in the published schedule, helping you distribute duties fairly.

---

## Step 3 — Events

Navigate to **📌 Events** and click **+ Add Event**.

| Field | Description |
|---|---|
| **Event Name** | e.g. "Sunday Service", "Wednesday Prayer", "Youth Night" |
| **Color** | The event's color on the calendar |
| **Occurs on** | Check the day(s) of week this event recurs |
| **Roles needed** | Click roles to add them, then set the slot count (how many volunteers needed per role) |

Events appear automatically on all matching days-of-week in Setup.

**One-off events:** You can also add events to specific individual dates from the Setup tab using the **+ evt** button on any day card.

---

## Step 4 — Setup (Draft)

Navigate to **⚙️ Setup**. This is where you build your draft schedule.

### Picking Your Month

Use the **‹ ›** arrows to navigate months.

### Selecting Service Days

Click individual days in the mini calendar to toggle them. Or use the quick-select buttons:
- **All Sundays / Wednesdays / Fridays / Saturdays**
- **Clear** — removes all selected days

Days that have events (based on day-of-week) are shown automatically on the calendar below.

### Assigning Volunteers

The **volunteer pool** on the left shows all volunteers grouped by role.

To assign a volunteer to a slot: **drag** their chip from the pool and **drop** it onto a role slot in the calendar. Slots show `+ drop` when empty.

- Slots have a maximum count based on the event's role settings
- Duplicate assignments are prevented
- Click **×** on a name to remove them from a slot
- Click a name to open the **Swap Modal** to replace them

### Reordering Events

Within a day, drag the **⠿ handle** on any event to reorder them. This order is preserved in the Schedule tab and print view.

### Adding Day-Specific Events

Click **+ evt** on any day card to add a one-time event (not recurring) to that specific date.

---

## Step 5 — Schedule (Published)

Click **📤 Publish to Schedule** (from Setup or the top bar) to finalize.

The **📅 Schedule** tab shows your published schedule. You can still:
- Drag volunteers from the sidebar pool to fill empty slots
- Click a name to swap them
- Click **×** to remove an assignment
- Toggle between **🗓 Calendar** and **☰ List** views
- Click **↺ Re-publish** to re-sync (picks up any new assignments from Setup)

---

## Exporting & Sharing

### 🖨 Print / PDF

Click **🖨 Print** in the Schedule tab. A print-ready window opens with:
- A calendar view and a list view (toggle between them)
- A **Print / Save PDF** button (uses the browser's built-in print dialog)
- Landscape orientation, color-accurate printing

### 📷 JPG Export

Click **📷 JPG** to generate a 1080×1920 image of the calendar — great for posting to group chats or social media. Requires an internet connection (loads `html2canvas` from CDN).

---

## Data Import / Export

### 💾 Export JSON

Saves your **configuration** (roles, volunteers, events) as a `.json` file. The schedule itself is not exported — only the setup data, which you can re-use for the next month.

### 📂 Import JSON

Load a previously exported file. You'll be prompted to **Merge** (keep existing data and add new) or **Replace** (overwrite everything).

### ✏️ Title & Settings

Click **✏️ Title** in the header to set:
- A schedule title (appears on Setup and Schedule tabs, and in the print header)
- A subtitle/organization name
- Custom day labels (e.g. "Easter Sunday", "Holiday") for specific dates

---

## Tips & Tricks

- **Build roles first.** Everything else depends on roles existing.
- **Use color consistently.** Assign the same color scheme to a role everywhere for visual clarity.
- **Secondary roles matter.** Volunteers with secondary roles appear as "eligible" in the Swap Modal, giving you more flexibility.
- **Re-use configs.** Export your volunteers and events JSON after each month — import it next month and just re-pick your dates.
- **Keyboard shortcuts:** `Escape` or clicking outside a modal closes it.
- **Clear vs. Re-publish:** Clicking Re-publish preserves existing assignments and only adds/removes slots that changed. Use it if you edit events after publishing.
- **Data is auto-saved.** Every change is saved to `localStorage` immediately. No save button needed.
