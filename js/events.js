/* ═══════════════════════════════════════════════════
   events.js — Recurring & Day-specific Event Management
   ev.slots = { roleId: slotCount }
   ═══════════════════════════════════════════════════ */

let evCtx  = null;
let evSlots = {};   // working copy for the event modal

// ── Events Tab ──────────────────────────────────────

/** Render all recurring and day-specific events in the Events tab */
function renderEventsTab() {
  const el = document.getElementById('evList');
  if (!el) return;

  let html = '';

  if (S.events.length) {
    html += `<div class="sec-hd">Recurring Events</div>`;
    html += S.events.map((ev, i) => {
      const dowStr   = ev.dows.map(d => DF[d]).join(', ') || 'No days set';
      const rolesHtml = Object.entries(ev.slots || {}).map(([rid, cnt]) => {
        const r = getRole(rid); const c = rc(r.color);
        return `<span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};">${r.name} ×${cnt}</span>`;
      }).join(' ');
      return `<div class="ec">
        <div class="ec-h">
          <div style="display:flex;align-items:center;">
            <div class="ec-dot" style="background:${ev.color};"></div>
            <div><div class="ec-n">${ev.name}</div><div class="ec-s">${dowStr}</div></div>
          </div>
          <button class="btn sm ghost" onclick="openEvtModal(${i})">✎ Edit</button>
        </div>
        <div class="ec-b">${rolesHtml || '<span style="color:var(--tx3);font-size:12px;">No roles assigned</span>'}</div>
      </div>`;
    }).join('');
  }

  const dayEntries = Object.entries(S.dayEvents).filter(([, a]) => a?.length);
  if (dayEntries.length) {
    html += `<div class="sec-hd">Specific Day Events</div>`;
    dayEntries.sort((a, b) => {
      const pa = a[0].split('-').map(Number), pb = b[0].split('-').map(Number);
      return new Date(pa[0], pa[1], pa[2]) - new Date(pb[0], pb[1], pb[2]);
    });
    dayEntries.forEach(([key, arr]) => {
      const p       = key.split('-');
      const dateStr = new Date(+p[0], +p[1], +p[2]).toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      arr.forEach((ev, evIdx) => {
        const rolesHtml = Object.entries(ev.slots || {}).map(([rid, cnt]) => {
          const r = getRole(rid); const c = rc(r.color);
          return `<span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};">${r.name} ×${cnt}</span>`;
        }).join(' ');
        html += `<div class="ec">
          <div class="ec-h">
            <div style="display:flex;align-items:center;">
              <div class="ec-dot" style="background:${ev.color};"></div>
              <div><div class="ec-n">${ev.name}</div><div class="ec-s">📅 ${dateStr}</div></div>
            </div>
            <button class="btn sm ghost" onclick="openDayEvtModal('${key}',${evIdx})">✎ Edit</button>
          </div>
          <div class="ec-b">${rolesHtml || '<span style="color:var(--tx3);font-size:12px;">No roles assigned</span>'}</div>
        </div>`;
      });
    });
  }

  if (!html) html = `<div class="empty"><div class="big">📌</div>
    <p>No events yet.<br>Click "+ Add Event" to create a recurring event,<br>or add a day-specific event from the Setup tab.</p>
  </div>`;
  el.innerHTML = html;
}

// ── Shared Role Library (used in both modals) ────────

/** Render the clickable role library inside any event modal */
function renderRoleLibInModal(libId, slotsObj, onToggle) {
  const el = document.getElementById(libId);
  if (!el) return;
  if (!S.roles.length) {
    el.innerHTML = '<span class="rlib-hint">No roles yet — create them in the Volunteers & Roles tab first.</span>';
    return;
  }
  el.innerHTML = `<span class="rlib-hint">Click to add · Click again to remove</span>` +
    S.roles.map(r => {
      const c     = rc(r.color);
      const added = slotsObj[r.id] != null;
      return `<span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};cursor:pointer;
        opacity:${added ? '1' : '.55'};transition:opacity .12s;
        outline:${added ? '2px solid ' + c.bd : 'none'};outline-offset:1px;"
        onclick="${onToggle}('${r.id}')">${added ? '✓ ' : ''} ${r.name}${added ? ' ×' + slotsObj[r.id] : ''}</span>`;
    }).join('');
}

/** Render the editable "Added roles" list below the role library */
function renderEvRolesList(slotsObj, onSlotChange, onRemove) {
  const pairs = Object.entries(slotsObj);
  if (!pairs.length) return '';
  return `<div style="margin-top:8px;">
    <div class="sec-hd" style="margin-top:0;">Added roles</div>
    ${pairs.map(([rid, cnt]) => {
      const r = getRole(rid); const c = rc(r.color);
      return `<div style="display:flex;align-items:center;gap:7px;padding:6px 10px;
          border:1px solid ${c.bd};border-radius:6px;margin-bottom:5px;background:${c.bg};">
        <span style="flex:1;font-weight:600;font-size:13px;color:${c.tx};">${r.name}</span>
        <label style="font-size:11px;color:${c.tx};opacity:.7;margin:0;">slots</label>
        <input type="number" value="${cnt}" min="1" max="20"
          style="width:44px;padding:3px 5px;font-size:12px;margin:0;border:1px solid ${c.bd};border-radius:4px;"
          onchange="${onSlotChange}('${rid}',+this.value)">
        <button class="btn sm dan" onclick="${onRemove}('${rid}')" style="padding:2px 7px;">✕</button>
      </div>`;
    }).join('')}
  </div>`;
}

