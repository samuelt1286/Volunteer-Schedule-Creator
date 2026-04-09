/* ═══════════════════════════════════════════════════
   schedule.js — Schedule Tab: Calendar View, List View,
                 Swap Modal, Title Settings
   ═══════════════════════════════════════════════════ */

// ── Schedule Tab ─────────────────────────────────────

function setView(v) {
  S.view = v;
  document.querySelectorAll('#panel-schedule .vb').forEach((b, i) =>
    b.classList.toggle('on', ['cal', 'list'][i] === v)
  );
  document.getElementById('calView').style.display  = v === 'cal'  ? '' : 'none';
  document.getElementById('listView').style.display = v === 'list' ? '' : 'none';
}

function renderSched() {
  const ti   = document.getElementById('sTitle');
  const me   = document.getElementById('sMeta');
  const days = computeDays();

  if (ti) ti.textContent = S.title || 'Schedule';

  if (!S.sched || !Object.keys(S.sched).length) {
    document.getElementById('schedEmpty').style.display   = '';
    document.getElementById('schedContent').style.display = 'none';
    return;
  }

  document.getElementById('schedEmpty').style.display   = 'none';
  document.getElementById('schedContent').style.display = '';

  const tot = Object.values(S.sched).reduce((a, d) =>
    a + Object.values(d).reduce((b, e) =>
      b + Object.values(e).reduce((c, r) => c + r.length, 0), 0), 0);

  if (me) me.textContent = `${days.length} service days · ${tot} total assignments · ${S.subtitle || ''}`;

  renderSchedPool();
  renderCalView();
  renderListView();
  setView(S.view);
}

// ── Calendar View ─────────────────────────────────────

function renderCalView() {
  const { year, month, sched } = S;
  const days = computeDays();
  const d1   = new Date(year, month, 1).getDay();
  const tot  = new Date(year, month + 1, 0).getDate();
  const aSet = new Set(days);

  let h = `<div class="cg">${D7.map(d => `<div class="ch">${d.toUpperCase()}</div>`).join('')}`;

  for (let i = 0; i < d1; i++) h += `<div class="cc emp"></div>`;

  for (let d = 1; d <= tot; d++) {
    const key = dkey(year, month, d);
    const ds  = sched[key];

    h += `<div class="cc${aSet.has(d) ? ' act' : ''}">`;
    h += `<div class="cday"><span>${d}</span>${
      S.dayLabels[key]
        ? `<span style="font-size:7px;background:var(--ac);color:#fff;padding:1px 4px;border-radius:8px;">${S.dayLabels[key]}</span>`
        : ''
    }</div>`;

    if (ds) {
      const evOrder   = S.dayOrder[key] || [];
      const evEntries = Object.entries(ds);
      const ordered   = [
        ...evOrder.map(id => evEntries.find(([eid]) => eid === id)).filter(Boolean),
        ...evEntries.filter(([eid]) => !evOrder.includes(eid))
      ];

      ordered.forEach(([evId, evData]) => {
        const ev     = getEvForKey(key, evId); if (!ev) return;
        const hasAny = Object.values(evData).some(a => a.length > 0); if (!hasAny) return;

        h += `<div class="cevt" data-key="${key}" data-evid="${evId}">
          <div class="cevt-hd" style="background:${ev.color};">${ev.name}</div>`;

        Object.entries(evData).forEach(([rid, arr]) => {
          if (!arr.length) return;
          const r  = getRole(rid); const cr = rc(r.color);
          h += `<div class="cevt-role" style="background:${cr.bg};">
            <div class="cevt-rlbl" style="color:${cr.tx};">${r.name}</div>`;
          arr.forEach(pid => {
            h += `<div class="slot-item">
              <span class="slot-nm" style="color:${cr.tx};" onclick="openSwapModal('${key}','${evId}','${rid}',${pid})">${pName(pid)}</span>
              <span class="slot-rm" onclick="schedRemove('${key}','${evId}','${rid}',${pid})">×</span>
            </div>`;
          });
          const ev2  = getEvForKey(key, evId);
          const cnt  = ev2?.slots?.[rid] || 0;
          [...Array(Math.max(0, cnt - arr.length))].forEach(() => {
            h += `<div class="slot-drop"
              ondragover="event.preventDefault();this.classList.add('dov')"
              ondragleave="this.classList.remove('dov')"
              ondrop="onSchedSlotDrop(event,'${key}','${evId}','${rid}');this.classList.remove('dov')"
              onclick="openSwapModal('${key}','${evId}','${rid}',null)">+ drop</div>`;
          });
          h += `</div>`;
        });
        h += `</div>`;
      });
    }
    h += `</div>`;
  }

  let cols = (d1 + tot) % 7;
  if (cols > 0) for (let i = cols; i < 7; i++) h += `<div class="cc emp"></div>`;
  h += `</div>`;
  document.getElementById('calView').innerHTML = h;
}

