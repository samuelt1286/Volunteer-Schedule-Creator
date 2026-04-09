/* ═══════════════════════════════════════════════════
   export.js — Print (PDF) and JPG Export
   ═══════════════════════════════════════════════════ */

// ── Print / PDF ───────────────────────────────────────

/**
 * Open a print-ready popup with calendar and list views.
 * The popup has its own Print / Save PDF button.
 */
function printSched() {
  if (!S.sched) { alert('No schedule yet.'); return; }
  const { year, month, sched } = S;
  const days      = computeDays();
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  function buildCal() {
    const first = new Date(year, month, 1).getDay();
    const tot   = new Date(year, month + 1, 0).getDate();
    const aSet  = new Set(days);

    let h = '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><thead><tr>';
    D7.forEach(d => h += `<th style="background:#EEE9E1;text-align:center;font-size:9px;font-weight:700;padding:5px 2px;color:#6B6560;border:1px solid #DDD8CF;">${d.toUpperCase()}</th>`);
    h += '</tr></thead><tbody><tr>';

    for (let i = 0; i < first; i++)
      h += `<td style="background:#F4F2EE;border:1px solid #DDD8CF;height:90px;vertical-align:top;padding:4px;"></td>`;

    let col = first;
    for (let d = 1; d <= tot; d++) {
      const key = dkey(year, month, d);
      const ds  = sched[key];

      h += `<td style="border:1px solid #DDD8CF;vertical-align:top;padding:4px;height:90px;background:${aSet.has(d) ? '#FAFCFA' : '#fff'};">`;
      h += `<div style="font-size:10px;font-weight:700;margin-bottom:3px;">${d}</div>`;

      if (ds) {
        Object.entries(ds).forEach(([evId, evData]) => {
          const ev     = getEvForKey(key, evId); if (!ev) return;
          const hasAny = Object.values(evData).some(a => a.length > 0); if (!hasAny) return;

          h += `<div style="border-radius:3px;margin-bottom:2px;overflow:hidden;border:1px solid rgba(0,0,0,.08);">
            <div style="font-size:7px;font-weight:800;padding:1px 4px;background:${ev.color};color:#fff;text-transform:uppercase;">${ev.name}</div>`;

          Object.entries(evData).forEach(([rid, arr]) => {
            if (!arr.length) return;
            const r  = getRole(rid); const cr = rc(r.color);
            h += `<div style="padding:1px 4px;background:${cr.bg};border-top:1px solid rgba(0,0,0,.06);">
              <span style="font-size:7px;color:${cr.tx};opacity:.65;text-transform:uppercase;">${r.name}: </span>
              ${arr.map((pid, i) => `<span style="font-size:8px;font-weight:700;color:${cr.tx};">${pName(pid).split(' ')[0]}${i < arr.length - 1 ? ', ' : ''}</span>`).join('')}
            </div>`;
          });
          h += `</div>`;
        });
      }

      h += `</td>`;
      col++;
      if (col % 7 === 0 && d < tot) h += `</tr><tr>`;
    }

    while (col % 7 !== 0) { h += `<td style="background:#F4F2EE;border:1px solid #DDD8CF;height:90px;"></td>`; col++; }
    return h + '</tr></tbody></table>';
  }

  function buildList() {
    let h = '';
    for (const day of days) {
      const date    = new Date(year, month, day);
      const dn      = date.toLocaleString('default', { weekday: 'long' });
      const ds2     = date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
      const key     = dkey(year, month, day);
      const ds      = sched[key];

      h += `<div style="border:1px solid #DDD8CF;border-radius:8px;margin-bottom:8px;overflow:hidden;break-inside:avoid;">
        <div style="padding:7px 12px;background:#EEE9E1;display:flex;justify-content:space-between;">
          <strong style="font-family:'DM Serif Display',serif;font-size:13px;color:#2D5A3D;">${dn}</strong>
          <span style="font-size:10px;color:#6B6560;">${ds2}</span>
        </div>`;

      if (ds) {
        Object.entries(ds).forEach(([evId, evData]) => {
          const ev = getEvForKey(key, evId); if (!ev) return;
          h += `<div style="padding:7px 12px;border-top:1px solid #eee;">
            <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:${ev.color};margin-bottom:4px;">● ${ev.name}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">`;
          Object.entries(evData).forEach(([rid, arr]) => {
            const r  = getRole(rid); const cr = rc(r.color);
            arr.forEach(pid => h += `<span style="background:${cr.bg};color:${cr.tx};border:1px solid ${cr.bd};padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;">${r.name} ${pName(pid)}</span>`);
          });
          h += `</div></div>`;
        });
      }
      h += `</div>`;
    }
    return h;
  }

  const tot        = Object.values(sched).reduce((a, d) => a + Object.values(d).reduce((b, e) => b + Object.values(e).reduce((cc, r) => cc + r.length, 0), 0), 0);
  const legendHtml = S.events.map(ev =>
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;margin-right:10px;">
      <span style="width:10px;height:10px;border-radius:50%;background:${ev.color};display:inline-block;"></span>${ev.name}
    </span>`
  ).join('');

  const win = window.open('', '_blank', 'width=1050,height=800');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${monthName} Schedule</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *   { box-sizing:border-box; margin:0; padding:0; }
    body{ font-family:'DM Sans',sans-serif; color:#1A1814; background:#fff; font-size:12px; padding:15px; }
    .ph { background:#2D5A3D; color:#fff; padding:11px 15px; border-radius:7px; margin-bottom:13px; display:flex; justify-content:space-between; align-items:center; }
    .ph h1 { font-family:'DM Serif Display',serif; font-size:16px; color:#fff; }
    .ph p  { font-size:9px; opacity:.7; margin-top:1px; }
    .np { margin-bottom:11px; display:flex; gap:6px; align-items:center; }
    .pb { padding:5px 11px; border-radius:5px; border:1px solid #ddd; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; background:#fff; }
    .pb.p { background:#2D5A3D; color:#fff; border-color:#2D5A3D; }
    .vtog { display:inline-flex; border:1px solid #ddd; border-radius:5px; overflow:hidden; }
    .vb   { padding:4px 11px; font-size:11px; cursor:pointer; border:none; background:#fff; color:#6B6560; font-family:'DM Sans',sans-serif; font-weight:500; }
    .vb.on{ background:#2D5A3D; color:#fff; }
    .sec  { margin-bottom:16px; }
    .st   { font-family:'DM Serif Display',serif; font-size:14px; color:#2D5A3D; margin-bottom:7px; padding-bottom:5px; border-bottom:2px solid #EAF2EC; }
    @media print {
      .np { display:none !important; }
      @page { margin:8mm 7mm; size:landscape; }
      body  { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="ph">
    <div>
      <h1>📋 ${monthName} &mdash; Volunteer Schedule</h1>
      <p>${days.length} service days &middot; ${tot} assignments &middot; ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
  <div class="np">
    <button class="pb p" onclick="window.print()">🖨 Print / Save PDF</button>
    <div class="vtog">
      <button class="vb on" id="bC" onclick="sv('cal')">🗓 Calendar</button>
      <button class="vb"    id="bL" onclick="sv('list')">☰ List</button>
      <button class="vb"    id="bB" onclick="sv('both')">Both</button>
    </div>
    <button class="pb" onclick="window.close()">✕ Close</button>
  </div>
  <div style="margin-bottom:11px;">${legendHtml}</div>
  <div id="sC" class="sec"><div class="st">Calendar View</div>${buildCal()}</div>
  <div id="sL" class="sec" style="display:none;"><div class="st">List View</div>${buildList()}</div>
  <script>
    function sv(v) {
      document.getElementById('sC').style.display = v === 'list' ? 'none' : 'block';
      document.getElementById('sL').style.display = v === 'cal'  ? 'none' : 'block';
      ['bC','bL','bB'].forEach((id,i) =>
        document.getElementById(id).classList.toggle('on', ['cal','list','both'][i] === v)
      );
    }
  <\/script>
</body>
</html>`);
  win.document.close();
}

