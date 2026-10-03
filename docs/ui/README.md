# Community Hub UI foundation

Reusable native controls for the existing Astro/TypeScript website. The first production consumers are Contact and Pricing. This is an incremental component foundation, not a new client framework or a redesign of the public site.

## Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Public types | `src/lib/ui/types.ts` | Small explicit prop contracts; discriminated field variants |
| Pure rendering | `src/lib/ui/render.ts` | Escaped semantic HTML used by the existing TypeScript content builders |
| Astro components | `src/components/ui/` | Button, ActionLink, Field, StatusMessage; delegate to the same renderers and include component CSS |
| Optional behavior | `src/scripts/ui/` | State updates, cancellation-safe async regions, shared email-form validation |
| Styling | `src/styles/ui.css` | Scoped component selectors, semantic tokens, focus, invalid/disabled/loading states, forced colors |
| Examples | `src/pages/ui-examples/[example].astro` | Interactive development-only reference; omitted from production builds |
| Verification | `tests/ui-components.test.mjs`, `tests/browser/test_ui_foundation.py` | Escaping and API contracts; runtime states, real forms and responsive geometry |

Rendering does not access the DOM or fetch data. Runtime modules have no automatic side effects: a page opts into the behavior it needs. The Astro wrappers and content-builder functions cannot drift because they share one renderer. The existing page controller continues to own scene navigation.

Static component HTML requires no hydration and introduces no new package dependencies. Browser behavior uses the native DOM and is bundled only when imported. This reduces per-visitor JavaScript cost; it is not evidence of a traffic or infrastructure load test.

## Props and API

| Component | Required | Optional / defaults |
| --- | --- | --- |
| `Button` | `label` | `type='button'`, `variant='primary'`, `disabled=false`, `loading=false`, `loadingLabel='Loading…'`, `id`, `className`, `describedBy`, `controls`, `expanded`, `pressed` |
| `ActionLink` | `label`, `href` | `variant='primary'`, `newTab=false`, `id`, `className`, `describedBy` |
| `Field` | `id`, `name`, `label` | `kind='input'`, `value`, `required`, `disabled`, `hint`, `error`, `describedBy`, `className` |
| `Field` input | — | `type='text'` (text/email/search/tel/url), `autocomplete`, `placeholder`, positive `maxLength` |
| `Field` textarea | `kind='textarea'` | `rows=4`, `placeholder`, positive `maxLength` |
| `Field` select | `kind='select'`, `options` | Each option has `value`, `label`, optional `disabled`; `value` selects the initial option |
| `StatusMessage` | `id` | `message=''`, `state='idle'` (idle/loading/empty/error/success), `className` |

Labels and content are plain text. Arbitrary HTML and event-handler string props are intentionally absent. Navigation remains a real anchor; actions remain real buttons. Links accept local URLs plus HTTP(S), mailto and tel destinations; executable schemes and protocol-relative destinations are rejected. New-tab links include a spoken notice and `noopener noreferrer`.

IDs must be nonempty, whitespace-free and unique in the rendered document. A field reserves `<id>-hint` and `<id>-error`; do not reuse those IDs elsewhere. Field variants constrain irrelevant props in TypeScript. Invalid row counts, length limits and empty labels fail during rendering.

## Astro usage

```astro
---
import Button from '../components/ui/Button.astro';
import ActionLink from '../components/ui/ActionLink.astro';
import Field from '../components/ui/Field.astro';
import StatusMessage from '../components/ui/StatusMessage.astro';
---
<Field id="profile-name" name="name" label="Your name"
  autocomplete="name" required hint="Use the name you want us to reply to." />
<Button id="profile-save" type="submit" label="Save changes" />
<ActionLink href="/contact.html" label="Book a demo" variant="secondary" />
<StatusMessage id="profile-status" />
```

The example does not supply a save endpoint. Wire a form to a real authorized endpoint before using it as a submission flow. Do not display a successful-save message before that endpoint confirms success.

## Existing TypeScript content builders

```ts
import { renderButton, renderField, renderStatus } from '../lib/ui';

const markup = `
  ${renderField({ id: 'search', name: 'query', label: 'Search lessons', type: 'search' })}
  ${renderButton({ id: 'search-submit', label: 'Search', type: 'submit' })}
  ${renderStatus({ id: 'search-status' })}
`;
```

These functions are safe to compose into the project's authored HTML. All provided text/attribute values are escaped. Runtime updates use `textContent` and DOM construction rather than interpolating untrusted HTML. Import `ui.css` when rendering outside the normal PageLayout; the production layout already includes it.

## Runtime state

```ts
import { setButtonLoading, setStatus } from '../scripts/ui';

setButtonLoading(button, true, 'Saving changes…');
try {
  await saveChanges(); // Application-owned operation.
  setStatus(status, 'success', 'Your changes were saved.');
} catch {
  setStatus(status, 'error', 'Your changes could not be saved. Try again.');
} finally {
  setButtonLoading(button, false);
}
```