// ── List View ─────────────────────────────────────────

function renderListView() {
  const { year, month, sched } = S;
  const days = computeDays();
  if (!days.length) { document.getElementById('listView').innerHTML = ''; return; }

  document.getElementById('listView').innerHTML = days.map(day => {
    const key     = dkey(year, month, day);
    const ds      = sched?.[key];
    const date    = new Date(year, month, day);
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const dateStr = date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    const label   = S.dayLabels[key]
      ? `<span style="font-size:9px;background:var(--ac);color:#fff;padding:1px 6px;border-radius:10px;margin-left:6px;">${S.dayLabels[key]}</span>`
      : '';

    let evHtml = '';
    if (ds) {
      const evOrder   = S.dayOrder[key] || [];
      const evEntries = Object.entries(ds);
      const ordered   = [
        ...evOrder.map(id => evEntries.find(([eid]) => eid === id)).filter(Boolean),
        ...evEntries.filter(([eid]) => !evOrder.includes(eid))
      ];

      ordered.forEach(([evId, evData]) => {
        const ev = getEvForKey(key, evId); if (!ev) return;
        evHtml += `<div class="ld-ev">
          <div class="ld-ev-n" style="color:${ev.color};">● ${ev.name}</div>`;

        Object.entries(evData).forEach(([rid, arr]) => {
          const r = getRole(rid); const c = rc(r.color);
          arr.forEach(pid => {
            evHtml += `<div class="ls"
                ondragover="event.preventDefault();this.classList.add('dov')"
                ondragleave="this.classList.remove('dov')"
                ondrop="onSchedSlotDrop(event,'${key}','${evId}','${rid}');this.classList.remove('dov')">
              <span class="ls-role" style="color:${c.tx};background:${c.bg};padding:1px 5px;border-radius:10px;border:1px solid ${c.bd};">${r.name}</span>
              <span class="ls-nm">${pName(pid)}</span>
              <div class="ls-act">
                <button class="btn sm" onclick="openSwapModal('${key}','${evId}','${rid}',${pid})">↔ Swap</button>
                <button class="btn sm dan" onclick="schedRemove('${key}','${evId}','${rid}',${pid})">×</button>
              </div>
            </div>`;
          });

          const ev2 = getEvForKey(key, evId);
          const cnt = ev2?.slots?.[rid] || 0;
          [...Array(Math.max(0, cnt - arr.length))].forEach(() => {
            evHtml += `<div class="ls-add"
                ondragover="event.preventDefault();this.classList.add('dov')"
                ondragleave="this.classList.remove('dov')"
                ondrop="onSchedSlotDrop(event,'${key}','${evId}','${rid}');this.classList.remove('dov')"
                onclick="openSwapModal('${key}','${evId}','${rid}',null)">
              <span style="color:${c.tx};background:${c.bg};padding:1px 5px;border-radius:10px;border:1px solid ${c.bd};font-size:10px;">${r.name}</span>
              — empty slot (drag or click)
            </div>`;
          });
        });
        evHtml += `</div>`;
      });
    }

    return `<div class="ld">
      <div class="ld-h"><span class="ld-n">${dayName}${label}</span><span class="ld-d">${dateStr}</span></div>
      ${evHtml || '<div style="padding:8px 12px;font-size:11px;color:var(--tx3);">No assignments yet.</div>'}
    </div>`;
  }).join('');
}

// ── Schedule Drag & Remove ────────────────────────────

function schedRemove(key, evId, rid, vid) {
  if (!S.sched?.[key]?.[evId]) return;
  S.sched[key][evId][rid] = (S.sched[key][evId][rid] || []).filter(x => x !== vid);
  autosave(); renderSched();
}

function onSchedSlotDrop(e, key, evId, rid) {
  const vid = +e.dataTransfer.getData('volId'); if (!vid) return;
  if (!S.sched[key])        S.sched[key] = {};
  if (!S.sched[key][evId])  S.sched[key][evId] = {};
  if (!S.sched[key][evId][rid]) S.sched[key][evId][rid] = [];
  const arr = S.sched[key][evId][rid];
  const ev  = getEvForKey(key, evId);
  const cnt = ev?.slots?.[rid] || 1;
  if (!arr.includes(vid) && arr.length < cnt) arr.push(vid);
  autosave(); renderSched();
}

