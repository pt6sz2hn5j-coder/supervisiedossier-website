/* Demo: een kleine, werkende versie van de app. Er wordt niets bewaard of verstuurd. */
(function () {
  var D = window.DEMO, root = document.getElementById('demo-app');
  if (!D || !root) return;

  var tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>';
  var S = {
    step: 0,
    chosen: D.goals.filter(function (g) { return g.on; }).map(function (g) { return g.id; }),
    status: {},
    wish: D.wish,
    seen: D.seenStart.slice(),
    pts: D.ptsStart.slice(),
    note: D.note,
    ev: D.evStart.slice(),
    saved: false,
    sent: ''
  };
  D.goals.forEach(function (g) { S.status[g.id] = 'actief'; });

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function has(a, v) { return a.indexOf(v) > -1; }
  function flip(a, v) { var i = a.indexOf(v); if (i > -1) a.splice(i, 1); else a.push(v); }

  function tabs() {
    return '<div class="tabs" role="group" aria-label="Stappen van de demo">' + D.tabs.map(function (t, i) {
      return '<button type="button" data-step="' + i + '"' + (i === S.step ? ' aria-current="step"' : '') + '>' + (i + 1) + ' · ' + esc(t) + '</button>';
    }).join('') + '</div>';
  }

  function stepGoals() {
    var many = S.chosen.length > 5;
    return '<div><h3>' + esc(D.goalsTitle) + '</h3><p>' + esc(D.goalsIntro) + '</p></div>' +
      '<div class="card"><label for="d-wish" style="font-weight:600">' + esc(D.wishLabel) + '</label>' +
      '<textarea id="d-wish" rows="3" style="margin-top:10px">' + esc(S.wish) + '</textarea></div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' + D.goals.map(function (g) {
        var on = has(S.chosen, g.id);
        return '<button type="button" class="choice" data-goal="' + g.id + '" aria-pressed="' + on + '"><span class="box">' + tick + '</span><span><strong>' + g.code + '</strong> ' + esc(g.text) + '</span></button>';
      }).join('') + '</div>' +
      (S.chosen.length ? '<div class="card" style="display:flex;flex-direction:column;gap:10px"><strong>Status van je gekozen doelen</strong>' + D.goals.filter(function (g) { return has(S.chosen, g.id); }).map(function (g) {
        return '<div class="goalrow"><span><strong>' + g.code + '</strong> ' + esc(g.short) + '</span><label class="sr" for="st-' + g.id + '">Status ' + g.code + '</label><select id="st-' + g.id + '" data-status="' + g.id + '">' +
          ['actief', 'bijgesteld', 'behaald'].map(function (o) { return '<option value="' + o + '"' + (S.status[g.id] === o ? ' selected' : '') + '>' + o.charAt(0).toUpperCase() + o.slice(1) + '</option>'; }).join('') + '</select></div>';
      }).join('') + '</div>' : '') +
      '<div class="row"><span>' + S.chosen.length + ' gekozen' + (many ? ' <span class="warn">· meer dan het advies van vijf lopende doelen</span>' : '') + '</span><button type="button" class="dbtn" data-go="1">' + esc(D.nextLabels[0]) + '</button></div>';
  }

  function stepSession() {
    var seen = S.chosen.length ? '<div class="chips">' + D.goals.filter(function (g) { return has(S.chosen, g.id); }).map(function (g) {
      return '<button type="button" class="chip" data-seen="' + g.id + '" aria-pressed="' + has(S.seen, g.id) + '">' + tick + '<span>' + g.code + ': ' + esc(g.short) + '</span></button>';
    }).join('') + '</div>' : '<p>Kies eerst een of meer doelen in stap 1.</p>';
    var pts = '<div class="chips">' + D.pts.map(function (p, i) {
      return '<button type="button" class="chip" data-pt="' + i + '" aria-pressed="' + has(S.pts, i) + '">' + tick + '<span>' + esc(p) + '</span></button>';
    }).join('') + '</div>';
    var empty = !S.note.trim();
    var extra = D.kind === 'ms'
      ? '<div class="card" style="display:flex;flex-direction:column;gap:10px"><strong>Mijn reflectie delen</strong><div class="chips">' +
        ['Naar supervisor sturen', 'Mail als PDF', 'Mail als Word'].map(function (l) { return '<button type="button" class="dbtn sec" data-send="' + l + '"' + (empty ? ' disabled' : '') + '>' + l + '</button>'; }).join('') + '</div>' +
        (S.sent ? '<p class="ok">' + esc(S.sent) + ' In de app opent hier het deelblad of je mailprogramma.</p>' : '<p class="note">' + (empty ? 'De opties zijn grijs zolang er geen reflectie staat.' : 'De opties werken zodra er een reflectie staat.') + '</p>') + '</div>'
      : '';
    return '<div><h3>' + esc(D.sessionTitle) + '</h3><p>' + esc(D.sessionMeta) + '</p></div>' +
      '<div><div class="note" style="margin-bottom:8px">' + esc(D.seenLabel) + '</div>' + seen + '</div>' +
      '<div><div class="note" style="margin-bottom:8px">' + esc(D.ptsLabel) + '</div>' + pts + '</div>' +
      '<div><label class="note" for="d-note" style="display:block;margin-bottom:8px">' + esc(D.noteLabel) + '</label><textarea id="d-note" rows="5" placeholder="Schrijf anoniem. Gebruik geen namen van cliënten.">' + esc(S.note) + '</textarea></div>' + extra +
      '<div class="row"><button type="button" class="dbtn sec" data-save="1">Opslaan</button>' + (S.saved ? '<span class="ok" role="status">Opgeslagen</span>' : '<span class="note">De app slaat ook zelf automatisch op.</span>') + '<button type="button" class="dbtn" data-go="2">' + esc(D.nextLabels[1]) + '</button></div>';
  }

  function chart() {
    var W = 300, H = 150, L = D.kind === 'sd' ? 26 : 12, R = 12, T = 12, B = 14, n = 6;
    function x(i) { return L + (W - L - R) * i / (n - 1); }
    function y(v) { return T + (H - T - B) * (1 - v / 5); }
    var cols = ['var(--accent)', 'var(--sun-ink)', 'oklch(0.4 0.03 55)'], dash = ['', '6 4', '2 4'];
    var grid = '';
    for (var g = 0; g <= 5; g += (D.kind === 'sd' ? 1 : 5)) {
      grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="oklch(0.9 0.02 85)"/>';
      if (D.kind === 'sd') grid += '<text x="' + (L - 6) + '" y="' + (y(g) + 4) + '" font-size="10" text-anchor="end" fill="oklch(0.4 0.03 55)">' + g + '</text>';
    }
    var lines = D.axes.map(function (a, k) {
      var pts = a.hist.concat([S.ev[k] / 20]);
      var d = pts.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
      var last = pts[pts.length - 1];
      return '<polyline points="' + d + '" fill="none" stroke="' + cols[k] + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + dash[k] + '"/>' +
        '<circle cx="' + x(5) + '" cy="' + y(last) + '" r="5" fill="' + cols[k] + '" stroke="#fff" stroke-width="2"/>';
    }).join('');
    var legend = '<div class="legend">' + D.axes.map(function (a, k) { return '<span><svg width="26" height="8" aria-hidden="true"><line x1="0" y1="4" x2="26" y2="4" stroke="' + cols[k] + '" stroke-width="3" stroke-dasharray="' + dash[k] + '"/></svg>' + esc(a.name) + '</span>'; }).join('') + '</div>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lijngrafiek van de drie schalen over zes sessies" style="display:block;width:100%;height:auto">' + grid + lines + '</svg>' + legend +
      '<div class="legend" style="justify-content:space-between"><span>Sessie 1</span><span>Sessie 6, vandaag</span></div>';
  }

  function stepEval() {
    return '<div class="dgrid"><div style="display:flex;flex-direction:column;gap:14px"><div><h3>' + esc(D.evTitle) + '</h3><p>' + esc(D.evIntro) + '</p></div>' +
      D.axes.map(function (a, i) {
        return '<label class="card slider"><span class="t">' + esc(a.sub) + '</span><span class="ends"><span>Helemaal niet</span><span>Heel erg</span></span><input type="range" min="0" max="100" value="' + S.ev[i] + '" data-ev="' + i + '"></label>';
      }).join('') + '</div>' +
      '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div><strong style="font-family:var(--serif);font-size:22px;font-weight:500;color:var(--accent-dark)">' + esc(D.chartTitle) + '</strong><p class="note" style="margin-top:4px">' + esc(D.chartNote) + '</p></div><div id="d-chart">' + chart() + '</div></div></div>' +
      '';
  }

  function render(focusSel) {
    var body = [stepGoals, stepSession, stepEval][S.step]();
    root.innerHTML = '<div class="demoframe"><div class="demo-top"><div class="demo-who"><span class="avatar" aria-hidden="true">' + esc(D.initials) + '</span><div><strong>' + esc(D.who) + '</strong><small>' + esc(D.whoSub) + '</small></div></div>' + tabs() + '</div><div class="demo-body">' + body + '</div></div>';
    if (focusSel) { var el = root.querySelector(focusSel); if (el) el.focus(); }
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-step],[data-go],[data-goal],[data-seen],[data-pt],[data-save],[data-send]');
    if (!t) return;
    var q;
    if (t.dataset.step != null) { S.step = +t.dataset.step; render('.tabs [aria-current]'); return; }
    if (t.dataset.go != null) { S.step = +t.dataset.go; render('.demo-body h3'); var h = root.querySelector('.demo-body h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } return; }
    if (t.dataset.goal) { flip(S.chosen, t.dataset.goal); render('[data-goal="' + t.dataset.goal + '"]'); return; }
    if (t.dataset.seen) { flip(S.seen, t.dataset.seen); render('[data-seen="' + t.dataset.seen + '"]'); return; }
    if (t.dataset.pt != null) { flip(S.pts, +t.dataset.pt); render('[data-pt="' + t.dataset.pt + '"]'); return; }
    if (t.dataset.save) { S.saved = true; render('[data-save]'); setTimeout(function () { S.saved = false; var s = root.querySelector('[role=status]'); if (s) { s.className = 'note'; s.removeAttribute('role'); s.textContent = 'De app slaat ook zelf automatisch op.'; } }, 2200); return; }
    if (t.dataset.send) { S.sent = t.dataset.send + ': gelukt.'; render('[data-send="' + t.dataset.send + '"]'); return; }
  });
  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'd-wish') S.wish = t.value;
    else if (t.id === 'd-note') { var was = !S.note.trim(); S.note = t.value; if (D.kind === 'ms' && was !== !S.note.trim()) { var pos = t.selectionStart; render('#d-note'); var n = root.querySelector('#d-note'); if (n) n.setSelectionRange(pos, pos); } }
    else if (t.dataset.ev != null) { S.ev[+t.dataset.ev] = +t.value; var c = root.querySelector('#d-chart'); if (c) c.innerHTML = chart(); }
  });
  root.addEventListener('change', function (e) { var t = e.target; if (t.dataset.status) S.status[t.dataset.status] = t.value; });
  render();
})();
