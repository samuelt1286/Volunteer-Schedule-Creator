/* ═══════════════════════════════════════════════════
   state.js — Application State & Constants
   Single source of truth for all data.
   ═══════════════════════════════════════════════════

   Data shape:
     S.roles      = [{ id, name, color }]
     S.events     = [{ id, name, color, dows, slots: { roleId: count } }]
     S.dayEvents  = { dkey: [{ id, name, color, slots: { roleId: count } }] }
     S.volunteers = [{ id, name, role, extra: [roleId] }]
     S.sched      = { dkey: { evId: { roleId: [volId] } } }
*/

const S = {
  year:      new Date().getFullYear(),
  month:     new Date().getMonth(),
  days:      [],
  roles:     [],
  events:    [],
  dayEvents: {},
  dayOrder:  {},
  volunteers:[],
  sched:     null,
  view:      'cal',
  title:     '',
  subtitle:  '',
  dayLabels: {}
};

/** Event color palette */
const EVT_PAL = [
  { h: '#2D5A3D' }, { h: '#1A3A5C' }, { h: '#7A2000' }, { h: '#4A2570' },
  { h: '#0F6E56' }, { h: '#4A5568' }, { h: '#92600A' }, { h: '#6B2142' },
  { h: '#1E3A6E' }, { h: '#3D1A00' },
];

/** Role color themes: bg / border / text */
const RC = {
  obs:  { bg: '#EEF4FA', bd: '#b8d4ed', tx: '#1A3A5C' },
  pre:  { bg: '#EAF2EC', bd: '#b8d9c2', tx: '#2D5A3D' },
  set:  { bg: '#FEF9EC', bd: '#e8d48c', tx: '#B8860B' },
  flex: { bg: '#F3EEF9', bd: '#c8b0e0', tx: '#4A2570' },
  coral:{ bg: '#FAECE7', bd: '#f0b098', tx: '#8B2500' },
  pink: { bg: '#FBEAF0', bd: '#f0b0c8', tx: '#7A1A3A' },
  teal: { bg: '#E1F5EE', bd: '#9FE1CB', tx: '#0F6E56' },
  amber:{ bg: '#FEF9EC', bd: '#FAC775', tx: '#92600A' },
};

const RCK = Object.keys(RC);
const D7  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DF  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
