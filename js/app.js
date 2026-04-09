/* ═══════════════════════════════════════════════════
   app.js — Application Bootstrap & Tab Navigation
   Load order (see index.html):
     1. state.js
     2. utils.js
     3. storage.js
     4. roles.js
     5. volunteers.js
     6. events.js
     7. setup.js
     8. schedule.js
     9. export.js
    10. app.js        ← this file (always last)
   ═══════════════════════════════════════════════════ */

// ── Tab Navigation ────────────────────────────────────

/**
 * Switch to a named tab and render its content.
 * @param {'volunteers'|'events'|'setup'|'schedule'} tab
 */
function go(tab) {
  const tabs   = ['volunteers', 'events', 'setup', 'schedule'];
  const tabBtns = document.querySelectorAll('.tab');

  tabs.forEach((name, i) => {
    tabBtns[i]?.classList.toggle('on', name === tab);
    document.getElementById('panel-' + name)?.classList.toggle('on', name === tab);
  });

  if (tab === 'volunteers') renderVolTab();
  if (tab === 'events')     renderEventsTab();
  if (tab === 'setup')      renderSetup();
  if (tab === 'schedule')   renderSched();
}

// ── Full Re-render ────────────────────────────────────

/**
 * Re-render every section that may be visible or that
 * feeds data into other sections.
 */
function renderAll() {
  renderVolTab();
  renderEventsTab();
  renderMiniCal();
  renderSetupPool();
  syncVolSels();

  if (document.getElementById('panel-schedule')?.classList.contains('on')) renderSched();
  if (document.getElementById('panel-setup')?.classList.contains('on'))    renderSetupCal();
}

// ── Bootstrap ─────────────────────────────────────────

window.onload = () => {
  // Populate role color <select> in the Add/Edit Role modal
  document.getElementById('roleColor').innerHTML =
    RCK.map(k => `<option value="${k}">${k}</option>`).join('');

  // Restore persisted data then render everything
  loadSaved();
  renderAll();
};
