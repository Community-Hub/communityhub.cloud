# Browser test contract migration · 2 October 2026

## Status

Tests and this documentation only. No source, CSS, production output, build configuration, or route changes were made by this migration. No browser was launched and no browser/live-service test was run. The production and test-runtime builds were not run. The coordinator owns private-preview browser QA.

Verified locally:

- Python compilation succeeds for all 30 browser Python modules, containing 202 test methods
- Syntax parsing succeeds for 334 embedded JavaScript snippets in changed tests
- The migrated identifiers and chart catalog match inspected current source
- Supplied private-preview v8 hero JSON/images show a full opening with People hidden, then a paused 17.849999-second frame over People in the same section, followed by `#problem` on the next gesture
- `test_conn_web.py`, `test_review_11_15_browser.py`, and the already-updated `test_october1_fixes.py` were left unchanged

These checks establish syntax and contract alignment only. They do not establish browser pass status, rendered geometry, live endpoint availability, or the behavior of a future build. Rebuild the normal fixture runtime before any subsequently authorized browser-suite run.

## Changed contracts

- **One opening owner:** `test_home_narrative.py` now checks SSR `.hv.full`, its `.hv-film`, and its initially hidden `div#people`. The source headline belongs to the opening H1. Nested platform sections are parsed as a DOM tree rather than truncated by a section regex
- **Actual hero arrival:** new `test_home_hero.py` covers Earth poster/full-height startup, blocked-media fallback, Skip and Explore, first wheel/page/arrow key and real touch gesture, final-frame seeking, natural end plus the three-second hold, and the next gesture reaching Who We Are. It requires one hero owner and no separate People owner
- **Navigation remains covered:** `test_story_cuts.py`, `test_story_startup.py`, `test_page_isolation.py`, and `test_aesthetic_controls.py` preserve reversal, momentum, focus/history, and full-page traversal assertions using the shared hero owner. Isolated gesture fixtures in `test_story_scroll.py`, `test_phone_scroll.py`, and `test_laptop_products.py` explicitly represent an already-completed opening, rather than an unfinished film with no video completion handler. `test_controller_isolation.py` uses the matching fixture selector
- **Direct iframe interaction:** `test_content_isolation.py` replaces activation-button, shield, Escape-deactivation, and reserved-toolbar requirements with direct mouse/touch/keyboard interaction, no overlays, live dynamic/replaced/shared-parent frames, and normal inactive-scene isolation without removing `ch-live`
- **Current Building scene:** `test_delivery_interiors.py` checks the live residence-hall dashboard 815 and its matching recovery URL, keyboard interaction, persistent live state, and absence of the removed still/activation layer. `test_home_delivery.py` matches the current 815 portal URL and caption link
- **Chart explanations:** `test_home_delivery.py` and `test_dashboard_live_views.py` require the open note below/outside `.dv-frame`, unchanged visible/non-inert charts, accessible recovery links, and correct hidden/expanded state when the note closes. The old computed `visibility:hidden` expectation is replaced with actual hidden-state semantics
- **Manual chart tabs:** new `test_data_views_manual.py` runs the real adapter and generated CSS against deterministic synthetic chart data. It checks 60 seconds without automatic selection changes, keyboard selection, and persistent, non-obscuring help. `_data_views_fixture.py` reads endpoint/caption metadata from the actual source catalog. It is explicitly a component fixture because no current production route renders the legacy load-profile/tab group
- **Live-data scope preserved:** opt-in `test_dashboard_live_views.py` retains real load-profile values, meter/window destination matching, full-size response verification, and keyboard/help checks through that component fixture. An added integration case visits the actual homepage Data Hub heat map. It no longer navigates to the absent `data-dashboard.html#views` target
- **Quiet gallery controls:** `test_aesthetic_controls.py` and `test_delivery_interiors.py` require labeled icon controls, visually clipped counts, one active slide, and actual image changes. `test_home_delivery.py` retains complete-photo, story-count, and story-selection assertions
- **Current adjacent markup:** `test_delivery_interiors.py` and `test_slider_links.py` keep exact partner destinations and safe new-tab behavior with “Visit partner page” labels. The live college and city scenes are tested on their current pages. First-phone-view geometry is measured against the actual header rather than requiring an absent announcement banner
- **Platform ownership:** only the obsolete `.conn-art` integration assertion in `test_home_delivery.py` was moved to the current platform figure/panel. Detailed four-stage/peer-web tests remain owned separately. The distinct eight-stage `data-hub-flow` product-diagram tests remain intact
- **Lesson destinations:** `test_authored_scenes.py` adds coverage that all 35 lesson titles retain their corresponding verified PDF, accessible link label, and safe new-tab attributes

## Verification commands

```sh
PYTHONPYCACHEPREFIX=/tmp/communityhub-browser-syntax python -m compileall -q tests/browser
```

Additional non-browser checks parsed the current `DATA_VIEWS` catalog, inspected the relevant source identifiers and supplied v8 JSON evidence, and compiled the changed tests' literal browser JavaScript strings with Node's parser without executing them.

The browser suite, live endpoint tests, and visual checks remain **unrun** in this migration. The repository browser README documents the normal build/fixture prerequisites for an authorized environment.
