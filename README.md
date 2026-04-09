# 📋 Volunteer Scheduler

A fully client-side, zero-dependency volunteer scheduling web application. Built with vanilla HTML, CSS, and JavaScript — no backend, no build step, no frameworks.

> **Live Demo:** [Deploy to GitHub Pages in 2 steps](#deploying-to-github-pages)

---

## ✨ Features

- **Role Management** — Create and color-code roles shared across all events
- **Volunteer Roster** — Track volunteers with primary and secondary roles; see assignment counts
- **Recurring Events** — Define weekly events by day-of-week with per-role slot requirements
- **One-Off Events** — Add special events to specific calendar days
- **Drag-and-Drop Scheduling** — Drag volunteers from a sidebar pool onto calendar role slots
- **Event Reordering** — Drag event blocks within a day to reorder them
- **Calendar & List Views** — Toggle between a full monthly calendar and a clean day-by-day list
- **Swap Modal** — Click any assigned name to replace them with another eligible volunteer
- **Print / PDF Export** — Print-optimized layout with calendar and list views
- **JPG Export** — Export the calendar as a 1080×1920 image for sharing
- **JSON Import / Export** — Portable config format for sharing and month-to-month reuse
- **Auto-Save** — All data persists to `localStorage` automatically
- **Custom Day Labels** — Add labels like "Easter Sunday" to specific dates
- **Responsive** — Works on mobile and desktop

---

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/volunteer-scheduler.git
cd volunteer-scheduler
open index.html   # no server needed
```

Or serve locally:
```bash
python -m http.server 8080
# then visit http://localhost:8080
```

---

## 📁 Project Structure

```
volunteer-scheduler/
│
├── index.html              # App shell — loads all partials & scripts
│
├── css/
│   └── styles.css          # All styles: variables, layout, components
│
├── js/
│   ├── state.js            # Global state (S{}), constants (RC, EVT_PAL, D7)
│   ├── utils.js            # Pure helpers: rc(), ini(), dkey(), showToast()
│   ├── storage.js          # localStorage: autosave, loadSaved, import/export JSON
│   ├── roles.js            # Role CRUD: renderRoleList, openRoleModal, saveRole
│   ├── volunteers.js       # Volunteer CRUD: renderVolunteers, openVolModal, saveVol
│   ├── events.js           # Event CRUD: renderEventsTab, openEvtModal, saveEvt
│   ├── setup.js            # Setup tab: mini-cal, drag-assign, publish
│   ├── schedule.js         # Schedule tab: calendar/list views, swap modal
│   ├── export.js           # Print/PDF popup, JPG export via html2canvas
│   └── app.js              # Bootstrap: go(), renderAll(), window.onload ← loads last
│
├── partials/               # Reference HTML fragments (mirrored in index.html)
│   ├── tab-volunteers.html
│   ├── tab-events.html
│   ├── tab-setup.html
│   ├── tab-schedule.html
│   └── modals-shared.html
│
├── docs/
│   ├── USAGE.md            # Step-by-step user guide
│   └── DATA_FORMAT.md      # JSON schema reference
│
├── README.md
├── CHANGELOG.md
└── LICENSE
```

### JavaScript Load Order

Scripts must load in this order (enforced in `index.html`):

| # | File | Provides |
|---|---|---|
| 1 | `state.js` | `S`, `EVT_PAL`, `RC`, `RCK`, `D7`, `DF` |
| 2 | `utils.js` | `rc()`, `ini()`, `pName()`, `getRole()`, `dkey()`, `computeDays()`, `getEvForKey()`, `showToast()`, `closeMo()`, color swatch helpers |
| 3 | `storage.js` | `autosave()`, `loadSaved()`, `clearAll()`, `exportJSON()`, `importJSON()` |
| 4 | `roles.js` | `renderRoleList()`, `openRoleModal()`, `saveRole()`, `deleteRole()` |
| 5 | `volunteers.js` | `syncVolSels()`, `renderVolTab()`, `renderVolunteers()`, `openVolModal()`, `saveVol()`, `deleteVol()` |
| 6 | `events.js` | `renderEventsTab()`, `openEvtModal()`, `saveEvt()`, `openDayEvtModal()`, `saveDayEvt()` |
| 7 | `setup.js` | `renderSetup()`, `renderMiniCal()`, `renderSetupCal()`, `renderPool()`, drag handlers, `publish()` |
| 8 | `schedule.js` | `renderSched()`, `renderCalView()`, `renderListView()`, `openSwapModal()`, `applySwap()`, `openTitleModal()` |
| 9 | `export.js` | `printSched()`, `exportCalJpg()` |
| 10 | `app.js` | `go()`, `renderAll()`, `window.onload` |

---

## 🗺️ How to Use

1. **Create Roles** → Volunteers & Roles tab → + Add Role
2. **Add Volunteers** → same tab → + Add Volunteer (assign primary + secondary roles)
3. **Create Events** → Events tab → + Add Event (set day-of-week + role slot counts)
4. **Set Up the Month** → Setup tab → pick days → drag volunteers onto slots
5. **Publish** → click 📤 Publish to stamp the final schedule
6. **Share** → 🖨 Print for PDF · 📷 JPG for image · 💾 Export for JSON backup

See [`docs/USAGE.md`](docs/USAGE.md) for the full step-by-step guide.

---

## 🚢 Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → Deploy from branch → `main` / `root`**
3. Your app will be live at `https://YOUR_USERNAME.github.io/volunteer-scheduler`

---

## 🛠️ Technical Details

| Concern | Implementation |
|---|---|
| Framework | None — vanilla JS (ES2020) |
| Styling | Pure CSS with custom properties |
| Fonts | Google Fonts (DM Sans + DM Serif Display) |
| Storage | `localStorage` (key: `vsched_v4`) |
| Build step | None — open `index.html` directly |
| Runtime dependencies | Zero |
| Optional CDN dep | `html2canvas` (lazy-loaded only for JPG export) |
| Browser support | All modern browsers |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes — each JS concern has its own file
4. Open a pull request with a clear description

---

## 📄 License

MIT — see [`LICENSE`](LICENSE)
