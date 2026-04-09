/* ═══════════════════════════════════════════════════
   storage.js — localStorage Persistence
   Key: 'vsched_v4'
   ═══════════════════════════════════════════════════ */

const LS = 'vsched_v4';

/** Save all state to localStorage and flash the save indicator */
function autosave() {
  const el = document.getElementById('saveInd');
  if (el) {
    el.style.opacity = '1';
    clearTimeout(el._h);
    el._h = setTimeout(() => el.style.opacity = '0', 1800);
  }
  try {
    localStorage.setItem(LS, JSON.stringify({
      year:      S.year,
      month:     S.month,
      days:      S.days,
      roles:     S.roles,
      events:    S.events,
      dayEvents: S.dayEvents,
      dayOrder:  S.dayOrder,
      volunteers:S.volunteers,
      sched:     S.sched,
      title:     S.title,
      subtitle:  S.subtitle,
      dayLabels: S.dayLabels
    }));
  } catch (e) {}
}

/** Restore all state from localStorage on page load */
function loadSaved() {
  try {
    const d = JSON.parse(localStorage.getItem(LS) || 'null');
    if (!d) return;
    [
      'year','month','days','roles','events','dayEvents',
      'dayOrder','volunteers','sched','title','subtitle','dayLabels'
    ].forEach(k => { if (d[k] != null) S[k] = d[k]; });
    showToast('✓ Data restored');
  } catch (e) {}
}

/** Wipe all data after confirmation */
function clearAll() {
  if (!confirm('Clear all data?')) return;
  try { localStorage.removeItem(LS); } catch (e) {}
  Object.assign(S, {
    roles: [], events: [], dayEvents: {}, dayOrder: {},
    volunteers: [], days: [], sched: null,
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    title: '', subtitle: '', dayLabels: {}
  });
  renderAll();
  showToast('✓ Cleared');
}

/** Export team config (roles, events, volunteers) as a downloadable JSON file */
function exportJSON() {
  const d = {
    version:   4,
    roles:     S.roles,
    events:    S.events,
    dayEvents: S.dayEvents,
    dayOrder:  S.dayOrder,
    volunteers:S.volunteers
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
  a.download = `volunteer-config-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('💾 Exported');
}

/** Import a JSON config file, with merge-or-replace prompt */
function importJSON(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      const merge = S.volunteers.length > 0 && confirm('Merge with existing?\nCancel = Replace all');
      if (merge) {
        (d.roles     || []).forEach(x => { if (!S.roles.find(r => r.id === x.id))     S.roles.push(x); });
        (d.events    || []).forEach(x => { if (!S.events.find(r => r.id === x.id))    S.events.push(x); });
        if (d.dayEvents) Object.keys(d.dayEvents).forEach(k => { if (!S.dayEvents[k]) S.dayEvents[k] = d.dayEvents[k]; });
        if (d.dayOrder)  Object.keys(d.dayOrder).forEach(k  => { if (!S.dayOrder[k])  S.dayOrder[k]  = d.dayOrder[k]; });
        (d.volunteers || []).forEach(x => {
          if (!S.volunteers.find(v => v.name.toLowerCase() === x.name.toLowerCase()))
            S.volunteers.push({ ...x, id: Date.now() + Math.random() });
        });
      } else {
        if (d.roles)      S.roles      = d.roles;
        if (d.events)     S.events     = d.events;
        if (d.dayEvents)  S.dayEvents  = d.dayEvents;
        if (d.dayOrder)   S.dayOrder   = d.dayOrder;
        if (d.volunteers) S.volunteers = d.volunteers;
      }
      renderAll();
      autosave();
      showToast(`✓ Loaded ${S.volunteers.length} volunteers, ${S.events.length} events`);
    } catch (e) { alert('Invalid file.'); }
    ev.target.value = '';
  };
  r.readAsText(file);
}
