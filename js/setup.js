/* ═══════════════════════════════════════════════════
   setup.js — Setup Tab: Mini Calendar, Volunteer Pool,
              Drag-to-Assign Calendar, Publish
   ═══════════════════════════════════════════════════ */

let dragEvtCtx = null;

// ── Setup Tab Entry ──────────────────────────────────

function renderSetup() {
  const ti = document.getElementById('setupTitle');
  const su = document.getElementById('setupSubtitle');
  if (ti) ti.textContent = S.title || 'Setup';
  if (su) { su.textContent = S.subtitle || ''; su.style.display = S.subtitle ? '' : 'none'; }
  renderMiniCal();
  renderSetupPool();
  renderSetupCal();
}

// ── Month Navigation ─────────────────────────────────

function chMonth(d) {
  S.month += d;
  if (S.month < 0)  { S.month = 11; S.year--; }
  if (S.month > 11) { S.month = 0;  S.year++; }
  autosave();
  renderMiniCal();
  renderSetupCal();
}

/** Quick-select all occurrences of a day-of-week in the current month */
function qs(dow) {
  const tot = new Date(S.year, S.month + 1, 0).getDate();
  for (let d = 1; d <= tot; d++)
    if (new Date(S.year, S.month, d).getDay() === dow && !S.days.includes(d))
      S.days.push(d);
  autosave();
  renderMiniCal();
  renderSetupCal();
}

// ── Mini Calendar ─────────────────────────────────────

function renderMiniCal() {
  const { year, month, days } = S;
  const d1  = new Date(year, month, 1).getDay();
  const tot = new Date(year, month + 1, 0).getDate();

  document.getElementById('mLabel').textContent =
    new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  let h = D7.map(d => `<div class="dh">${d[0]}</div>`).join('');
  for (let i = 0; i < d1; i++) h += `<div class="dc2 empty"></div>`;
  for (let d = 1; d <= tot; d++) {
    h += `<div class="dc2${days.includes(d) ? ' sel' : ''}" onclick="toggleDay(${d})">${d}</div>`;
  }
  document.getElementById('miniCal').innerHTML = h;
}

function toggleDay(d) {
  const i = S.days.indexOf(d);
  if (i >= 0) S.days.splice(i, 1); else S.days.push(d);
  autosave();
  renderMiniCal();
  renderSetupCal();
}

// ── Volunteer Pool ────────────────────────────────────

function renderSetupPool()  { renderPool('setupPool'); }
function renderSchedPool()  { renderPool('schedPool'); }

function renderPool(pid) {
  const el = document.getElementById(pid);
  if (!el) return;

  const groups = {};
  S.volunteers.forEach(v => {
    const k = v.role || 'Other';
    if (!groups[k]) groups[k] = [];
    groups[k].push(v);
  });

  if (!Object.keys(groups).length) {
    el.innerHTML = '<p style="font-size:11px;color:var(--tx3);">No volunteers yet.</p>';
    return;
  }

  el.innerHTML = Object.entries(groups).map(([roleId, vols]) => {
    const r = getRole(roleId); const c = rc(r.color);
    return `<div class="pool-grp">
      <div class="pool-lbl" style="color:${c.tx};">${roleId}</div>
      ${vols.map(v => `<div class="dc" draggable="true"
          style="background:${c.bg};color:${c.tx};border-color:${c.bd};"
          data-vid="${v.id}" data-role="${v.role}"
          ondragstart="onDCDragStart(event)"
          ondragend="onDCDragEnd(event)">
        <span style="font-size:10px;font-weight:800;">${ini(v.name)}</span>${v.name}
      </div>`).join('')}
    </div>`;
  }).join('');
}

function onDCDragStart(e) { e.dataTransfer.setData('volId', e.currentTarget.dataset.vid); e.currentTarget.classList.add('dragging'); }
function onDCDragEnd(e)   { e.currentTarget.classList.remove('dragging'); }

// ── Setup Calendar ────────────────────────────────────

