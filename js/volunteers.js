/* ═══════════════════════════════════════════════════
   volunteers.js — Volunteer Management
   ═══════════════════════════════════════════════════ */

let volCtx  = null;
let volExtra = [];

/** Sync role <select> options in the volunteer modal */
function syncVolSels() {
  const opts = S.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  ['volPrimRole', 'volExtraSel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts || '<option value="">— add roles first —</option>';
  });
}

/** Render both the role list and volunteer list */
function renderVolTab() {
  renderRoleList();
  renderVolunteers();
}

/** Render the volunteer list with assignment counts */
function renderVolunteers() {
  const el = document.getElementById('volList');
  if (!el) return;

  // Count schedule assignments per volunteer
  const cnt = {};
  S.volunteers.forEach(v => { cnt[v.id] = 0; });
  if (S.sched) {
    Object.values(S.sched).forEach(d =>
      Object.values(d).forEach(ev =>
        Object.values(ev).forEach(arr =>
          arr.forEach(id => { if (cnt[id] != null) cnt[id]++; })
        )
      )
    );
  }

  // Stats row
  document.getElementById('volStats').innerHTML = `
    <div class="stat"><div class="n">${S.volunteers.length}</div><div class="l">Volunteers</div></div>
    <div class="stat"><div class="n">${S.events.length}</div><div class="l">Events</div></div>
    <div class="stat"><div class="n">${S.roles.length}</div><div class="l">Roles</div></div>`;

  if (!S.volunteers.length) {
    el.innerHTML = '<div class="empty"><div class="big">👥</div><p>No volunteers yet.</p></div>';
    return;
  }

  // Group by primary role
  const groups = {};
  S.volunteers.forEach(v => {
    const k = v.role || 'No Role';
    if (!groups[k]) groups[k] = [];
    groups[k].push(v);
  });

  el.innerHTML = Object.entries(groups).map(([roleId, vols]) => {
    const rol = getRole(roleId);
    const c   = rc(rol.color);
    return `<div style="margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">
        <span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};">${roleId}</span>
        <span style="font-size:11px;color:var(--tx3);">${vols.length} volunteer${vols.length !== 1 ? 's' : ''}</span>
      </div>
      ${vols.map(v => {
        const extraPills = v.extra.map(r => {
          const cr = getRole(r);
          const c2 = rc(cr.color);
          return `<span class="rp" style="background:${c2.bg};color:${c2.tx};border-color:${c2.bd};">${r}</span>`;
        }).join('');
        return `<div class="pr">
          <div class="av" style="background:${c.bg};color:${c.tx};">${ini(v.name)}</div>
          <div class="pi">
            <div class="pn">${v.name}</div>
            <div class="pm">
              <span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};">${v.role || '—'}</span>
              ${extraPills}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-right:7px;">
            <div style="font-family:'DM Serif Display',serif;font-size:20px;color:var(--ac);">${cnt[v.id] || 0}</div>
            <div style="font-size:9px;color:var(--tx3);">assigned</div>
          </div>
          <button class="btn sm ghost" onclick="openVolModal(${v.id})">✎ Edit</button>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

/** Open the Add / Edit Volunteer modal */
function openVolModal(id) {
  const nid = id != null ? +id : null;
  volCtx   = { id: nid };
  const v  = nid != null ? S.volunteers.find(x => x.id === nid) : null;
  volExtra = v ? [...v.extra] : [];

  document.getElementById('moVolTitle').textContent = v ? 'Edit Volunteer' : 'Add Volunteer';
  document.getElementById('moVolSub').textContent   = v ? `Editing: ${v.name}` : 'Fill in name and assign a role.';
  document.getElementById('volName').value = v?.name || '';
  document.getElementById('volDelBtn').style.display = v ? '' : 'none';

  syncVolSels();
  if (v) {
    const sel = document.getElementById('volPrimRole');
    if (sel) [...sel.options].forEach(o => o.selected = o.value === v.role);
  }
  renderVolExtraChips();
  document.getElementById('moVol').style.display = 'flex';
}

/** Add a secondary role chip from the dropdown */
function addVolExtra() {
  const v = document.getElementById('volExtraSel').value;
  if (v && !volExtra.includes(v)) {
    volExtra.push(v);
    renderVolExtraChips();
  }
}

/** Re-render secondary role pills in the volunteer modal */
function renderVolExtraChips() {
  document.getElementById('volExtraChips').innerHTML = volExtra.map((r, i) => {
    const c = rc(getRole(r).color);
    return `<span class="rp" style="background:${c.bg};color:${c.tx};border-color:${c.bd};cursor:pointer;"
      onclick="volExtra.splice(${i},1);renderVolExtraChips()">${r} ×</span>`;
  }).join('');
}

/** Save (create or update) a volunteer */
function saveVol() {
  const name = document.getElementById('volName').value.trim();
  const role = document.getElementById('volPrimRole').value;
  if (!name) { alert('Enter a name.'); return; }

  if (volCtx.id != null) {
    const v = S.volunteers.find(x => x.id === volCtx.id);
    if (v) { v.name = name; v.role = role; v.extra = volExtra; }
  } else {
    S.volunteers.push({ id: Date.now(), name, role, extra: [...volExtra] });
  }

  closeMo('moVol');
  autosave();
  renderAll();
  showToast(`✓ ${name} saved`);
}

/** Remove a volunteer from the roster and all schedule assignments */
function deleteVol() {
  if (!confirm('Remove this volunteer?')) return;
  S.volunteers = S.volunteers.filter(v => v.id !== volCtx.id);
  if (S.sched) {
    Object.values(S.sched).forEach(d =>
      Object.values(d).forEach(ev =>
        Object.keys(ev).forEach(rid => {
          ev[rid] = ev[rid].filter(x => x !== volCtx.id);
        })
      )
    );
  }
  closeMo('moVol');
  autosave();
  renderAll();
}