// ── JPG Export ────────────────────────────────────────

/**
 * Render the schedule as a 1080×1920 JPEG and trigger download.
 * Lazily loads html2canvas from CDN on first use.
 */
function exportCalJpg() {
  if (!S.sched) { alert('No schedule yet.'); return; }
  const { year, month, sched } = S;
  const days      = computeDays();
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  function buildJpgHtml() {
    const d1   = new Date(year, month, 1).getDay();
    const tot  = new Date(year, month + 1, 0).getDate();
    const aSet = new Set(days);

    let h = `
      <div style="background:#2D5A3D;color:#fff;padding:20px 25px;border-radius:14px;margin-bottom:20px;">
        <h1 style="font-family:'DM Serif Display',serif;font-size:32px;color:#fff;margin:0;">📋 ${monthName}</h1>
        <p style="font-size:13px;opacity:.7;margin:4px 0 0;">${days.length} service days · ${S.subtitle || 'Volunteer Schedule'}</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:#DDD8CF;border-radius:10px;overflow:hidden;border:1px solid #DDD8CF;">
        ${D7.map(d => `<div style="background:#EEE9E1;text-align:center;font-size:10px;font-weight:700;padding:8px;color:#6B6560;">${d.toUpperCase()}</div>`).join('')}`;

    for (let i = 0; i < d1; i++)
      h += `<div style="background:#F4F2EE;min-height:120px;padding:6px;"></div>`;

    for (let d = 1; d <= tot; d++) {
      const key = dkey(year, month, d);
      const ds  = sched[key];

      h += `<div style="background:${aSet.has(d) ? '#FAFCFA' : '#fff'};min-height:120px;padding:6px;vertical-align:top;">`;
      h += `<div style="font-size:12px;font-weight:700;margin-bottom:4px;">${d}${
        S.dayLabels[key]
          ? ` <span style="font-size:8px;background:#2D5A3D;color:#fff;padding:1px 5px;border-radius:8px;">${S.dayLabels[key]}</span>`
          : ''
      }</div>`;

      if (ds) {
        Object.entries(ds).forEach(([evId, evData]) => {
          const ev     = getEvForKey(key, evId); if (!ev) return;
          const hasAny = Object.values(evData).some(a => a.length > 0); if (!hasAny) return;

          h += `<div style="border-radius:4px;margin-bottom:3px;overflow:hidden;border:1px solid rgba(0,0,0,.08);">
            <div style="font-size:8px;font-weight:800;padding:2px 5px;background:${ev.color};color:#fff;text-transform:uppercase;">${ev.name}</div>`;

          Object.entries(evData).forEach(([rid, arr]) => {
            if (!arr.length) return;
            const r  = getRole(rid); const cr = rc(r.color);
            h += `<div style="padding:2px 5px;background:${cr.bg};border-top:1px solid rgba(0,0,0,.06);">
              <span style="font-size:7px;color:${cr.tx};opacity:.65;text-transform:uppercase;">${r.name}: </span>
              ${arr.map(pid => `<span style="font-size:9px;font-weight:700;color:${cr.tx};">${pName(pid).split(' ')[0]}</span>`).join(', ')}
            </div>`;
          });
          h += `</div>`;
        });
      }
      h += `</div>`;
    }

    let cols = (d1 + tot) % 7;
    if (cols > 0) for (let i = cols; i < 7; i++) h += `<div style="background:#F4F2EE;min-height:120px;"></div>`;
    h += `</div>`;
    return h;
  }

  function doExport() {
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:fixed', 'left:-9999px', 'top:0',
      'width:1080px',
      "background:#F4F2EE",
      "font-family:'DM Sans',sans-serif",
      'padding:30px'
    ].join(';');
    wrap.innerHTML = buildJpgHtml();
    document.body.appendChild(wrap);

    html2canvas(wrap, { scale: 1.78, useCORS: true, backgroundColor: '#F4F2EE' }).then(canvas => {
      const a = document.createElement('a');
      a.href     = canvas.toDataURL('image/jpeg', 0.92);
      a.download = `schedule-${monthName.replace(/\s/, '-')}.jpg`;
      a.click();
      document.body.removeChild(wrap);
      showToast('📷 JPG exported');
    });
  }

  // Lazy-load html2canvas only when needed
  if (typeof html2canvas !== 'undefined') {
    doExport();
  } else {
    const script = document.createElement('script');
    script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = doExport;
    document.head.appendChild(script);
  }
}
