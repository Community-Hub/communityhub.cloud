# Website migration acceptance

The owner explicitly chose Kwaku's deployed version as the acceptance reference on
4 October 2026. All original browser tests remain under tests/browser and run with
npm run test:browser:diagnostics. Some assert earlier design directions (including
an old hero sequence, control labels and headings) that conflict with the supplied
version. Their known failures remain diagnostic findings, not silently repaired UI.

npm test still runs check, build, all unit tests, runtime fixture compilation,
compatible controller/menu regressions, delivered-page browser checks and content
contracts. The unit suite additionally checks every emitted file against the SHA-256
manifest captured from https://communityhub-refined.vercel.app. This covers HTML,
CSS, JavaScript, fonts, real images and video bytes. Public assets disable Git text
conversion to preserve the reference's exact mix of LF and CRLF bytes on every platform.
Do not regenerate the reference to hide a failure;
an intended website update needs explicit owner acceptance of a new reference.

The live container is tested separately:

PowerShell:
$env:WEBSITE_RUNTIME_URL='http://127.0.0.1:22193/'
node --test tests/deployment/runtime.test.mjs

This checks all 38 HTML routes, 28 legacy redirect forms with preserved query strings,
custom true-404 responses, health and cache policy. Repeat against the QA container.
Independent rendered visitor review remains required. External live dashboards are
not certified by the offline browser suite; verify those in the shared Preview.
