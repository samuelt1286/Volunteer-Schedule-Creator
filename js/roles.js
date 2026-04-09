/* ═══════════════════════════════════════════════════
   roles.js — Role Management
   Roles are the single source of truth shared across
   all events, volunteers, and the schedule.
   ═══════════════════════════════════════════════════ */

let roleCtx = null;

/** Render the full role list in the Volunteers & Roles tab */
function renderRoleList() {
  const el = document.getElementById('roleList');
  if (!el) return;

  if (!S.roles.length) {
    el.innerHTML = `<div class="empty" style="padding:20px;">
      <div class="big" style="font-size:24px;">🎯</div>
      <p style="font-size:12px;">No roles yet.<br>Create your first role above.</p>
    </div>`;
    return;
  }

  el.innerHTML = S.roles.map((r, i) => {
    const c = rc(r.color);
    return `<div class="pr" style="background:${c.bg};border-color:${c.bd};">
      <div class="av" style="background:${c.bg};color:${c.tx};border:1px solid ${c.bd};">${r.name.slice(0, 2)}</div>
      <div class="pi">
        <div class="pn" style="color:${c.tx};">${r.name}</div>
        <div class="pm" style="color:${c.tx};opacity:.7;">${r.color}</div>
      </div>
      <button class="btn sm ghost" onclick="openRoleModal(${i})" style="flex-shrink:0;">✎ Edit</button>
    </div>`;
  }).join('');
}

/** Open the Add / Edit Role modal */
function openRoleModal(idx) {
  roleCtx = { idx: idx != null ? idx : null };
  const r = idx != null ? S.roles[idx] : null;

  document.getElementById('moRoleTitle').textContent = r ? 'Edit Role' : 'Add Role';
  document.getElementById('roleName').value = r?.name || '';
  document.getElementById('roleDelBtn').style.display = r ? '' : 'none';

  const sel = document.getElementById('roleColor');
  if (r && sel) [...sel.options].forEach(o => o.selected = o.value === r.color);

  document.getElementById('moRole').style.display = 'flex';
}

/** Save (create or update) a role */
function saveRole() {
  const name  = document.getElementById('roleName').value.trim().toUpperCase();
  const color = document.getElementById('roleColor').value;
  if (!name) { alert('Enter a role name.'); return; }

  if (roleCtx.idx != null) {
    const old = S.roles[roleCtx.idx];

    // If the name/ID changed, cascade that rename everywhere
    if (old.id !== name) {
      S.volunteers.forEach(v => {
        if (v.role === old.id) v.role = name;
        v.extra = v.extra.map(e => e === old.id ? name : e);
      });
      S.events.forEach(ev => {
        if (ev.slots && ev.slots[old.id] != null) {
          ev.slots[name] = ev.slots[old.id];
          delete ev.slots[old.id];
        }
      });
      Object.values(S.dayEvents).forEach(arr => arr.forEach(ev => {
        if (ev.slots && ev.slots[old.id] != null) {
          ev.slots[name] = ev.slots[old.id];
          delete ev.slots[old.id];
        }
      }));
      if (S.sched) Object.values(S.sched).forEach(d => Object.values(d).forEach(ev => {
        if (ev[old.id] != null) { ev[name] = ev[old.id]; delete ev[old.id]; }
      }));
    }

    S.roles[roleCtx.idx] = { id: name, name, color };
  } else {
    if (S.roles.find(r => r.id === name)) { alert(`Role "${name}" already exists.`); return; }
    S.roles.push({ id: name, name, color });
  }

  closeMo('moRole');
  autosave();
  renderAll();
  showToast(`✓ Role "${name}" saved`);
}

/** Delete a role (cascades removal from events, volunteers, schedule) */
function deleteRole() {
  if (!confirm('Delete this role? It will be removed from all events and volunteers.')) return;
  const rid = S.roles[roleCtx.idx].id;
  S.roles.splice(roleCtx.idx, 1);

  S.volunteers.forEach(v => {
    if (v.role === rid) v.role = '';
    v.extra = v.extra.filter(e => e !== rid);
  });
  S.events.forEach(ev => { if (ev.slots) delete ev.slots[rid]; });
  Object.values(S.dayEvents).forEach(arr => arr.forEach(ev => { if (ev.slots) delete ev.slots[rid]; }));

  closeMo('moRole');
  autosave();
  renderAll();
}