// ── Recurring Event Modal ────────────────────────────

function openEvtModal(idx) {
  evCtx  = { idx: idx != null ? idx : null };
  const ev = idx != null ? S.events[idx] : null;
  evSlots  = ev?.slots ? { ...ev.slots } : {};

  document.getElementById('moEvtTitle').textContent = ev ? 'Edit Event' : 'Add Event';
  document.getElementById('evName').value           = ev?.name || '';
  document.getElementById('evDelBtn').style.display = ev ? '' : 'none';

  renderColorSwatches('evSwatches', ev?.color || EVT_PAL[0].h);
  renderEvDows(ev?.dows || []);
  renderEvModalRoles();
  document.getElementById('moEvt').style.display = 'flex';
}

function renderEvModalRoles() {
  renderRoleLibInModal('evRoleLib', evSlots, 'evToggleRole');
  document.getElementById('evRolesList').innerHTML = renderEvRolesList(evSlots, 'evSetSlot', 'evRemoveRole');
}

function evToggleRole(rid) { if (evSlots[rid] != null) delete evSlots[rid]; else evSlots[rid] = 1; renderEvModalRoles(); }
function evSetSlot(rid, v)  { evSlots[rid] = Math.max(1, v || 1); }
function evRemoveRole(rid)   { delete evSlots[rid]; renderEvModalRoles(); }

function renderEvDows(sel) {
  document.getElementById('evDows').innerHTML = DF.map((d, i) =>
    `<input type="checkbox" class="dow-cb" id="edc${i}" value="${i}"${sel.includes(i) ? ' checked' : ''}>
     <label class="dow-lbl" for="edc${i}">${d.slice(0, 3)}</label>`
  ).join('');
}
function getEvDows() { return [...document.querySelectorAll('.dow-cb:checked')].map(e => +e.value); }

function saveEvt() {
  const name = document.getElementById('evName').value.trim();
  if (!name) { alert('Enter an event name.'); return; }
  const color = getSwatchColor('evSwatches');
  const dows  = getEvDows();
  const ev    = { id: evCtx.idx != null ? S.events[evCtx.idx].id : 'ev_' + Date.now(), name, color, dows, slots: { ...evSlots } };
  if (evCtx.idx != null) S.events[evCtx.idx] = ev; else S.events.push(ev);
  closeMo('moEvt'); autosave(); renderAll(); showToast(`✓ "${name}" saved`);
}
function deleteEvt() {
  if (!confirm('Delete this event?')) return;
  S.events.splice(evCtx.idx, 1);
  closeMo('moEvt'); autosave(); renderAll();
}

// ── Day-specific Event Modal ─────────────────────────

let dayEvtCtx  = null;
let dayEvtSlots = {};

function openDayEvtModal(key, evIdx) {
  dayEvtCtx   = { key, evIdx: evIdx != null ? evIdx : null };
  const existing = evIdx != null ? (S.dayEvents[key] || [])[evIdx] : null;
  dayEvtSlots = existing?.slots ? { ...existing.slots } : {};

  const p       = key.split('-');
  const dateStr = new Date(+p[0], +p[1], +p[2]).toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' });

  document.getElementById('moDayEvtTitle').textContent = existing ? 'Edit Day Event' : 'Add Event to This Day';
  document.getElementById('moDayEvtSub').textContent   = dateStr;
  document.getElementById('dayEvtName').value          = existing?.name || '';
  document.getElementById('dayEvtDelBtn').style.display = existing ? '' : 'none';

  renderColorSwatches('dayEvtSwatches', existing?.color || EVT_PAL[0].h);
  renderDayEvtModalRoles();
  document.getElementById('moDayEvt').style.display = 'flex';
}

function renderDayEvtModalRoles() {
  renderRoleLibInModal('dayEvtRoleLib', dayEvtSlots, 'dayEvtToggleRole');
  document.getElementById('dayEvtRolesList').innerHTML = renderEvRolesList(dayEvtSlots, 'dayEvtSetSlot', 'dayEvtRemoveRole');
}

function dayEvtToggleRole(rid) { if (dayEvtSlots[rid] != null) delete dayEvtSlots[rid]; else dayEvtSlots[rid] = 1; renderDayEvtModalRoles(); }
function dayEvtSetSlot(rid, v)  { dayEvtSlots[rid] = Math.max(1, v || 1); }
function dayEvtRemoveRole(rid)   { delete dayEvtSlots[rid]; renderDayEvtModalRoles(); }

function saveDayEvt() {
  const name = document.getElementById('dayEvtName').value.trim();
  if (!name) { alert('Enter an event name.'); return; }
  const color         = getSwatchColor('dayEvtSwatches');
  const { key, evIdx } = dayEvtCtx;
  if (!S.dayEvents[key]) S.dayEvents[key] = [];
  const ev = {
    id:    evIdx != null ? (S.dayEvents[key][evIdx]?.id || 'de_' + Date.now()) : 'de_' + Date.now(),
    name, color, slots: { ...dayEvtSlots }
  };
  if (evIdx != null) S.dayEvents[key][evIdx] = ev; else S.dayEvents[key].push(ev);
  closeMo('moDayEvt'); autosave(); renderAll(); showToast(`✓ "${name}" saved`);
}

function deleteDayEvt() {
  if (!confirm('Delete this day event?')) return;
  const { key, evIdx } = dayEvtCtx;
  S.dayEvents[key].splice(evIdx, 1);
  if (!S.dayEvents[key].length) delete S.dayEvents[key];
  closeMo('moDayEvt'); autosave(); renderAll();
}
