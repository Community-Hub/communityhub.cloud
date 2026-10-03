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