function renderSetupCal() {
  const days = computeDays();
  const { year, month } = S;
  const el = document.getElementById('setupCal');
  if (!el) return;

  if (!days.length) {
    el.innerHTML = '<div class="empty"><div class="big">📅</div><p>Select days in the mini calendar above.</p></div>';
    return;
  }

  el.innerHTML = days.map(day => {
    const key     = dkey(year, month, day);
    const date    = new Date(year, month, day);
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const label   = S.dayLabels[key]
      ? `<span style="font-size:9px;background:var(--ac);color:#fff;padding:1px 5px;border-radius:10px;margin-left:4px;">${S.dayLabels[key]}</span>`
      : '';
    const dow         = date.getDay();
    const evOrder     = S.dayOrder[key] || [];
    const recurringEvs = S.events.filter(e => e.dows.includes(dow));
    const dayEvs      = S.dayEvents[key] || [];
    const allEvs      = [...recurringEvs, ...dayEvs];
    const orderedEvs  = [
      ...evOrder.map(id => allEvs.find(e => e.id === id)).filter(Boolean),
      ...allEvs.filter(e => !evOrder.includes(e.id))
    ];

    const evHtml = orderedEvs.map(ev => {
      const slots      = ev.slots || {};
      const slotEntries = Object.entries(slots);
      if (!slotEntries.length) return '';

      const dayData = S.sched?.[key]?.[ev.id] || {};

      const roleRows = slotEntries.map(([rid, cnt]) => {
        const r        = getRole(rid); const c = rc(r.color);
        const assigned = dayData[rid] || [];
        const items    = assigned.map(vid => `<div class="slot-item">
          <span class="slot-nm" style="color:${c.tx};" onclick="openSwapModal('${key}','${ev.id}','${rid}',${vid})">${pName(vid)}</span>
          <span class="slot-rm" onclick="removeAssign('${key}','${ev.id}','${rid}',${vid})">×</span>
        </div>`).join('');
        const drops = [...Array(Math.max(0, cnt - assigned.length))].map(() =>
          `<div class="slot-drop"
            onclick="openSwapModal('${key}','${ev.id}','${rid}',null)"
            ondragover="event.preventDefault();this.classList.add('dov')"
            ondragleave="this.classList.remove('dov')"
            ondrop="onSlotDrop(event,'${key}','${ev.id}','${rid}');this.classList.remove('dov')">+ drop</div>`
        ).join('');
        return `<div class="cevt-role" style="background:${c.bg};">
          <div class="cevt-rlbl" style="color:${c.tx};">${r.name}</div>
          ${items}${drops}
        </div>`;
      }).join('');

      return `<div class="cevt" data-evid="${ev.id}" data-key="${key}" draggable="true"
          ondragstart="onEvtDragStart(event)" ondragend="onEvtDragEnd(event)"
          ondragover="onEvtDragOver(event)"   ondragleave="onEvtDragLeave(event)"
          ondrop="onEvtDrop(event)">
        <div class="cevt-hd" style="background:${ev.color};display:flex;justify-content:space-between;align-items:center;">
          <span class="drag-handle" title="Drag to reorder">⠿</span>
          <span style="flex:1;padding:0 4px;">${ev.name}</span>
        </div>
        ${roleRows}
      </div>`;
    }).join('');

    return `<div class="ld" style="margin-bottom:12px;">
      <div class="ld-h">
        <span class="ld-n">${dayName}</span>
        <div style="display:flex;align-items:center;gap:6px;">
          ${label}
          <span class="ld-d">${date.toLocaleString('default', { month: 'short', day: 'numeric' })}</span>
          <button class="btn sm ghost" onclick="openDayEvtModal('${key}',null)" style="font-size:10px;padding:2px 7px;">+ evt</button>
        </div>
      </div>
      <div style="padding:8px;" ondragover="event.preventDefault()" ondrop="onVolDrop(event,'${key}')">
        ${evHtml || '<p style="font-size:11px;color:var(--tx3);text-align:center;padding:8px 0;">No events — click + evt to add one.</p>'}
      </div>
    </div>`;
  }).join('');
}

