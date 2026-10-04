import { jobsData } from "./data";
import { required } from "./dom";
/* Task 9: the Calendar and Jobs Board card switches views by hand, and loads Cleveland's latest jobs live. */
(function () {
  document.querySelectorAll<HTMLElement>("[data-ct]").forEach(function (box) {
    const tabs = Array.from(box.querySelectorAll<HTMLElement>('[role="tab"]'));
    const bar = required(box.querySelector<HTMLElement>(".ct-tabs"));
    /* phones scroll the tab row sideways: fade its edge only while more tabs sit past it */
    function edge() {
      bar.toggleAttribute(
        "data-more",
        bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2,
      );
    }
    bar.addEventListener("scroll", edge, { passive: true });
    window.addEventListener("resize", edge);
    edge();
    function pick(t: HTMLElement, focus = false) {
      tabs.forEach(function (b) {
        const on = b === t;
        const p = document.getElementById(
          b.getAttribute("aria-controls") || "",
        );
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        if (p) p.hidden = !on;
      });
      /* bring the chosen tab fully into the row, clear of the fade, without moving the page or the card rail */
      const i = tabs.indexOf(t);
      const l = t.offsetLeft - bar.offsetLeft;
      const r =
        l + t.offsetWidth + (i < tabs.length - 1 ? bar.clientWidth * 0.2 : 0);
      if (i === tabs.length - 1) bar.scrollLeft = bar.scrollWidth;
      else if (r > bar.scrollLeft + bar.clientWidth)
        bar.scrollLeft = r - bar.clientWidth;
      else if (l < bar.scrollLeft) bar.scrollLeft = i === 0 ? 0 : l;
      if (focus) t.focus({ preventScroll: true });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        pick(t);
      });
      t.addEventListener("keydown", function (e) {
        const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) {
          e.preventDefault();
          pick(tabs[(i + k + tabs.length) % tabs.length], true);
        }
      });
    });
  });

  const JOBS =
    "https://cleveland.communityhub.cloud/api/legacy/calendar/jobs/list";
  const BOARD =
    "https://cleveland.communityhub.cloud/calendar/jobs?show-menu-bar=1";
  const KIND: Record<number, string> = {
    1: "Full-time",
    2: "Part-time",
    3: "Contract",
    4: "Temporary",
    5: "Volunteer",
    6: "Internship",
  };
  function esc(s: unknown) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c;
    });
  }
  function get(u: string) {
    return fetch(u).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json().then(jobsData);
    });
  }
  document.querySelectorAll<HTMLElement>("[data-jobs]").forEach(function (box) {
    if (!window.fetch) return;
    const n = parseInt(box.getAttribute("data-count") || "3", 10);
    /* the list is oldest first, so the newest posts sit on the last two pages */
    get(JOBS)
      .then(function (d) {
        const last = Math.max(
          0,
          Math.ceil((d.count || 0) / (d.limit || 10)) - 1,
        );
        if (last === 0) return d.posts || [];
        return Promise.all([
          get(JOBS + "?page=" + last),
          get(JOBS + "?page=" + (last - 1)).catch(function () {
            return { posts: [] };
          }),
        ]).then(function (r) {
          return (r[0].posts || []).concat(r[1].posts || []);
        });
      })
      .then(function (posts) {
        let pick = posts
          .filter(function (p) {
            return (
              p &&
              p.name &&
              p.approved !== false &&
              p.public !== false &&
              !p.isAnnouncement
            );
          })
          .sort(function (a, b) {
            return (b.createdAt || 0) - (a.createdAt || 0);
          })
          .map(function (p) {
            var org =
              (p.sponsors || [])
                .map(function (s) {
                  return s && s.name ? String(s.name).trim() : "";
                })
                .filter(function (x) {
                  return x && !/^adding sponsor$/i.test(x);
                })[0] || "";
            return {
              name: String(p.name).trim(),
              org: org,
              kind: KIND[p.employmentType] || "",
              at: p.createdAt,
            };
          });
        /* one post per organization first, so the list shows who is hiring, then fill */
        const seen: Record<string, number> = {};
        const first = pick.filter(function (j) {
          if (seen[j.org]) return false;
          seen[j.org] = 1;
          return true;
        });
        pick = first
          .concat(
            pick.filter(function (j) {
              return first.indexOf(j) < 0;
            }),
          )
          .slice(0, n);
        if (!pick.length) throw new Error("no jobs");
        box.innerHTML =
          '<ul class="events-list">' +
          pick
            .map(function (j) {
              const d = j.at ? new Date(j.at * 1000) : null;
              const o = { timeZone: "America/New_York" };
              const mon = d
                ? d.toLocaleDateString(
                    "en-US",
                    Object.assign<
                      Intl.DateTimeFormatOptions,
                      Intl.DateTimeFormatOptions
                    >({ month: "short" }, o),
                  )
                : "";
              const day = d
                ? d.toLocaleDateString(
                    "en-US",
                    Object.assign<
                      Intl.DateTimeFormatOptions,
                      Intl.DateTimeFormatOptions
                    >({ day: "numeric" }, o),
                  )
                : "";
              const sub = j.org
                ? "Posted by " + j.org + (j.kind ? ", " + j.kind : "")
                : j.kind || "Posted on the Jobs Board";
              return (
                '<li><a href="' +
                BOARD +
                '" target="_blank" rel="noopener"><span class="ev-date"><small>' +
                esc(mon) +
                "</small><b>" +
                esc(day) +
                "</b></span>" +
                '<span class="ev-what"><b>' +
                esc(j.name) +
                "</b><small>" +
                esc(sub) +
                "</small></span></a></li>"
              );
            })
            .join("") +
          "</ul>";
      })
      .catch(function () {
        const f = box.querySelector<HTMLElement>(".events-fallback");
        if (f)
          f.innerHTML =
            'The Jobs Board didn&rsquo;t answer here. <a href="' +
            BOARD +
            '" target="_blank" rel="noopener">Open Cleveland&rsquo;s Jobs Board</a>.';
      });
  });
})();
