# Data Format Reference

The Volunteer Scheduler stores and exports data as JSON. This document describes the schema.

---

## Export Format (version 4)

When you click **💾 Export**, you get a file like `volunteer-config-2025-04-01.json`:

```json
{
  "version": 4,
  "roles": [...],
  "events": [...],
  "dayEvents": {...},
  "dayOrder": {...},
  "volunteers": [...]
}
```

> **Note:** The published schedule (`sched`) is intentionally excluded from exports — it is session-specific. Exports are for re-using your team configuration each month.

---

## Roles

```json
"roles": [
  {
    "id": "OBS",
    "name": "OBS",
    "color": "obs"
  },
  {
    "id": "AV",
    "name": "AV",
    "color": "teal"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier — same as `name` (uppercased) |
| `name` | string | Display name |
| `color` | string | One of: `obs`, `pre`, `set`, `flex`, `coral`, `pink`, `teal`, `amber` |

---

## Events

```json
"events": [
  {
    "id": "ev_1712345678",
    "name": "Sunday Service",
    "color": "#2D5A3D",
    "dows": [0],
    "slots": {
      "OBS": 2,
      "AV": 1
    }
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (prefixed `ev_`) |
| `name` | string | Display name |
| `color` | string | Hex color for the event header |
| `dows` | number[] | Days of week (0=Sun, 1=Mon, … 6=Sat) |
| `slots` | object | Map of `roleId → slotCount` |

---

## Day Events

One-off events tied to a specific date (not recurring by day-of-week):

```json
"dayEvents": {
  "2025-3-20": [
    {
      "id": "de_1712345679",
      "name": "Easter Service",
      "color": "#0F6E56",
      "slots": {
        "OBS": 3,
        "AV": 2
      }
    }
  ]
}
```

Keys are formatted as `year-month-day` (month is 0-indexed, matching JavaScript's `Date`).

---

## Day Order

Stores the display order of events within a given day (user can reorder by dragging):

```json
"dayOrder": {
  "2025-3-20": ["ev_1712345678", "de_1712345679"]
}
```

---

## Volunteers

```json
"volunteers": [
  {
    "id": 1712345680000,
    "name": "Jane Smith",
    "role": "OBS",
    "extra": ["AV"]
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | number | Timestamp-based unique ID |
| `name` | string | Display name |
| `role` | string | Primary role ID |
| `extra` | string[] | Secondary role IDs |

---

## Schedule (localStorage only)

The published schedule is stored in `localStorage` under `vsched_v4` but not included in exports. Its structure:

```json
"sched": {
  "2025-3-2": {
    "ev_1712345678": {
      "OBS": [1712345680000, 1712345681000],
      "AV": [1712345682000]
    }
  }
}
```

Keys: `year-month-day` → `eventId` → `roleId` → `[volunteerId, ...]`

---

## localStorage Key

All data is persisted under `vsched_v4`. To clear all data programmatically:

```javascript
localStorage.removeItem('vsched_v4');
```