// ── Setup Drag Handlers ───────────────────────────────

function removeAssign(key, evId, rid, vid) {
  if (!S.sched?.[key]?.[evId]) return;
  S.sched[key][evId][rid] = (S.sched[key][evId][rid] || []).filter(x => x !== vid);
  autosave(); renderSetupCal();
}

function onSlotDrop(e, key, evId, rid) {
  const vid = +e.dataTransfer.getData('volId'); if (!vid) return;
  if (!S.sched)             S.sched = {};
  if (!S.sched[key])        S.sched[key] = {};
  if (!S.sched[key][evId])  S.sched[key][evId] = {};
  if (!S.sched[key][evId][rid]) S.sched[key][evId][rid] = [];
  const arr = S.sched[key][evId][rid];
  const ev  = getEvForKey(key, evId);
  const cnt = ev?.slots?.[rid] || 1;
  if (!arr.includes(vid) && arr.length < cnt) arr.push(vid);
  autosave(); renderSetupCal();
}

function onVolDrop(e, key) { e.preventDefault(); }

// Event block drag-to-reorder
function onEvtDragStart(e) {
  dragEvtCtx = { evId: e.currentTarget.dataset.evid, key: e.currentTarget.dataset.key };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.setData('text', '');
}
function onEvtDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  dragEvtCtx = null;
  document.querySelectorAll('.evt-dov').forEach(el => el.classList.remove('evt-dov'));
}
function onEvtDragOver(e) {
  if (!dragEvtCtx || dragEvtCtx.key !== e.currentTarget.dataset.key) return;
  e.preventDefault(); e.currentTarget.classList.add('evt-dov');
}
function onEvtDragLeave(e) { e.currentTarget.classList.remove('evt-dov'); }
function onEvtDrop(e) {
  e.stopPropagation(); e.currentTarget.classList.remove('evt-dov');
  if (!dragEvtCtx || dragEvtCtx.key !== e.currentTarget.dataset.key) return;
  const key    = dragEvtCtx.key;
  const fromId = dragEvtCtx.evId;
  const toId   = e.currentTarget.dataset.evid;
  if (fromId === toId) return;

  const dow         = new Date(...key.split('-').map((v, i) => i === 1 ? +v : +v)).getDay();
  const recurringEvs = S.events.filter(ev => ev.dows.includes(dow));
  const dayEvs      = S.dayEvents[key] || [];
  const allEvs      = [...recurringEvs, ...dayEvs];
  if (!S.dayOrder[key]) S.dayOrder[key] = allEvs.map(ev => ev.id);

  const order = S.dayOrder[key];
  const fi = order.indexOf(fromId), ti = order.indexOf(toId);
  if (fi < 0 || ti < 0) return;
  order.splice(fi, 1); order.splice(ti, 0, fromId);
  autosave(); renderSetupCal();
}

// ── Publish ───────────────────────────────────────────

/**
 * Stamp the current Setup draft as the official schedule.
 * Preserves existing volunteer assignments; adds new slots with empty arrays.
 */
function publish() {
  const days = computeDays();
  const { year, month } = S;
  if (!days.length) { showToast('⚠ No days selected in Setup.'); return; }

  const sched = {};
  days.forEach(day => {
    const key  = dkey(year, month, day);
    const dow  = new Date(year, month, day).getDay();
    const recurringEvs = S.events.filter(e => e.dows.includes(dow));
    const dayEvs      = S.dayEvents[key] || [];
    const allEvs      = [...recurringEvs, ...dayEvs];
    if (!allEvs.length) return;

    sched[key] = {};
    allEvs.forEach(ev => {
      sched[key][ev.id] = {};
      Object.keys(ev.slots || {}).forEach(rid => {
        sched[key][ev.id][rid] = S.sched?.[key]?.[ev.id]?.[rid] || [];
      });
    });
  });

  S.sched = sched;
  autosave();
  go('schedule');
  showToast('✓ Schedule published');
}
