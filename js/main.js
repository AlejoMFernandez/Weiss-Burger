/* Weiss — demo web · JS vanilla */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var BOLT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z"/></svg>';
  var MONTHS = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  var mqMobile = window.matchMedia('(max-width: 760px)');
  function el(tag, attrs, ns) {
    var n = ns ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }


  /* ---------- INTRO smash ---------- */
  (function () {
    var root = document.documentElement, box = document.getElementById('intro');
    if (!box || !root.classList.contains('intro')) return;
    var stage = box.querySelector('.intro__stage'), done = false;
    function fit() { stage.style.setProperty('--s', Math.min(1, window.innerWidth / 620, window.innerHeight / 620).toFixed(3)); }
    fit(); window.addEventListener('resize', fit);
    function finish(fast) {
      if (done) return; done = true;
      try { sessionStorage.setItem('weissIntro', '1'); } catch (e) {}
      box.classList.add('out');
      setTimeout(function () { root.classList.remove('intro'); box.remove(); }, fast ? 450 : 650);
    }
    var t = setTimeout(function () { finish(false); }, 2600);
    function skip() { clearTimeout(t); finish(true); }
    box.addEventListener('click', skip);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { skip(); document.removeEventListener('keydown', k); } });
  })();

  /* ---------- NAV ---------- */
  var nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    links.classList.toggle('open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (links.classList.contains('open') && !links.contains(e.target) && !burger.contains(e.target)) setMenu(false); });

  /* ---------- DATA ---------- */
  var B = [
    ['BACON A LO TOMI','tomi',['Doble carne','Doble cheddar','Doble bacon','Salsa alioli de la casa','Cebolla']],
    ['LA GULOSA','gulosa',['Doble carne','Doble cheddar','Bacon ahumado','Aros de cebolla','Huevo frito']],
    ['LA CRISPY','crispy',['Pollo crispy','Tomate','Lechuga','Huevo frito']],
    ['BACON EN CUBOS','cubos',['Doble carne','Cheddar','Bacon en cubos','Cebolla caramelizada','Red BBQ']],
    ['CLÁSICA CON DIJON','dijon',['Doble carne','Cheddar','Bacon','Lechuga y tomate','Salsa dijon']],
    ['PATTY MELT','pattymelt',['Doble carne','Cheddar','Cebolla caramelizada','Alioli de la casa']],
    ['ROGER','roger',['Doble carne','Queso dambo','Bacon ahumado','Cebolla crispy','Pepinos agridulces','Weiss BBQ']],
    ['FUEGUINA','fueguina',['Carne','Queso azul','Cebolla caramelizada','Rúcula y alioli de la casa']],
    ['OKLAHOMA FRIED ONION','oklahoma',['Doble carne','Encebollada','Cheddar']],
    ['SMACK','smack',['Triple carne','Triple cheddar','Triple bacon','Ketchup']],
    ['ROUTE 66','route66',['Doble carne','Queso emmental','Cebolla caramelizada','Hongos de pino']],
    ['MEXICANA','mexicana',['Pollo en tempura','Carne','Cheddar','Guacamole','White and red BBQ']]
  ];

  /* ---------- TICKER ---------- */
  var tk = $('#ticker');
  if (tk) {
    var html = '';
    for (var r = 0; r < 2; r++) B.forEach(function (b) { html += '<span>' + b[0] + BOLT + '</span>'; });
    tk.innerHTML = html;
  }

  /* ---------- CARTA: selector ---------- */
  (function carta() {
    var sec = $('#carta'), stage = $('#stage'), roster = $('#roster');
    if (!sec) return;
    var N = B.length, i = 0, dx = 0, sx = null, dragging = false, bw = 660, STEP = 440;
    var imgs = B.map(function (b, k) {
      var im = el('img', { src: 'img/burga-' + b[1] + '.webp?v=2', alt: b[0], width: 1100, height: 733, loading: 'lazy', draggable: 'false' });
      stage.appendChild(im); return im;
    });
    var thumbs = B.map(function (b, k) {
      var t = el('button', { class: 'thumb', role: 'tab', 'aria-label': b[0], 'aria-selected': 'false' });
      t.innerHTML = '<img src="img/thumb-' + b[1] + '.webp?v=2" alt="" loading="lazy" width="180" height="120">';
      t.addEventListener('click', function () { go(k - i); });
      roster.appendChild(t); return t;
    });
    function size() {
      var vw = window.innerWidth, vh = window.innerHeight;
      if (mqMobile.matches) { bw = Math.min(vw * 0.88, 380); STEP = bw * 0.68; }
      else { bw = Math.max(320, Math.min(660, vw * 0.46, (vh - 330) * 1.5)); STEP = bw * 0.67; }
      sec.style.setProperty('--bw', bw + 'px');
      layout();
    }
    function layout() {
      imgs.forEach(function (im, k) {
        var s = (k - i + N) % N; if (s > N / 2) s -= N;
        var p = s + dx / STEP, a = Math.abs(p), c = Math.min(a, 1);
        var sc = a <= 1 ? 1 - 0.4 * c : 0.6 - 0.15 * Math.min(a - 1, 1);
        var x = (p < 0 ? -1 : 1) * (a <= 1 ? a * STEP : STEP + (a - 1) * STEP * 0.6);
        var y = -bw * 0.06 * c;
        var op = a <= 1.15 ? 1 - 0.2 * c : Math.max(0, 0.8 - (a - 1.15) * 2.5);
        im.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
        im.style.filter = 'grayscale(' + c.toFixed(2) + ') brightness(' + (1 - 0.3 * c).toFixed(2) + ') drop-shadow(0 ' + (bw * 0.04).toFixed(0) + 'px ' + (bw * 0.04).toFixed(0) + 'px rgba(0,0,0,' + (0.4 - 0.25 * c).toFixed(2) + '))';
        im.style.opacity = op.toFixed(2);
        im.style.zIndex = String(100 - Math.round(a * 10));
        if (a < 1.6) im.loading = 'eager';
      });
    }
    function info() {
      sec.setAttribute('data-theme', String(i % 3));
      var name = $('.carta__name', sec);
      $('#bname').textContent = B[i][0];
      $('#num').textContent = String(i + 1).padStart(2, '0');
      name.classList.remove('slam'); void name.offsetWidth; name.classList.add('slam');
      $('#moves').innerHTML = B[i][2].map(function (m, j) { return '<li style="animation-delay:' + (0.05 * j) + 's">' + BOLT + m + '</li>'; }).join('');
      thumbs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      var t = thumbs[i], R = roster;
      if (R.scrollWidth > R.clientWidth) R.scrollTo({ left: t.offsetLeft - R.clientWidth / 2 + t.offsetWidth / 2, behavior: 'smooth' });
    }
    function go(d) { i = (i + d + N) % N; dx = 0; dragging = false; stage.classList.remove('is-drag'); layout(); info(); }
    $('#prev').addEventListener('click', function () { go(-1); });
    $('#next').addEventListener('click', function () { go(1); });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      sx = e.clientX; dx = 0; dragging = true; stage.classList.add('is-drag');
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (sx === null) return;
      dx = Math.max(-STEP, Math.min(STEP, e.clientX - sx)); layout();
    });
    function end() {
      if (sx === null) return; sx = null;
      var th = STEP * 0.18;
      if (dx < -th) go(1); else if (dx > th) go(-1);
      else { dx = 0; dragging = false; stage.classList.remove('is-drag'); layout(); }
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    window.addEventListener('resize', size);
    size(); info();
  })();

  /* ---------- BURGA DEL MES ---------- */
  (function mes() {
    var now = new Date();
    var last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    $$('.js-month').forEach(function (n) { n.textContent = MONTHS[now.getMonth()]; });
    $$('.js-days').forEach(function (n) { n.textContent = String(last - now.getDate() + 1); });
    var star = '';
    for (var k = 0; k < 28; k++) { var rr = k % 2 ? 40 : 50, an = k / 28 * Math.PI * 2; star += (k ? 'L' : 'M') + (50 + rr * Math.cos(an)).toFixed(1) + ' ' + (50 + rr * Math.sin(an)).toFixed(1) + ' '; }
    $('#starPath').setAttribute('d', star + 'Z');

    var svg = $('#mesSvg'), sec = $('#burga-del-mes');
    var NOTES = [['Cebolla caramelizada',20,46,'L'],['Doble carne',19,64,'L'],['Red BBQ',74,32,'R'],['Bacon en cubos',66,42,'R'],['Cheddar',62,53,'R']];
    var f = function (v) { return v.toFixed(1); };
    function arrowHead(cx, cy, ex, ey, H) {
      var ang = Math.atan2(ey - cy, ex - cx);
      return 'M' + f(ex - H * Math.cos(ang - .5)) + ' ' + f(ey - H * Math.sin(ang - .5)) + ' L' + f(ex) + ' ' + f(ey) + ' L' + f(ex - H * Math.cos(ang + .5)) + ' ' + f(ey - H * Math.sin(ang + .5));
    }
    function addText(x, y, anchor, label, size, split) {
      var t = el('text', { x: x, y: y, 'text-anchor': anchor, 'font-size': size, class: 'lbl' }, true);
      var parts = [label];
      if (split && label.length > 13) { var m = label.lastIndexOf(' ', Math.ceil(label.length / 2) + 2); if (m > 0) parts = [label.slice(0, m), label.slice(m + 1)]; }
      parts.forEach(function (p, j) { var ts = el('tspan', { x: x, dy: j ? size * 1.1 : 0 }, true); ts.textContent = p; t.appendChild(ts); });
      if (parts.length > 1) t.setAttribute('y', y - size * 1.1);
      svg.appendChild(t); return t;
    }
    function build() {
      svg.innerHTML = '';
      var mob = mqMobile.matches, items = [];
      var BX, BY, BW, BH;
      if (!mob) {
        BX = 170; BY = 40; BW = 720; BH = 480;
        svg.setAttribute('viewBox', '0 0 1060 540');
      } else {
        BX = 0; BY = 92; BW = 390; BH = 260;
        svg.setAttribute('viewBox', '0 0 390 410');
      }
      var img = el('image', { href: 'img/burga-cubos.webp', x: BX, y: BY, width: BW, height: BH, class: 'bimg', style: 'transform-box:fill-box;transform-origin:center' }, true);
      svg.appendChild(img);
      if (!mob) {
        ['L','R'].forEach(function (side) {
          var L = NOTES.filter(function (n) { return n[3] === side; }).map(function (n) { return { n: n, ty: BY + n[2] / 100 * BH - 30 }; });
          L.sort(function (a, b) { return a.ty - b.ty; });
          for (var k = 1; k < L.length; k++) if (L[k].ty - L[k - 1].ty < 70) L[k].ty = L[k - 1].ty + 70;
          L.forEach(function (o) {
            var X = BX + o.n[1] / 100 * BW, Y = BY + o.n[2] / 100 * BH;
            var sx = side === 'L' ? BX + 6 : BX + BW - 6, sy = o.ty + 10;
            var ex = X + (side === 'L' ? -10 : 10), ey = Y, cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 50;
            items.push({ d: 'M' + f(sx) + ' ' + f(sy) + ' Q ' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey), head: arrowHead(cx, cy, ex, ey, 14), tx: side === 'L' ? sx - 8 : sx + 8, ty: o.ty + 4, anchor: side === 'L' ? 'end' : 'start', label: o.n[0], size: 19 });
          });
        });
      } else {
        var groups = [NOTES.filter(function (n) { return n[2] < 50; }), NOTES.filter(function (n) { return n[2] >= 50; })];
        groups.forEach(function (list, g) {
          list = list.slice().sort(function (a, b) { return a[1] - b[1]; });
          list.forEach(function (n, k) {
            var slot = (k + 0.5) / list.length * BW;
            var ex = n[1] / 100 * BW, ey = BY + n[2] / 100 * BH + (g ? 6 : -6);
            var sx = slot, sy = g ? BY + BH + 10 : BY - 14;
            var cx = (sx + ex) / 2 + (g ? -18 : 18), cy = (sy + ey) / 2;
            items.push({ d: 'M' + f(sx) + ' ' + f(sy) + ' Q ' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey), head: arrowHead(cx, cy, ex, ey, 11), tx: slot, ty: g ? BY + BH + 38 : BY - 24, anchor: 'middle', label: n[0], size: 15, split: true, top: !g });
          });
        });
      }
      items.forEach(function (it, k) {
        var d1 = 0.7 + k * 0.18;
        var p = el('path', { d: it.d, class: 'arw' }, true), h = el('path', { d: it.head, class: 'arw' }, true);
        svg.appendChild(p); svg.appendChild(h);
        [[p, d1], [h, d1 + 0.5]].forEach(function (q) { var L = q[0].getTotalLength ? q[0].getTotalLength() : 300; q[0].style.setProperty('--len', Math.ceil(L)); q[0].style.animationDelay = q[1] + 's'; });
        var t = addText(it.tx, it.ty, it.anchor, it.label, it.size, it.split);
        if (it.split && it.top && t.childNodes.length > 1) t.setAttribute('y', it.ty - it.size * 1.1);
        t.style.animationDelay = d1 + 's';
      });
    }
    build();
    mqMobile.addEventListener ? mqMobile.addEventListener('change', build) : mqMobile.addListener(build);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { sec.classList.add('is-on'); ob.disconnect(); } }); }, { threshold: 0.3 }).observe(sec);
    } else sec.classList.add('is-on');
  })();

  /* ---------- LOCALES: mapas ---------- */
  (function locales() {
    var D = window.WEISS_MAP; if (!D) return;
    var mapAr = $('#mapAr'), mapAmba = $('#mapAmba'), card = $('#card'), lista = $('#lista');
    var pinsById = {};
    function pinNode(l, x, y, scale) {
      var a = el('a', { class: 'pin', href: '#locales', role: 'button', 'aria-label': l.name + ', ' + l.city, 'data-id': l.id }, true);
      var g = el('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + scale + ')' }, true);
      var inner = el('g', {}, true);
      inner.appendChild(el('circle', { class: 'pin-hit', cx: 0, cy: -16, r: 17 }, true));
      inner.appendChild(el('path', { class: 'pin-body', d: 'M0 0 C-6 -9 -10 -13 -10 -20 A10 10 0 1 1 10 -20 C10 -13 6 -9 0 0Z' }, true));
      inner.appendChild(el('circle', { class: 'pin-dot', cx: 0, cy: -20, r: 3.8 }, true));
      g.appendChild(inner); a.appendChild(g);
      a.addEventListener('click', function (e) { e.preventDefault(); select(l.id, true); });
      a.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); select(l.id, true); } });
      (pinsById[l.id] = pinsById[l.id] || []).push(a);
      return a;
    }
    /* Argentina */
    var s = el('svg', { viewBox: '0 0 ' + D.w + ' ' + D.h, role: 'img', 'aria-label': 'Mapa de Argentina y Uruguay con los locales Weiss' }, true);
    s.innerHTML = '<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><rect width="2" height="7" fill="#d8cfbd"/></pattern></defs>';
    s.appendChild(el('path', { d: D.uy, class: 'm-uy' }, true));
    [D.ar, D.tdf].concat(D.mal).forEach(function (d) { s.appendChild(el('path', { d: d, class: 'm-land' }, true)); });
    D.andes.forEach(function (p, k) {
      var w = k % 2 ? 22 : 18, h = k % 2 ? 20 : 15;
      s.appendChild(el('path', { class: 'm-andes', d: 'M' + (p[0] - w / 2) + ' ' + (p[1] + h / 2) + ' L' + p[0] + ' ' + (p[1] - h / 2) + ' L' + (p[0] + w / 2) + ' ' + (p[1] + h / 2) + 'Z' }, true));
    });
    var sea = el('text', { x: 420, y: 760, class: 'm-sea', 'font-size': 22, transform: 'rotate(-70 420 760)' }, true); sea.textContent = 'OCÉANO ATLÁNTICO'; s.appendChild(sea);
    var uyT = el('text', { x: 488, y: 410, class: 'm-label', 'font-size': 15 }, true); uyT.textContent = 'URUGUAY'; s.appendChild(uyT);
    var malT = el('text', { x: 392, y: 1010, class: 'm-label', 'font-size': 11, fill: '#8c826f' }, true); malT.textContent = 'Islas Malvinas'; s.appendChild(malT);
    var placed = [];
    D.locs.filter(function (l) { return !l.amba; }).forEach(function (l) {
      var x = l.x, y = l.y, guard = 0;
      while (placed.some(function (p) { return Math.abs(p[0] - x) < 12 && Math.abs(p[1] - y) < 12; }) && guard++ < 6) x += 14;
      placed.push([x, y]);
      s.appendChild(pinNode(l, x, y, 1.15));
    });
    var c = el('a', { class: 'cluster', href: '#locales', role: 'button', 'aria-label': 'Ver los ' + D.locs.filter(function (l) { return l.amba; }).length + ' locales de Buenos Aires' }, true);
    var cx = D.ambaCluster.x, cy = D.ambaCluster.y, n = D.locs.filter(function (l) { return l.amba; }).length;
    c.innerHTML = '<circle class="ring" cx="' + cx + '" cy="' + cy + '" r="17"/><circle cx="' + cx + '" cy="' + cy + '" r="17"/><text x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle" font-size="20">' + n + '</text><text x="' + (cx - 24) + '" y="' + (cy + 6) + '" text-anchor="end" font-size="15">BUENOS AIRES</text>';
    c.addEventListener('click', function (e) { e.preventDefault(); showAmba(true); });
    s.appendChild(c);
    mapAr.appendChild(s);

    /* AMBA */
    var A = D.amba;
    var z = el('svg', { viewBox: '0 0 ' + A.w + ' ' + A.h, role: 'img', 'aria-label': 'Mapa de Buenos Aires y alrededores con los locales Weiss' }, true);
    z.appendChild(el('path', { d: A.water, class: 'm-water' }, true));
    [[300,60],[420,100],[520,150],[380,200],[540,300],[470,250],[560,60]].forEach(function (p) {
      z.appendChild(el('path', { class: 'm-waves', d: 'M' + p[0] + ' ' + p[1] + ' q 7 -6 14 0 t 14 0 t 14 0' }, true));
    });
    A.delta.forEach(function (d) { z.appendChild(el('path', { d: d, class: 'm-river' }, true)); });
    [A.pana, A.lp, A.ezeiza].forEach(function (d) { z.appendChild(el('path', { d: d, class: 'm-road' }, true)); });
    z.appendChild(el('path', { d: A.gpaz, class: 'm-gpaz' }, true));
    z.appendChild(el('path', { d: A.riach, class: 'm-river' }, true));
    z.appendChild(el('path', { d: A.coast, class: 'm-coast' }, true));
    A.labels.forEach(function (lb) { var t = el('text', { x: lb.x, y: lb.y, class: 'm-label ' + lb.k, 'text-anchor': 'middle' }, true); t.textContent = lb.t; z.appendChild(t); });
    D.locs.filter(function (l) { return l.amba; }).forEach(function (l) {
      z.appendChild(pinNode(l, l.ax, l.ay, 1.15));
      var t = el('text', { x: l.ax + 13, y: l.ay - 12, class: 'm-label', 'font-size': 15 }, true); t.textContent = l.name.replace('Auto Weiss ', '').replace('Weiss ', ''); z.appendChild(t);
    });
    mapAmba.appendChild(z);

    /* lista */
    var ORDER = ['Buenos Aires','Costa','Centro','Norte','Cuyo','Patagonia','Uruguay'];
    var listBtns = {};
    ORDER.forEach(function (reg) {
      var ls = D.locs.filter(function (l) { return l.region === reg; }); if (!ls.length) return;
      var grp = el('div', { class: 'lista__grp' });
      var h = el('h4'); h.textContent = reg; grp.appendChild(h);
      ls.forEach(function (l) {
        var b = el('button', { type: 'button' }); var short = l.name.replace(/^Weiss /, ''), city = l.city.split(',')[0]; b.innerHTML = short + (city !== short ? '<span>' + city + '</span>' : '');
        b.addEventListener('click', function () { select(l.id, 'list'); });
        grp.appendChild(b); listBtns[l.id] = b;
      });
      lista.appendChild(grp);
    });

    var tabs = $$('.locales__tabs button');
    function tabMode() { return window.matchMedia('(max-width: 900px)').matches; }
    function setView(v) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.view === v ? 'true' : 'false'); });
      mapAr.classList.toggle('is-hidden', tabMode() && v !== 'ar');
      mapAmba.classList.toggle('is-hidden', tabMode() && v !== 'amba');
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { setView(t.dataset.view); }); });
    function showAmba(flash) {
      if (tabMode()) setView('amba');
      if (flash) { mapAmba.classList.remove('flash'); void mapAmba.offsetWidth; mapAmba.classList.add('flash'); }
      if (tabMode()) mapAmba.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    window.addEventListener('resize', function () { var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]; setView(cur ? cur.dataset.view : 'ar'); });

    function select(id, user) {
      var l = D.locs.filter(function (x) { return x.id === id; })[0]; if (!l) return;
      Object.keys(pinsById).forEach(function (k) { pinsById[k].forEach(function (p) { p.classList.toggle('is-on', k === id); }); });
      Object.keys(listBtns).forEach(function (k) { listBtns[k].setAttribute('aria-current', k === id ? 'true' : 'false'); });
      var q = l.addr.indexOf('[') === 0 ? 'Weiss Burger ' + l.city : 'Weiss Burger ' + l.addr.replace(/·.*$/, '') + ', ' + l.city;
      var eyebrow = l.id === 'bariloche' ? 'Donde empezó todo · 2018' : l.region;
      card.innerHTML = '<span class="eyebrow">' + eyebrow + '</span><h3>' + l.name.toUpperCase() + '</h3><p>' + l.city + '</p><p class="addr">' + l.addr + '</p>' +
        '<div class="card__btns"><a class="btn btn--mostaza" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) + '">Cómo llegar</a>' +
        '<a class="btn btn--ghost" target="_blank" rel="noopener" href="https://linktr.ee/weissburger">Pedir</a></div>';
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
      if (user) {
        if (tabMode()) setView(l.amba ? 'amba' : 'ar');
        if (user === true && !l.fromList && mqMobile.matches) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (user === 'list') card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setView('ar');
    select('bariloche', false);

    /* pins entran animados */
    var sec = $('#locales');
    function dropPins() {
      $$('.pin, .cluster', sec).forEach(function (p, k) { p.style.animationDelay = (k * 0.05) + 's'; p.classList.add('pin-in'); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { dropPins(); ob.disconnect(); } }); }, { threshold: 0.2 }).observe(sec);
    } else dropPins();
  })();

  /* ---------- GALERÍA: arrastrar con mouse ---------- */
  (function () {
    var g = $('#galeria'); if (!g) return;
    var down = false, x0 = 0, s0 = 0;
    g.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = g.scrollLeft; g.style.scrollSnapType = 'none'; });
    window.addEventListener('pointermove', function (e) { if (down) g.scrollLeft = s0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { if (down) { down = false; g.style.scrollSnapType = ''; } });
  })();

  /* ---------- reveal + año ---------- */
  $$('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });
  var rv = $$('.historia__head, .timeline, .historia__stats, .locales__head, .franq__copy, .carta__head, .mes__copy');
  if ('IntersectionObserver' in window) {
    rv.forEach(function (n) { n.classList.add('rv'); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.15 });
    rv.forEach(function (n) { io.observe(n); });
  }
})();
