# Local review — 4 October 2026

Imported source: 90f637ed080f0ba5e0cabb9382716c078c52b248.
Final local runtime: sha256:c0a945b8fa63cd5c9dd2cbabb919f5701547443d1e53e48c5d37eb2bb4480e51.

The actual Nginx container serves all 686 emitted files byte-for-byte identically
to https://communityhub-refined.vercel.app (captured 4 October 2026), including
38 HTML pages, JavaScript, CSS, images, video and fonts. Public asset bytes retain
the reference's original line endings. No writing, design or interactions were changed.
All legacy redirect forms preserve query strings and reach matching static pages.
Missing routes/assets return the supplied status-404 page; /healthz responds 200.
HTML revalidates; hashed Astro assets remain immutable.

Primary CUA review observed home desktop/mobile, Explore revealing testimonials,
Next moving 1/8 to 2/8, and mobile Menu opening/closing useful links. Final runtime
home was reloaded and captured at desktop and 390x844 after the LF-only rebuild.

An independent reviewer inspected final-desktop.jpg and final-mobile.jpg in the
Change root's validation folder. Desktop matches the captured deployed reference;
mobile matches the earlier local view. Complete headline and controls remain readable
and unobscured. No visible migration blocker in those bounded final home views.
The reviewer did not independently execute final interactions or certify other pages.

Earlier visitor review also covered products, digital signage, Contact and GLSC/
Oberlin dashboard tabs. Narrow embedded dashboard width is inherited behavior;
the full dashboard link remains available. External dashboards require QA checks.

The owner selected delivered-version acceptance, retaining historical browser tests
as diagnostics. tests/deployment/README.md documents coverage and those limits.
This is Local evidence, not shared Preview Proof or Prod verification.
