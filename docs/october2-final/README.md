# October 2 CommunityHub implementation and evidence

This is the final-candidate review record. Independent final browser approval is still being collected; delivery status will be updated before packaging.

## What changed
- One product identity, clear explanation and single Learn more destination per homepage product
- Passive, source-backed homepage examples; vertical product navigation stays separate from example carousels
- Three standalone Building Dashboard contexts, authentic Stories from Oberlin/GLSC, and Community Voices from multiple communities/categories
- Native institution/category interactions retained on the Community Voices product page; responsive paired phone controllers on product demonstrations
- The actual Story of Dashboard presentation at both platform-explanation locations, opening at verified slide14; the separate participant network restored in About
- Original2048×1536 exhibit photograph, readable narrow CV quotes and source-photo crops, consistent controls and corrected audience content
- Bidirectional navigation/resize repairs, predictable pause/resume, stable media geometry and active-product deferred loading
- Smaller preferred font delivery and removal of retired runtime/style imports and idle layout polling

## Evidence
- [Requirement/evidence matrix](task-evidence-matrix.json): final decision, source time, visual reference, implementation location, acceptance criteria and verification state for every requirement
- [Decision reconciliation](decision-reconciliation.md): the full meeting takes precedence over stale PDF proposals
- [Independent generated-source audit](final-source-audit.txt)
- [Frontend maintenance boundaries](frontend-architecture.md)
- [Verification scope and limitations](verification-status.md)
- [Contrast calculations](contrast-calculations.json), explicitly distinguished from runtime sampling
- Test logs in [tests](tests/):211 Node unit tests,11 site contracts and10 generated-source assertions; fixture compilation;38-page build;Astro check0errors/0warnings with7 advisory hints

## Source and build identity
- Source checkout: `communityhub-website-refined`, based on cf2553b25b897a9b9f9d5ded20fe21f8040dd250; final reviewed changes await commit/push
- Frozen build: `october2-candidates/final-candidate`
- Homepage SHA-256: `9b5ba0acad72554644126216e86a891007dbb1668e6cd3f5cf89e6bad6918b85`
- Private preview: https://communityhub-private-review.agile-mule-6724.chatgpt.site/
- Preview output commit:4779a721849171cad43635506e2646e36ff5890f. This is distinct from the GitHub source commit
- Production domain: unchanged; no production deployment performed

## Important limits
Some native Citywide/Building data and cross-origin behavior depend on the external applications. No replacement readings or successful-data claims are fabricated. The local presentation is a versioned source snapshot, not an automatically synchronized editable deck.

Cloud-browser visual/input review is separate from unit/source checks. Physical devices, physical trackpad momentum and instrumented throttled performance measurements are unavailable in this environment. Artifact byte measurements are reported as such; they are not load-time or Core Web Vitals scores. The local Playwright suite was not successfully executed; use the documented QA environment for that suite in a suitable execution environment.