// ── Swap Modal ────────────────────────────────────────

let swapCtx = null;

function openSwapModal(key, evId, defaultRid, currentVid) {
  swapCtx  = { key, evId, currentVid };
  const ev = getEvForKey(key, evId); if (!ev) return;
  const date = new Date(...key.split('-').map((v, i) => i === 1 ? +v : +v));

  document.getElementById('swapSub').textContent = `${ev.name} — ${date.toLocaleString('default', { weekday: 'long', month: 'short', day: 'numeric' })}`;

  const sel = document.getElementById('swapRole');
  sel.innerHTML = Object.keys(ev.slots || {}).map(rid => {
    const r = getRole(rid);
    return `<option value="${rid}"${rid === defaultRid ? ' selected' : ''}>${r.name}</option>`;
  }).join('');

  renderSwapPeople();
  document.getElementById('moSwap').style.display = 'flex';
}

function renderSwapPeople() {
  if (!swapCtx) return;
  const { key, evId, currentVid } = swapCtx;
  const rid      = document.getElementById('swapRole').value;
  const ev       = getEvForKey(key, evId);
  const assigned = S.sched?.[key]?.[evId]?.[rid] || [];
  const eligible = S.volunteers.filter(v => v.role === rid || v.extra.includes(rid));

  document.getElementById('swapPeople').innerHTML = eligible.map(v => {
    const isHere = assigned.includes(v.id);
    const isCur  = v.id === currentVid;
    return `<div class="popt${isCur ? ' sel' : ''}" onclick="swapCtx.selectedVid=${v.id};renderSwapPeople()">
      <div style="font-size:13px;font-weight:600;">${v.name}</div>
      <div style="font-size:10px;color:var(--tx2);">${isHere && !isCur ? '⚠ Already assigned' : isCur ? '● Current' : '✓ Available'}</div>
    </div>`;
  }).join('') || '<p style="font-size:12px;color:var(--tx3);">No eligible volunteers for this role.</p>';
}

function applySwap() {
  if (!swapCtx?.selectedVid) { closeMo('moSwap'); return; }
  const { key, evId, currentVid, selectedVid } = swapCtx;
  const rid = document.getElementById('swapRole').value;

  if (!S.sched[key])        S.sched[key] = {};
  if (!S.sched[key][evId])  S.sched[key][evId] = {};
  if (!S.sched[key][evId][rid]) S.sched[key][evId][rid] = [];

  const arr = S.sched[key][evId][rid];
  const ev  = getEvForKey(key, evId);
  const cnt = ev?.slots?.[rid] || 1;

  if (currentVid) {
    const i = arr.indexOf(currentVid);
    if (i >= 0) arr.splice(i, 1, selectedVid);
    else if (arr.length < cnt) arr.push(selectedVid);
  } else if (arr.length < cnt && !arr.includes(selectedVid)) {
    arr.push(selectedVid);
  }

  closeMo('moSwap');
  autosave();
  renderSched();
  renderSetupCal();
}

// ── Title / Settings ──────────────────────────────────

function openTitleModal() {
  document.getElementById('schedTitle').value    = S.title    || '';
  document.getElementById('schedSubtitle').value = S.subtitle || '';
  renderDayLabelList();
  document.getElementById('moTitle').style.display = 'flex';
}

function renderDayLabelList() {
  const entries = Object.entries(S.dayLabels || {});
  document.getElementById('dayLabelList').innerHTML = entries.length
    ? entries.map(([key, lbl]) => `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border:1px solid var(--brd);border-radius:6px;margin-bottom:4px;background:var(--sur2);">
        <span style="flex:0 0 80px;font-size:11px;color:var(--tx2);">${key}</span>
        <span style="flex:1;font-size:12px;">${lbl}</span>
        <button class="btn sm dan" onclick="delete S.dayLabels['${key}'];renderDayLabelList()">×</button>
      </div>`).join('')
    : '<p style="font-size:11px;color:var(--tx3);">No labels added.</p>';
}

function addDayLabel() {
  const d = document.getElementById('dlDate').value;
  const l = document.getElementById('dlLabel').value.trim();
  if (!d || !l) return;
  const p   = d.split('-');
  const key = dkey(+p[0], +p[1] - 1, +p[2]);
  if (!S.dayLabels) S.dayLabels = {};
  S.dayLabels[key] = l;
  renderDayLabelList();
}

function saveTitleSettings() {
  S.title    = document.getElementById('schedTitle').value.trim();
  S.subtitle = document.getElementById('schedSubtitle').value.trim();
  closeMo('moTitle');
  autosave();
  renderAll();
}
