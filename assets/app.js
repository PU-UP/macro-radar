/* ============================================================
   宏观观察 Macro Observer · 运行时
   零依赖 SVG 图表引擎 + 交互装配
   ============================================================ */
(function () {
  'use strict';

  var D = window.MACRO;
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  var TONE = {
    cn:   'var(--cn)',
    us:   'var(--us)',
    risk: 'var(--risk)',
    ink:  'var(--ink-2)',
    global: 'var(--risk)'
  };

  /* ---------------- 工具 ---------------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function color(t) { return TONE[t] || TONE.ink; }

  function fmtNum(v) {
    if (v == null || isNaN(v)) return '—';
    var a = Math.abs(v);
    var s = (Math.round(v * 100) / 100).toString();
    if (a > 0 && a < 1) s = s.replace(/^0/, '');
    return s;
  }
  function fmtTick(v) {
    return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1);
  }
  function niceTicks(min, max, count) {
    var span = max - min;
    if (span <= 0) return [min];
    var raw = span / count;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    var start = Math.ceil(min / step) * step;
    var out = [];
    for (var v = start; v <= max + step * 1e-6; v += step) out.push(+v.toPrecision(12));
    return out;
  }
  function segments(data) {
    var segs = [], cur = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i] == null) { if (cur.length) segs.push(cur); cur = []; }
      else cur.push(i);
    }
    if (cur.length) segs.push(cur);
    return segs;
  }

  /* ---------------- 通用坐标 ---------------- */
  function buildFrame(host, cfg, pad) {
    var W = host.clientWidth, H = host.clientHeight;
    if (W < 40 || H < 40) return null;

    var hasRight = cfg.series.some(function (s) { return s.axis === 'right'; });
    var padL = pad.left, padR = hasRight ? 48 : 18, padT = 16, padB = pad.bottom;

    var left = [], right = [];
    cfg.series.forEach(function (s) {
      var arr = s.axis === 'right' ? right : left;
      s.data.forEach(function (v) { if (v != null) arr.push(v); });
    });
    var all = left.concat(right);
    if (!all.length) return null;

    var dMin = cfg.yMin != null ? cfg.yMin : Math.min.apply(null, all);
    var dMax = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, all);
    if (cfg.yMin == null) dMin -= (dMax - dMin) * 0.12;
    if (cfg.yMax == null) dMax += (dMax - dMin) * 0.12;

    var iw = W - padL - padR, ih = H - padT - padB;
    var ticks = niceTicks(dMin, dMax, 5);

    function yOf(v) { return padT + ih - (v - dMin) / (dMax - dMin) * ih; }
    function xOf(i) {
      var n = cfg.x.length;
      /* 柱状图用槽位居中：首尾柱完整落在绘图区内，不侵入左侧坐标轴槽 */
      if (cfg.type === 'bar') return padL + (i + 0.5) * iw / n;
      return n === 1 ? padL + iw / 2 : padL + i * iw / (n - 1);
    }
    return { W: W, H: H, padL: padL, padR: padR, padT: padT, padB: padB, iw: iw, ih: ih,
             dMin: dMin, dMax: dMax, ticks: ticks, yOf: yOf, xOf: xOf, hasRight: hasRight };
  }

  function drawGrid(root, f, cfg) {
    var g = svg('g');
    f.ticks.forEach(function (t) {
      var y = f.yOf(t);
      g.appendChild(svg('line', { class: 'grid-line', x1: f.padL, x2: f.padL + f.iw, y1: y, y2: y }));
      var lab = svg('text', { class: 'axis-label', x: f.padL - 9, y: y + 3.5, 'text-anchor': 'end' });
      lab.textContent = fmtTick(t);
      g.appendChild(lab);
    });
    root.appendChild(g);
  }

  function drawRefLines(root, f, cfg) {
    if (!cfg.refLines) return;
    cfg.refLines.forEach(function (r) {
      if (r.value < f.dMin || r.value > f.dMax) return;
      var y = f.yOf(r.value);
      root.appendChild(svg('line', {
        class: 'ref-line', x1: f.padL, x2: f.padL + f.iw, y1: y, y2: y,
        stroke: color(r.tone)
      }));
    });
  }

  /* 参考线标签单独一层，在数据之后绘制，避免被柱子/折线压住 */
  function drawRefLabels(root, f, cfg) {
    if (!cfg.refLines) return;
    cfg.refLines.forEach(function (r) {
      if (r.value < f.dMin || r.value > f.dMax) return;
      var y = f.yOf(r.value);
      var anchor = r.anchor || 'end';
      var x = anchor === 'start' ? f.padL + 6 : f.padL + f.iw;
      var w = 0;
      for (var i = 0; i < r.label.length; i++) {
        w += r.label.charCodeAt(i) > 0x2e80 ? 10.5 : 6.2;
      }
      var rx = anchor === 'start' ? x - 4 : x - w - 4;
      root.appendChild(svg('rect', {
        x: rx, y: y - 18, width: w + 8, height: 14,
        fill: 'var(--card)', opacity: .92, rx: 1
      }));
      var lab = svg('text', { class: 'ref-label', x: x, y: y - 7, 'text-anchor': anchor });
      lab.textContent = r.label;
      root.appendChild(lab);
    });
  }

  function drawXLabels(root, f, cfg, anchor) {
    var g = svg('g');
    cfg.x.forEach(function (label, i) {
      var x = f.xOf(i);
      var lines = String(label).split('\n');
      var t = svg('text', {
        class: 'axis-label-x', x: x, y: f.padT + f.ih + 16,
        'text-anchor': anchor === 'middle' ? 'middle' : 'middle'
      });
      lines.forEach(function (ln, k) {
        var ts = svg('tspan', { x: x, dy: k === 0 ? 0 : 13 });
        ts.textContent = ln;
        t.appendChild(ts);
      });
      g.appendChild(t);
    });
    root.appendChild(g);
  }

  /* ---------------- 折线图 ---------------- */
  function renderLine(host, cfg) {
    var f = buildFrame(host, cfg, { left: 46, bottom: cfg.x.some(function (l) { return String(l).indexOf('\n') >= 0; }) ? 42 : 30 });
    if (!f) return;

    var root = svg('svg', { viewBox: '0 0 ' + f.W + ' ' + f.H, width: f.W, height: f.H,
                             role: 'img', 'aria-label': cfg.aria || '折线图' });
    drawGrid(root, f, cfg);
    drawRefLines(root, f, cfg);
    drawXLabels(root, f, cfg);

    var defs = svg('defs');
    root.appendChild(defs);

    cfg.series.forEach(function (s, si) {
      var c = color(s.color);
      var segs = segments(s.data);

      /* 面积填充（仅首条主序列） */
      if (s.fill) {
        segs.forEach(function (seg) {
          if (seg.length < 2) return;
          var base = f.yOf(Math.max(f.dMin, Math.min(0, f.dMax)));
          var d = 'M' + f.xOf(seg[0]) + ',' + base;
          seg.forEach(function (i) { d += ' L' + f.xOf(i) + ',' + f.yOf(s.data[i]); });
          d += ' L' + f.xOf(seg[seg.length - 1]) + ',' + base + ' Z';
          var gid = 'grad' + (++uid);
          var lg = svg('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
          lg.appendChild(svg('stop', { offset: '0%', 'stop-color': c, 'stop-opacity': .22 }));
          lg.appendChild(svg('stop', { offset: '100%', 'stop-color': c, 'stop-opacity': .01 }));
          defs.appendChild(lg);
          root.appendChild(svg('path', { d: d, fill: 'url(#' + gid + ')', stroke: 'none' }));
        });
      }

      segs.forEach(function (seg) {
        var d = '';
        seg.forEach(function (i, k) {
          d += (k ? ' L' : 'M') + f.xOf(i) + ',' + f.yOf(s.data[i]);
        });
        var p = svg('path', {
          class: 'series-line', d: d, stroke: c,
          'stroke-width': s.width || 2,
          'stroke-dasharray': s.dash || null
        });
        root.appendChild(p);
        if (si === 0) {
          try {
            var len = p.getTotalLength();
            if (len > 0) {
              p.style.setProperty('--len', len);
              p.classList.add('draw-in');
              p.style.animationDelay = (si * 90) + 'ms';
            }
          } catch (e) { /* noop */ }
        }
      });

      s.data.forEach(function (v, i) {
        if (v == null) return;
        root.appendChild(svg('circle', {
          class: 'dot', cx: f.xOf(i), cy: f.yOf(v), r: si === 0 ? 3.4 : 2.6, fill: c
        }));
      });
    });

    drawRefLabels(root, f, cfg);

    /* 十字线 + 命中层 */
    var cross = svg('line', { class: 'crosshair', y1: f.padT, y2: f.padT + f.ih, x1: 0, x2: 0 });
    root.appendChild(cross);
    var hit = svg('rect', { class: 'hit', x: f.padL - 6, y: f.padT, width: f.iw + 12, height: f.ih });
    root.appendChild(hit);

    host.appendChild(root);
    bindIndexHover(host, root, f, cfg, cross);
  }

  /* ---------------- 柱状图（纵向） ---------------- */
  function renderBar(host, cfg) {
    var f = buildFrame(host, cfg, { left: 46, bottom: cfg.x.some(function (l) { return String(l).indexOf('\n') >= 0; }) ? 42 : 30 });
    if (!f) return;

    var root = svg('svg', { viewBox: '0 0 ' + f.W + ' ' + f.H, width: f.W, height: f.H,
                             role: 'img', 'aria-label': cfg.aria || '柱状图' });
    drawGrid(root, f, cfg);
    drawRefLines(root, f, cfg);
    drawXLabels(root, f, cfg);

    var s = cfg.series[0];
    var c = color(s.color);
    var n = cfg.x.length;
    var slot = f.iw / n;
    var bw = Math.min(slot * 0.54, 54);
    var zero = f.yOf(Math.max(f.dMin, Math.min(0, f.dMax)));

    var bars = [];
    s.data.forEach(function (v, i) {
      if (v == null) return;
      var x = f.xOf(i) - bw / 2;
      var yv = f.yOf(v);
      var y = Math.min(yv, zero), h = Math.abs(yv - zero);
      var bar = svg('rect', { class: 'bar', x: x, y: y, width: bw, height: Math.max(h, 1), fill: c, rx: 1 });
      bar.style.transformBox = 'fill-box';
      bar.style.transformOrigin = v >= 0 ? 'bottom' : 'top';
      bar.style.animationDelay = (i * 45) + 'ms';
      bar.classList.add('bar-grow');
      root.appendChild(bar);
      bars.push(bar);

      var mark = s.marks && s.marks[i] ? s.marks[i] : '';
      var t = svg('text', { class: 'bar-label', x: f.xOf(i), y: v >= 0 ? yv - 9 : yv + 16, 'text-anchor': 'middle' });
      t.textContent = fmtNum(v);
      root.appendChild(t);
      if (mark) {
        var mt = svg('text', { class: 'mark-label', x: f.xOf(i), y: v >= 0 ? yv - 20 : yv + 27, 'text-anchor': 'middle' });
        mt.textContent = mark;
        root.appendChild(mt);
      }
    });

    /* 命中层：整列热区，同时驱动柱体高亮 */
    var hitLayer = svg('g');
    var tip = makeTip(host);
    s.data.forEach(function (v, i) {
      if (v == null) return;
      var hl = svg('rect', { class: 'hit', x: f.xOf(i) - slot / 2, y: f.padT, width: slot, height: f.ih });
      hitLayer.appendChild(hl);
      hl.addEventListener('mouseenter', function () {
        if (bars[i]) bars[i].classList.add('is-hot');
        tip.show(host, cfg.x[i], [{
          name: s.name,
          value: fmtNum(v) + (cfg.unit ? ' ' + cfg.unit : '') + (s.marks && s.marks[i] ? '（' + s.marks[i] + '）' : '')
        }], f.xOf(i), f.yOf(v));
      });
      hl.addEventListener('mouseleave', function () {
        if (bars[i]) bars[i].classList.remove('is-hot');
        tip.hide();
      });
    });
    root.appendChild(hitLayer);
    drawRefLabels(root, f, cfg);

    host.appendChild(root);
  }

  /* ---------------- 条形图（横向） ---------------- */
  function renderHBar(host, cfg) {
    var s = cfg.series[0];
    var W = host.clientWidth, H = host.clientHeight;
    if (W < 60 || H < 60) return;

    var items = s.data;
    var padL = 132, padR = 46, padT = 8, padB = 22;
    var iw = W - padL - padR, ih = H - padT - padB;
    var vals = items.map(function (d) { return d.value; });
    var dMin = cfg.yMin != null ? cfg.yMin : Math.min.apply(null, vals);
    var dMax = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, vals);
    var ticks = niceTicks(dMin, dMax, 4);
    var zeroX = padL + (0 - dMin) / (dMax - dMin) * iw;
    var rowH = ih / items.length;

    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H,
                             role: 'img', 'aria-label': cfg.aria || '横向条形图' });

    ticks.forEach(function (t) {
      var x = padL + (t - dMin) / (dMax - dMin) * iw;
      root.appendChild(svg('line', { class: 'grid-line', x1: x, x2: x, y1: padT, y2: padT + ih }));
      var lab = svg('text', { class: 'axis-label', x: x, y: H - 6, 'text-anchor': 'middle' });
      lab.textContent = fmtTick(t);
      root.appendChild(lab);
    });
    root.appendChild(svg('line', { class: 'axis-line', x1: zeroX, x2: zeroX, y1: padT, y2: padT + ih }));

    var c = color(s.color);
    var tip = makeTip(host);

    items.forEach(function (d, i) {
      var y = padT + i * rowH;
      var bh = Math.min(rowH * 0.62, 24);
      var by = y + (rowH - bh) / 2;
      var x = d.value >= 0 ? zeroX : zeroX - Math.abs(d.value) / (dMax - dMin) * iw;
      var bw = Math.abs(d.value) / (dMax - dMin) * iw;

      var lab = svg('text', { class: 'cat-label', x: padL - 10, y: by + bh / 2 + 4, 'text-anchor': 'end' });
      lab.textContent = d.label;
      root.appendChild(lab);

      var bar = svg('rect', {
        class: 'bar', x: x, y: by, width: Math.max(bw, 1), height: bh,
        fill: d.value >= 0 ? c : 'var(--risk)', rx: 1
      });
      bar.style.transformBox = 'fill-box';
      bar.style.transformOrigin = d.value >= 0 ? 'left' : 'right';
      bar.style.animationDelay = (i * 40) + 'ms';
      bar.classList.add('bar-grow');
      root.appendChild(bar);

      /* 负值标签贴零轴右侧：条形向左延伸，若跟随条形末端左排会与分类标签重叠 */
      var vtxt = (d.value > 0 ? '+' : '') + fmtNum(d.value);
      var vt = svg('text', {
        class: 'bar-label',
        x: d.value >= 0 ? x + bw + 7 : zeroX + 7,
        y: by + bh / 2 + 4,
        'text-anchor': 'start'
      });
      vt.textContent = vtxt;
      root.appendChild(vt);

      bar.addEventListener('mouseenter', function () {
        tip.show(host, d.label, [{ name: s.name, value: (d.value > 0 ? '+' : '') + fmtNum(d.value) + (cfg.unit ? ' ' + cfg.unit : '') }],
                 x + bw / 2, by);
      });
      bar.addEventListener('mouseleave', tip.hide);
    });

    host.appendChild(root);
  }

  /* ---------------- 提示框 ---------------- */
  function makeTip(host) {
    var tip = el('div', 'chart-tip');
    host.appendChild(tip);
    return {
      show: function (h, head, rows, px, py) {
        tip.innerHTML = '';
        var hEl = el('span', 'tip-head', head);
        tip.appendChild(hEl);
        rows.forEach(function (r) {
          var line = el('div');
          line.appendChild(el('span', '', r.name + '　'));
          var b = el('b', '', r.value);
          line.appendChild(b);
          tip.appendChild(line);
        });
        tip.classList.add('is-on');
        tip.style.left = px + 'px';
        tip.style.top = py + 'px';
      },
      hide: function () { tip.classList.remove('is-on'); }
    };
  }

  /* ---------------- 折线图悬停 / 键盘 ---------------- */
  function bindIndexHover(host, root, f, cfg, cross) {
    var tip = makeTip(host);
    var live = el('div', 'sr-only');
    live.setAttribute('aria-live', 'polite');
    host.appendChild(live);

    var active = -1;

    function setIndex(i) {
      if (i < 0 || i >= cfg.x.length) return;
      active = i;
      var x = f.xOf(i);
      cross.setAttribute('x1', x);
      cross.setAttribute('x2', x);
      cross.style.opacity = '.75';
      var rows = [];
      var topY = Infinity;
      cfg.series.forEach(function (s) {
        var v = s.data[i];
        if (v == null) return;
        var shown = (s.raw && s.raw[i] != null) ? s.raw[i] : v;
        var unit = s.unit || cfg.unit;
        rows.push({ name: s.name, value: fmtNum(shown) + (unit ? ' ' + unit : '') });
        topY = Math.min(topY, f.yOf(v));
      });
      tip.show(host, cfg.x[i], rows, x, topY === Infinity ? f.padT : topY);
      live.textContent = cfg.x[i] + '：' + rows.map(function (r) { return r.name + ' ' + r.value; }).join('，');
    }
    function clear() {
      active = -1;
      cross.style.opacity = '0';
      tip.hide();
    }

    root.addEventListener('mousemove', function (e) {
      var box = root.getBoundingClientRect();
      var px = (e.clientX - box.left) * (f.W / box.width);
      var rel = (px - f.padL) / (f.iw || 1);
      var i = Math.round(rel * (cfg.x.length - 1));
      i = Math.max(0, Math.min(cfg.x.length - 1, i));
      setIndex(i);
    });
    root.addEventListener('mouseleave', clear);

    host.setAttribute('tabindex', '0');
    host.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { setIndex(Math.min(cfg.x.length - 1, (active < 0 ? -1 : active) + 1)); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { setIndex(Math.max(0, (active < 0 ? cfg.x.length : active) - 1)); e.preventDefault(); }
      else if (e.key === 'Escape') { clear(); }
    });
    host.addEventListener('blur', clear);
  }

  /* ---------------- 图例 ---------------- */
  function buildLegend(host, cfg) {
    if (!cfg.series || cfg.series.length < 1) return;
    var box = el('div', 'chart-legend');
    cfg.series.forEach(function (s) {
      var sp = el('span');
      var i = el('i');
      i.style.background = color(s.color);
      if (s.dash) { i.className = 'dashed'; i.style.color = color(s.color); }
      sp.appendChild(i);
      sp.appendChild(document.createTextNode(s.name));
      box.appendChild(sp);
    });
    if (host.parentNode) host.parentNode.insertBefore(box, host.nextSibling);
  }

  /* ---------------- 渲染调度 ---------------- */
  var RENDERERS = { line: renderLine, bar: renderBar, hbar: renderHBar };

  function renderOne(host) {
    var key = host.getAttribute('data-chart');
    var cfg = D.charts[key];
    if (!cfg) return;
    var old = host.querySelector('svg');
    if (old) old.remove();
    var oldTip = host.querySelector('.chart-tip');
    if (oldTip) oldTip.remove();
    var oldLegend = host.parentNode && host.parentNode.querySelector('.chart-legend');
    if (oldLegend) oldLegend.remove();

    (RENDERERS[cfg.type] || renderLine)(host, cfg);
    buildLegend(host, cfg);
  }

  /* ---------------- KPI ---------------- */
  function renderKpis(filter) {
    var grid = document.getElementById('kpi-grid');
    if (!grid) return;
    grid.innerHTML = '';
    D.kpis.forEach(function (k) {
      if (filter !== 'all' && k.g !== filter) return;
      var card = el('div', 'kpi');
      card.setAttribute('data-g', k.g);
      var name = el('div', 'kpi-name', k.name);
      var val = el('div', 'kpi-value');
      val.appendChild(document.createTextNode(k.value));
      val.appendChild(el('span', 'u', k.unit));
      card.appendChild(name);
      card.appendChild(val);
      card.appendChild(el('div', 'kpi-foot', k.foot));
      card.appendChild(el('div', 'kpi-src', k.src));
      grid.appendChild(card);
    });
  }

  /* ---------------- 状态仪表 ---------------- */
  function renderGauges() {
    var box = document.getElementById('gauges');
    if (!box) return;
    D.gauges.forEach(function (g) {
      var w = el('div', 'gauge');
      w.setAttribute('data-tone', g.tone);
      w.setAttribute('role', 'listitem');
      var top = el('div', 'gauge-top');
      top.appendChild(el('span', 'gauge-label', g.label));
      top.appendChild(el('span', 'gauge-state', g.state));
      w.appendChild(top);
      var meter = el('div', 'gauge-meter');
      meter.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 5; i++) {
        var seg = el('i');
        if (i < g.level) seg.className = 'on';
        meter.appendChild(seg);
      }
      w.appendChild(meter);
      w.appendChild(el('p', 'gauge-note', g.note));
      box.appendChild(w);
    });
  }

  /* ---------------- 景气统计 ---------------- */
  function renderPmiStats() {
    var box = document.getElementById('pmi-stats');
    if (!box) return;
    D.pmiStats.forEach(function (s) {
      var w = el('div', 'stat');
      w.appendChild(el('div', 'stat-k', s.k));
      w.appendChild(el('div', 'stat-v', s.v));
      w.appendChild(el('div', 'stat-s', s.s));
      box.appendChild(w);
    });
  }

  /* ---------------- 需求表 ---------------- */
  function renderDemandTable() {
    var t = document.getElementById('table-demand');
    if (!t) return;
    var thead = el('thead');
    var tr = el('tr');
    D.demandTable.head.forEach(function (h) { tr.appendChild(el('th', '', h)); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tbody = el('tbody');
    D.demandTable.rows.forEach(function (r) {
      var row = el('tr');
      r.forEach(function (cell) { row.appendChild(el('td', '', cell)); });
      tbody.appendChild(row);
    });
    t.appendChild(tbody);
  }

  /* ---------------- 全球事实卡 ---------------- */
  function renderGlobalFacts() {
    var box = document.getElementById('global-facts');
    if (!box) return;
    D.globalFacts.forEach(function (g) {
      var c = el('div', 'global-fact');
      c.appendChild(el('h3', '', g.h));
      c.appendChild(el('p', '', g.p));
      box.appendChild(c);
    });
  }

  /* ---------------- 时间线 ---------------- */
  function renderTimeline() {
    var box = document.getElementById('timeline');
    if (!box) return;
    D.timeline.forEach(function (t) {
      var li = el('li', 'tl-item');
      li.setAttribute('data-tone', t.tone);
      if (t.future) li.setAttribute('data-future', 'true');
      li.appendChild(el('div', 'tl-date', t.d));
      var body = el('div', 'tl-body');
      var meta = el('div', 'tl-meta');
      meta.appendChild(el('span', 'tl-tag', t.tag));
      body.appendChild(meta);
      body.appendChild(el('div', 'tl-title', t.t));
      body.appendChild(el('p', '', t.body));
      li.appendChild(body);
      box.appendChild(li);
    });
  }

  /* ---------------- 展望卡 ---------------- */
  function renderRisks() {
    var box = document.getElementById('risk-grid');
    if (!box) return;
    D.risks.forEach(function (r) {
      var c = el('div', 'risk-card');
      c.appendChild(el('span', 'risk-tag', r.tag));
      c.appendChild(el('h3', '', r.h));
      c.appendChild(el('p', '', r.p));
      box.appendChild(c);
    });
  }

  /* ---------------- 主题 ---------------- */
  function initTheme() {
    var btn = document.getElementById('theme-btn');
    var label = document.getElementById('theme-label');
    var stored = null;
    try { stored = localStorage.getItem('macro-theme'); } catch (e) { stored = null; }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = stored || (prefersDark ? 'dark' : 'light');
    apply(mode);

    function apply(m) {
      document.documentElement.setAttribute('data-theme', m);
      if (btn) {
        btn.setAttribute('aria-pressed', m === 'dark' ? 'true' : 'false');
        btn.setAttribute('aria-label', m === 'dark' ? '切换到纸面模式' : '切换到终端模式');
      }
      if (label) label.textContent = m === 'dark' ? '纸面' : '终端';
    }
    if (btn) {
      btn.addEventListener('click', function () {
        var m = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(m);
        try { localStorage.setItem('macro-theme', m); } catch (e) { /* noop */ }
        renderAll();
      });
    }
  }

  /* ---------------- 揭示动效 ---------------- */
  function initReveal() {
    var targets = document.querySelectorAll('.section-head, .panel, .kpi-grid, .stat-row, .risk-grid, .timeline, .grid-3');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (t) { t.classList.add('reveal', 'is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .04 });
    Array.prototype.forEach.call(targets, function (t) {
      t.classList.add('reveal');
      io.observe(t);
    });
  }

  /* ---------------- 导航高亮 ---------------- */
  function initNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.masthead-nav a'));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    if (!secs.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + en.target.id ? 'var(--cn)' : '';
          a.style.background = a.getAttribute('href') === '#' + en.target.id ? 'var(--cn-soft)' : '';
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- 渲染全部 ---------------- */
  function renderAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.chart[data-chart]'), renderOne);
  }

  function init() {
    initTheme();
    renderGauges();
    renderKpis('all');
    renderPmiStats();
    renderDemandTable();
    renderGlobalFacts();
    renderTimeline();
    renderRisks();
    renderAll();
    initReveal();
    initNav();
    var chips = Array.prototype.slice.call(document.querySelectorAll('.kpi-filters .chip'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.classList.remove('is-active'); });
        c.classList.add('is-active');
        renderKpis(c.getAttribute('data-filter'));
      });
    });

    /* 尺寸自适应 */
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(renderAll, 160);
    });

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        clearTimeout(rt);
        rt = setTimeout(renderAll, 140);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.chart[data-chart]'), function (c) { ro.observe(c); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
