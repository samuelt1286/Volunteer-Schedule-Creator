/* ═══════════════════════════════════════════════════
   utils.js — Shared Helper Functions
   ═══════════════════════════════════════════════════ */

/** Return role color theme object, falling back to 'flex' */
function rc(k) { return RC[k] || RC.flex; }

/** Get initials (up to 2 chars) from a name string */
function ini(n) { return (n || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }

/** Get a volunteer's display name by ID */
function pName(id) { return S.volunteers.find(v => v.id === id)?.name || '—'; }

/** Get a role object by ID, falling back to a stub */
function getRole(id) { return S.roles.find(r => r.id === id) || { id, name: id, color: 'flex' }; }

/** Build a localStorage / sched key from year/month/day */
function dkey(y, m, d) { return `${y}-${m}-${d}`; }

/**
 * Compute the sorted list of active days for the current month.
 * Includes: manually selected days, days matching event DOWs, and days with one-off events.
 */
function computeDays() {
  const { year, month, days } = S;
  const tot = new Date(year, month + 1, 0).getDate();
  const set = new Set(days);
  for (let d = 1; d <= tot; d++) {
    const dow = new Date(year, month, d).getDay();
    S.events.forEach(e => { if (e.dows.includes(dow)) set.add(d); });
    if (S.dayEvents[dkey(year, month, d)]) set.add(d);
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Resolve an event object from a schedule key + event ID.
 * Checks one-off day events first, then recurring events.
 */
function getEvForKey(key, evId) {
  const dayArr = S.dayEvents[key];
  if (dayArr) {
    const f = dayArr.find(e => e.id === evId);
    if (f) return f;
  }
  return S.events.find(e => e.id === evId) || null;
}

/** Show a brief toast notification */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = [
      'position:fixed', 'bottom:18px', 'left:50%',
      'transform:translateX(-50%) translateY(8px)',
      'background:#2D5A3D', 'color:#fff',
      'padding:8px 15px', 'border-radius:8px',
      'font-size:13px', 'font-weight:500',
      'z-index:99999',
      'transition:opacity .3s,transform .3s',
      'opacity:0', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._h);
  t._h = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(8px)';
  }, 2500);
}

/** Close any modal by its element ID */
function closeMo(id) { document.getElementById(id).style.display = 'none'; }

/** Render color swatches inside a container */
function renderColorSwatches(containerId, selected) {
  document.getElementById(containerId).innerHTML = EVT_PAL.map(p =>
    `<div class="sw${p.h === selected ? ' on' : ''}" style="background:${p.h};"
      onclick="selectSwatch('${containerId}','${p.h}',this)"></div>`
  ).join('');
}

/** Mark a swatch as selected, deselecting all others in the same container */
function selectSwatch(cid, color, el) {
  document.querySelectorAll(`#${cid} .sw`).forEach(s => s.classList.remove('on'));
  el.classList.add('on');
}

/** Get the currently selected swatch color from a container */
function getSwatchColor(cid) {
  const on = document.querySelector(`#${cid} .sw.on`);
  return on ? on.style.background : EVT_PAL[0].h;
}
