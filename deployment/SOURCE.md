# Imported website source

Source: https://github.com/2024frank/communityhub-website-refined

Branch: main

Imported commit: 90f637ed080f0ba5e0cabb9382716c078c52b248

Supplied by Kwaku in the email "Re: Porting website" on 4 October 2026 IST.
Reference preview: https://communityhub-refined.vercel.app

The complete tracked source and public assets were imported. UI and content
remain as supplied; deployment files are added separately. Old static files
and the Bootstrap submodule were removed from this Change's worktree.

Build with Node 22.12 or newer: npm ci, npm run check, npm run build.
The Dockerfile packages dist in Nginx on port 8080. Pages retain their flat
.html URLs; missing paths use 404.html with HTTP status 404. /healthz is a
container health endpoint. HTML revalidates; hashed Astro assets are immutable.

Production cutover must follow the Change's Preview and human Promotion gates.
Keep the existing WordPress Deployment and Service available for routing
rollback. Both apex and www ingress rules must switch together; preserve TLS
secrets in their existing namespace. Canonical-host redirect belongs only to
the production ingress, so Local and Preview remain usable.

The source's historical SHA256SUMS and SOURCE-MANIFEST.json predate later edits
and are not proof of this import. Import provenance is the Git commit above.

Delivery adaptations: npm dependencies are pinned to the supplied lock versions;
Astro uses normal CLI resolution for workspace compatibility; Python discovery
and Node test globs use double quotes on Windows. No UI source was changed.

Legacy redirects map the live WordPress sitemap routes to matching static pages.
Data Manager maps to the-hub.html and Dashboard Creator to building-dashboard.html,
matching the original product provenance in src/content/live-products.json.
Team maps to the supplied About team listing; Story Maker maps to Stories.
Both slash forms and query strings are preserved. WordPress default sample-page
and hello-world content have no intended replacement and return a true 404.

LF line endings are enforced for text files so Windows builds match the deployed
reference. No writing, design or interaction changes were made. Acceptance tests
compare every emitted file against hashes of the deployed Vercel reference captured
on 4 October 2026. Update those hashes only for an explicitly approved new version.