Repeated loading calls preserve the original label and disabled state. The helper also restores a button initially rendered with `loading`. A loading label is visible and the button has `aria-busy`; announce completion in the separate status region. A disabled button alone does not explain why an action is unavailable: use nearby visible explanatory text or `describedBy` in the consuming flow.

`setFieldError(control, message)` updates custom validity, `aria-invalid` and the associated error. Passing an empty message clears all three. Do not validate untouched fields on every keystroke. Validate on submit, focus the first invalid field and clear errors as the visitor repairs them.

## Async content, cancellation and retries

```ts
import { createAsyncRegion } from '../scripts/ui';

const region = createAsyncRegion<string[]>({
  status, content, retry,
  load: async signal => {
    const response = await fetch('/api/items', { signal }); // Supply your real endpoint.
    if (!response.ok) throw new Error('Request failed');
    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(item => typeof item === 'string')) {
      throw new Error('Invalid response');
    }
    return data;
  },
  isEmpty: items => items.length === 0,
  render: items => {
    const list = document.createElement('ul');
    for (const item of items) {
      const row = document.createElement('li');
      row.textContent = item;
      list.append(row);
    }
    return list;
  },
  messages: {
    loading: 'Loading items…',
    empty: 'No items found. Adjust your search and try again.',
    error: 'Items could not load. Check your connection and try again.',
    success: 'Items loaded.',
  },
  timeoutMs: 15000,
});
await region.reload();
// Before removing the view:
region.dispose();
```

`status` must contain a `[data-ui-message]` child (use StatusMessage). `content` and `retry` are caller-owned nodes. Keep the status region outside busy content, and keep it mounted before requests begin. The content is hidden during loading, empty and error states, so stale controls cannot remain keyboard-focusable. Empty/error states expose Retry. After a successful retry, focus moves from the disappearing retry button to the new content; explicit reload controls retain focus.

Reload aborts the previous request. A generation check prevents stale results from replacing newer data even if a loader ignores the signal. Timeout produces the error/retry state. Disposal aborts the current request and removes the retry listener. The loader should still honor AbortSignal to release its own resources. Render should return a detached node and leave visibility/focus to the controller.

## Email forms

Contact and Pricing are local email preparation flows, not backend submissions. The shared enhancer:

- Requires nonblank names and organizations and preserves browser field constraints.
- Associates field errors, announces the summary and focuses the first invalid field.
- Encodes the subject/body, opens a mailto URL and leaves a recovery link visible.
- Keeps long drafts in a local read-only textarea instead of launching a potentially truncated URL. The 1,800-character cutoff is a conservative compatibility choice, not a universal mail-client limit.
- Never reports that a message was sent. A mailto launch cannot confirm that an app opened or that an email was delivered.
- Keeps submit disabled until its handler is installed. Without JavaScript, a direct email link remains available and form values are not submitted in the page URL.

The enhancer returns cleanup and guards against duplicate initialization. Its optional `onLayoutChange` hook lets the page synchronously measure dynamic feedback before focus moves. Contact and Pricing connect it to the existing `ch:fit` event, preserving the current story anchor; the reusable enhancer has no dependency on that scene controller. Client validation helps visitors; any future backend must independently validate and authorize input.

## Working example and verification

Run `npm run dev`, then open `/ui-examples/foundation` on the printed local URL. Choose Results, No results or Connection error and press Load example. The response is explicitly simulated. This route is not generated by `npm run build` and is not included in the public navigation/sitemap.

```sh
npm run check
npm run build
npm run test:unit
npm run test:fixtures
node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_ui_foundation.py' -v
npm run test:contracts
```

Run `npm run test:browser` for the broader existing behavior suite. Evidence and limits are in `VERIFICATION.md` and `visitor-review.md` in this directory.

## Extension guidelines

- Start with native semantics and composition; add a variant only for a real repeated use case.
- Preserve local writing, photographs, existing scene ownership and direct destinations.
- Use visible labels, stable IDs, explicit required markers, 44px targets and a persistent focus outline. Test long labels, translated content and small viewports.
- Keep errors actionable and textual; do not rely on color, animation or a spinner alone.
- Loading is a real pending operation, empty is a successful response with no records, and error is a failure. Never conflate them.
- Let forms grow and scroll naturally when validation/recovery content expands. Do not hide errors to satisfy a fixed viewport height.
- Update status content in place. Avoid nested live regions, automatic focus theft or announcements on every keystroke.
- Keep data validation in the loader, application decisions in the page, and reusable interaction mechanics in controllers.
- Preserve native focus/keyboard behavior, reduced motion and forced colors. These components introduce no animation and no pointer-only actions.
- Before extending the library, add a usage example and test the behavior or failure it must protect, not a snapshot of its implementation.
