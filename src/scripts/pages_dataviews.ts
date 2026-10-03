import { hasUsableHeatReadings } from "./ui/chart-availability";
import { chartData, type ChartData, type ChartPoint } from "./data";
import { required } from "./dom";
/* Data Hub views use live JSON. Readers choose a chart explicitly; optional
   explanations appear beside its values without obscuring or disabling them. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const HEAT = ["#1b6e3c", "#5fae4e", "#f2d434", "#f39a2b", "#d73a2a"];
  const MON = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function el<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Record<string, string | number>,
    parent?: SVGElement,
    text?: string,
  ) {
    const n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, String(attrs[k]));
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function kw(v: number) {
    return Math.round(v).toLocaleString("en-US") + " kW";
  }
  function hourLabel(h: number) {
    return h === 0
      ? "12am"
      : h === 12
        ? "noon"
        : (h % 12) + (h < 12 ? "am" : "pm");
  }
  function dayLabel(d: string) {
    return MON[+d.slice(5, 7) - 1] + " " + +d.slice(8, 10);
  }
  function wide(s: SVGElement, texts: string[]) {
    return Math.max.apply(
      null,
      texts.map(function (t) {
        const n = el("text", { class: "dv-ax" }, s, t);
        const w = n.getComputedTextLength();
        s.removeChild(n);
        return w;
      }),
    );
  }
  function niceStep(r: number) {
    const p = Math.pow(10, Math.floor(Math.log10(r)));
    const m = r / p;
    return p * (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10);
  }
  function svgFor(box: HTMLElement) {
    const W = Math.max(240, box.clientWidth);
    const H = Math.max(150, box.clientHeight);
    const s = el("svg", {
      viewBox: "0 0 " + W + " " + H,
      width: W,
      height: H,
      role: "img",
    });
    box.textContent = "";
    box.appendChild(s);
    return { s: s, W: W, H: H };
  }

  function drawHeat(box: HTMLElement, j: ChartData) {
    if (!hasUsableHeatReadings(j)) throw new Error("No usable heatmap readings");
    const pts = (j.data && j.data[0] && j.data[0].data) || [];
    const days: Record<string, Record<number, ChartPoint>> = {};
    const order: string[] = [];
    pts.forEach(function (p) {
      const d = p.timestamp.slice(0, 10);
      if (!days[d]) {
        days[d] = {};
        order.push(d);
      }
      days[d][+p.timestamp.slice(11, 13)] = p;
    });
    order.sort().reverse();
    const g = svgFor(box);
    const s = g.s;
    const T = 16;
    const B = 26;
    const R = 2;
    const L = Math.ceil(wide(s, order.map(dayLabel))) + 10;
    const cw = (g.W - L - R) / 24;
    const ch = (g.H - T - B) / order.length;
    s.setAttribute(
      "aria-label",
      "Heat map of whole city electricity use by hour for the last " +
        order.length +
        " days",
    );
    [0, 6, 12, 18].forEach(function (h) {
      el("text", { x: L + h * cw, y: 12, class: "dv-ax" }, s, hourLabel(h));
    });
    let every = Math.max(1, Math.ceil(17 / ch));
    if (every > 1) every = Math.ceil(every / 7) * 7;
    order.forEach(function (d, r) {
      const y = T + r * ch;
      if (r % every === 0)
        el(
          "text",
          {
            x: L - 6,
            y: y + Math.min(ch, 14) - 2,
            class: "dv-ax",
            "text-anchor": "end",
          },
          s,
          dayLabel(d),
        );
      for (var h = 0; h < 24; h++) {
        const p = days[d][h];
        const c = el(
          "rect",
          {
            x: L + h * cw,
            y: y,
            width: cw + 0.4,
            height: ch + 0.4,
            fill:
              p && p.storageValue != null && p.binPosition
                ? HEAT[p.binPosition - 1]
                : "#eef1ef",
          },
          s,
        );
        if (p && p.storageValue != null)
          el(
            "title",
            {},
            c,
            dayLabel(d) +
              ", " +
              hourLabel(h) +
              ": " +
              kw(required(p.storageValue)),
          );
      }
    });
    const bins = j.bins || [];
    const ly = g.H - 14;
    const sw = 22;
    let lo = "Low" + (bins.length ? " " + kw(bins[0]) : "");
    let hi = "High" + (bins.length ? " " + kw(bins[bins.length - 1]) : "");
    if (wide(s, [lo]) + wide(s, [hi]) + 5 * sw + 16 > g.W - L) {
      lo = "Low";
      hi = "High";
    }
    const lx = L + wide(s, [lo]) + 6;
    el("text", { x: L, y: ly + 9, class: "dv-ax" }, s, lo);
    HEAT.forEach(function (c, i) {
      el(
        "rect",
        { x: lx + i * sw, y: ly, width: sw - 2, height: 10, rx: 2, fill: c },
        s,
      );
    });
    el("text", { x: lx + 5 * sw + 4, y: ly + 9, class: "dv-ax" }, s, hi);
    return s;
  }

  function drawLoad(box: HTMLElement, j: ChartData) {
    const pts = (j.data && j.data[0] && j.data[0].data) || [];
    const vals: number[] = [];
    pts.forEach(function (p) {
      if (p.storageValue != null) vals.push(p.storageValue);
      if (p.typicalValue != null) vals.push(p.typicalValue);
    });
    if (!vals.length) throw new Error("empty");
    let lo = Math.min.apply(null, vals);
    let hi = Math.max.apply(null, vals);
    const pad = (hi - lo) * 0.12 || 1;
    lo = Math.max(0, lo - pad);
    hi += pad;
    const step = niceStep((hi - lo) / 3);
    const ticks = [];
    for (var t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);
    function num(v: number) {
      return Math.round(v).toLocaleString("en-US");
    }
    const g = svgFor(box);
    const s = g.s;
    const T = 24;
    const B = 20;
    const R = 10;
    const L = Math.ceil(wide(s, ticks.map(num))) + 10;
    const W = g.W - L - R;
    const Hh = g.H - T - B;
    const n = pts.length - 1;
    function X(i: number) {
      return L + (W * i) / n;
    }
    function Y(v: number) {
      return T + Hh * (1 - (v - lo) / (hi - lo));
    }
    s.setAttribute(
      "aria-label",
      "Load profile of whole city electricity today, compared with typical use",
    );
    ticks.forEach(function (v) {
      const y = Y(v);
      el("line", { x1: L, x2: L + W, y1: y, y2: y, class: "dv-grid" }, s);
      el(
        "text",
        { x: L - 6, y: y + 4, class: "dv-ax", "text-anchor": "end" },
        s,
        num(v),
      );
    });
    el("text", { x: 2, y: 12, class: "dv-ax" }, s, "kW");
    [0, 6, 12, 18, 24].forEach(function (h) {
      el(
        "text",
        {
          x: X(Math.min(n, h * 4)),
          y: g.H - 4,
          class: "dv-ax",
          "text-anchor": h === 0 ? "start" : h === 24 ? "end" : "middle",
        },
        s,
        hourLabel(h % 24),
      );
    });
    let area = "M" + X(0) + " " + (T + Hh);
    let line = "";
    let last = -1;
    pts.forEach(function (p, i) {
      if (p.typicalValue != null) area += "L" + X(i) + " " + Y(p.typicalValue);
      if (p.storageValue != null) {
        line += (line ? "L" : "M") + X(i) + " " + Y(required(p.storageValue));
        last = i;
      }
    });
    area += "L" + X(n) + " " + (T + Hh) + "Z";
    el("path", { d: area, class: "dv-typ" }, s);
    if (line) el("path", { d: line, class: "dv-today" }, s);
    if (last >= 0) {
      const p = pts[last];
      const cx = X(last);
      const cy = Y(required(p.storageValue));
      el("circle", { cx: cx, cy: cy, r: 4, class: "dv-now" }, s);
      el(
        "text",
        {
          x: cx + (last > n * 0.7 ? -8 : 8),
          y: cy - 8,
          class: "dv-ax dv-strong",
          "text-anchor": last > n * 0.7 ? "end" : "start",
        },
        s,
        "Now " + kw(required(p.storageValue)),
      );
    }
    const lg = el("g", { transform: "translate(" + (L + W) + ",8)" }, s);
    el("rect", { x: -150, y: -6, width: 12, height: 8, class: "dv-typ" }, lg);
    el("text", { x: -134, y: 2, class: "dv-ax" }, lg, "Typical");
    el("line", { x1: -70, x2: -56, y1: -2, y2: -2, class: "dv-today" }, lg);
    el("text", { x: -50, y: 2, class: "dv-ax" }, lg, "Today");
    return s;
  }

  const DRAW = { heat: drawHeat, load: drawLoad };
  const cache: Record<string, Promise<ChartData>> = {};

  function render(box: HTMLElement) {
    const kind = box.hasAttribute("data-dv-heat") ? "heat" : "load";
    const url = required(box.getAttribute("data-dv-" + kind));
    if (!box.offsetWidth) return;
    const p = (cache[url] =
      cache[url] ||
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json().then(chartData);
      }));
    p
      .then(function (j) {
        DRAW[kind](box, j);
        box.dataset.done = String(box.offsetWidth);
      })
      .catch(function (error: unknown) {
        if (cache[url] === p) delete cache[url];
        const message = error instanceof Error && error.message === "No usable heatmap readings"
          ? "No readings are available for this view."
          : "The live data is not reachable right now.";
        const a = required(
          required(box.closest(".dv-view")).querySelector<HTMLAnchorElement>(
            ".dv-cap a",
          ),
        );
        box.innerHTML =
          '<p class="dv-wait">' + message + ' <a href="' +
          a.href +
          '" target="_blank" rel="noopener">Open the live chart</a></p>';
      });
  }

  document.querySelectorAll<HTMLElement>("[data-dv]").forEach(function (root) {
    const tabs = Array.from(root.querySelectorAll<HTMLElement>("[role=tab]"));
    const views = Array.from(root.querySelectorAll<HTMLElement>(".dv-view"));
    let cur = 0;
    let seen = false;

    function setRead(view: HTMLElement, read: boolean) {
      view.classList.toggle("is-read", read);
      const note = view.querySelector<HTMLElement>(".dv-note");
      if (note) { note.inert = read; note.hidden = read; }
      const help = view.querySelector<HTMLElement>("[data-dv-help]");
      help?.setAttribute("aria-expanded", String(!read));
      if (help) help.textContent = read ? "What does this show?" : "Hide explanation";
      view.querySelectorAll<HTMLElement>(".dv-frame > :not(.dv-note)").forEach(function (content) {
        content.inert = false;
      });
    }
    views.forEach(function (view) { setRead(view, true); });

    function show(i: number, focus = false) {
      cur = (i + views.length) % views.length;
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", String(k === cur));
        t.tabIndex = k === cur ? 0 : -1;
      });
      views.forEach(function (v, k) {
        v.classList.toggle("is-on", k === cur);
        setRead(v, true);
      });
      if (focus) tabs[cur].focus();
      const box = views[cur].querySelector<HTMLElement>(".dv-chart");
      if (box && !box.dataset.done) render(box);
      read();
    }
    // Chart selection is deliberately manual: keep the chosen values in view.
    function read() { setRead(views[cur], true); }

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () {
        show(k);
      });
      t.addEventListener("keydown", function (ev) {
        const d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
        if (d) {
          ev.preventDefault();
          show(cur + d, true);
        }
      });
    });
    root.querySelectorAll<HTMLElement>("[data-dv-help]").forEach(function (b) {
      b.addEventListener("click", function () {
        setRead(views[cur], !views[cur].classList.contains("is-read"));
      });
    });
    root.addEventListener("ch:embed-interact", read);

    function start() {
      if (!seen) {
        seen = true;
        show(0);
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (es, o) {
          if (es[0].isIntersecting) {
            o.disconnect();
            start();
          }
        },
        { threshold: 0.3 },
      ).observe(root);
    } else start();

    if ("ResizeObserver" in window) {
      let rt: number | undefined;
      new ResizeObserver(function () {
        clearTimeout(rt);
        rt = window.setTimeout(function () {
          root.querySelectorAll<HTMLElement>(".dv-chart").forEach(function (b) {
            if (b.dataset.done && +b.dataset.done !== b.offsetWidth) render(b);
          });
        }, 200);
      }).observe(root);
    }
  });
})();
