import { setFieldError, setStatus } from './state';

export interface EmailFormOptions {
  subject: string;
  fields: readonly { name: string; label: string }[];
  status: HTMLElement;
  /** Injectable transport for tests; the default only opens the visitor's mail app. */
  open?: (url: string) => void;
  /** Let the owning layout synchronously measure dynamic feedback before focus moves. */
  onLayoutChange?: () => void;
}
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const initialized = new WeakSet<HTMLFormElement>();

export function enhanceEmailForm(form: HTMLFormElement, options: EmailFormOptions): () => void {
  if (initialized.has(form)) return () => {};
  initialized.add(form);
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const recovery = form.querySelector<HTMLElement>('[data-email-recovery]');
  const controls = Array.from(form.querySelectorAll<Control>('input,textarea,select'));
  // The shipped button is disabled until the local handler is installed; no-JS
  // visitors use the direct email link instead of leaking a draft in a GET URL.
  if (button) button.disabled = false;
  form.noValidate = true;

  function validationMessage(control: Control): string {
    control.setCustomValidity('');
    if (!control.willValidate) return '';
    if (control.required && !control.value.trim()) return 'Please complete this required field.';
    return control.validity.valid ? '' : control.validationMessage;
  }
  function input(event: Event) {
    const control = event.target;
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
      const hadFeedback = Boolean(recovery?.childElementCount) || options.status.dataset.uiState !== 'idle';
      if (control.hasAttribute('aria-invalid')) setFieldError(control, validationMessage(control));
      if (recovery) recovery.replaceChildren();
      setStatus(options.status, 'idle', '');
      if (hadFeedback) options.onLayoutChange?.();
    }
  }
  function reset() {
    controls.forEach(control => setFieldError(control, ''));
    setStatus(options.status, 'idle', '');
    recovery?.replaceChildren();
    options.onLayoutChange?.();
  }
  function submit(event: SubmitEvent) {
    event.preventDefault();
    recovery?.replaceChildren();
    let firstInvalid: Control | undefined;
    for (const control of controls) {
      const message = validationMessage(control);
      setFieldError(control, message);
      if (message && !firstInvalid) firstInvalid = control;
    }
    if (firstInvalid) {
      setStatus(options.status, 'error', 'Please check the highlighted fields. Your email has not been prepared.');
      options.onLayoutChange?.();
      firstInvalid.focus();
      return;
    }
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    const body = options.fields.map(field => `${field.label}: ${value(field.name)}`).join('\n\n');
    const subject = `${options.subject}: ${value('org') || value('name')}`;
    const url = `mailto:connect@communityhub.cloud?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement('a');
    link.className = 'ui-action ui-action--secondary';
    link.textContent = 'Open your email app';
    link.href = url;
    recovery?.append(link);
    // Large mailto URLs have inconsistent support across mail clients. Preserve
    // the entire draft locally and offer a simple email destination instead.
    if (url.length > 1800) {
      link.href = `mailto:connect@communityhub.cloud?subject=${encodeURIComponent(subject)}`;
      const label = document.createElement('label');
      label.htmlFor = `${form.id}-draft`;
      label.textContent = 'Copy this message into your email';
      const draft = document.createElement('textarea');
      draft.id = label.htmlFor;
      draft.className = 'ui-field-control';
      draft.readOnly = true;
      draft.rows = 5;
      draft.value = body;
      const field = document.createElement('div');
      field.className = 'ui-field';
      field.append(label, draft);
      recovery?.prepend(field);
      setStatus(options.status, 'success', 'Your message is ready to copy. Open your email app and paste it in. Nothing has been sent.');
      options.onLayoutChange?.();
      return;
    }
    setStatus(options.status, 'success', 'Your email draft is ready. If your email app does not open, use the link below. Nothing has been sent.');
    options.onLayoutChange?.();
    try { (options.open ?? (destination => { window.location.href = destination; }))(url); }
    catch {
      setStatus(options.status, 'error', 'Your email app could not be opened. Use the link below or email connect@communityhub.cloud directly. Nothing has been sent.');
      options.onLayoutChange?.();
    }
  }
  form.addEventListener('submit', submit);
  form.addEventListener('input', input);
  form.addEventListener('reset', reset);
  return () => {
    form.removeEventListener('submit', submit);
    form.removeEventListener('input', input);
    form.removeEventListener('reset', reset);
    initialized.delete(form);
    if (button) button.disabled = true;
  };
}
