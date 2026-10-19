# Browser regression suite

These regressions target the TypeScript implementation and its generated pages:

- Isolated gesture and layout fixtures load IIFE bundles compiled from `src/scripts/*.ts`, plus the corresponding styles from `src/styles/`.
- Full-page checks load the generated Astro pages in `dist/`, served over local HTTP so browser ES modules work normally.
- CSS checks inspect Astro's emitted `_astro/*.css` files.
- `tests/runtime/` is generated test output, separate from the production build. Its manifest records source and output hashes. No legacy JavaScript or Python renderer is loaded by the fixture builder.

Current contract migrations:

- The product-link test now selects `[data-eng-panel]`, the panels already present in the frozen September 30 baseline. Both the baseline and migrated page lack the older `.pc` articles. It still requires at least five product panels and one or two `.pc-a` links in each.
- The opening film and People now share one `.hv` section. The first downward gesture, Skip, Explore, and natural playback completion reveal People beneath the held final frame; the next gesture leaves for Who We Are. Synthetic navigation fixtures explicitly begin after this arrival.
- Public iframe applications accept pointer, touch, and keyboard input immediately. No activation shield, activation toolbar, or Escape deactivation is expected.
- Gallery controls are accessible icons; clipped visual counters remain available for state assertions, while tests also check the actual selected slide.
- Data Hub explanations sit below charts without hiding or disabling the chart. Manual chart-tab/load-profile coverage uses `_data_views_fixture.py`, because the production homepage currently renders only the heat map and `data-dashboard.html` no longer has the old `#views` tab group. The fixture uses catalog metadata, the real runtime adapter, and generated CSS. Local tests stub data explicitly; opt-in live tests keep real responses and matching full-size destinations. A separate opt-in check visits the real homepage heat map.

See [October 2 migration status](../../docs/refinement-20261002/browser-test-migration.md) for exact scope and verification limits. This migration has syntax/source-contract checks only; the browser suite was not executed during it.

From the `site_ts` directory:

```sh
npm run check
npm run build
npm run test:fixtures
npm run test:browser
```

Use a Python environment with the packages in `requirements-dev.txt` and Playwright Chromium installed. The portable runner selects a compatible interpreter, or uses the `PYTHON` environment variable. See [the project README](../../README.md#quality-assurance-setup) for setup, including the virtual-environment workaround for project paths containing a colon.

Rebuild the fixture runtime after changing TypeScript scripts or source styles. A single module can be run with, for example:

```sh
node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_story_scroll.py' -v
```

Production dashboard and Voices API checks retain their existing `CH_LIVE=1` opt-in. Run those separately because they depend on current external services:

```sh
CH_LIVE=1 node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_dashboard_live_views.py' -v
CH_LIVE=1 node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_voices_sources.py' -v
```

`CH_REVIEW_URL` can override the site URL for the live dashboard checks. Otherwise they serve `dist/` locally. Local layout tests block remote feeds and embeds while permitting generated site assets.
