import type { UIState } from '../../lib/ui/types';

export function setStatus(region: HTMLElement, state: UIState, message: string): void {
  const text = region.querySelector<HTMLElement>('[data-ui-message]');
  if (!text) throw new Error('Status region requires a data-ui-message element');
  region.dataset.uiState = state;
  text.textContent = message;
}

export function setFieldError(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, message: string): void {
  const error = control.ownerDocument.getElementById(`${control.id}-error`);
  control.setCustomValidity(message);
  if (message) control.setAttribute('aria-invalid', 'true');
  else control.removeAttribute('aria-invalid');
  if (error) { error.textContent = message; error.hidden = !message; }
}

const buttonSnapshots = new WeakMap<HTMLButtonElement, { disabled: boolean; label: string }>();
/** Repeated calls are idempotent. Restore the original disabled state and label. */
export function setButtonLoading(button: HTMLButtonElement, loading: boolean, label = 'Loading…'): void {
  const text = button.querySelector<HTMLElement>('[data-ui-button-label]');
  if (!text) throw new Error('Loading button requires a data-ui-button-label element');
  if (loading) {
    if (!buttonSnapshots.has(button)) buttonSnapshots.set(button, {
      disabled: button.getAttribute('aria-busy') === 'true' ? button.dataset.uiDisabled === 'true' : button.disabled,
      label: button.getAttribute('aria-busy') === 'true' ? button.dataset.uiLabel ?? '' : text.textContent ?? '',
    });
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    text.textContent = label;
  } else {
    const previous = buttonSnapshots.get(button) ?? (button.getAttribute('aria-busy') === 'true' ? {
      disabled: button.dataset.uiDisabled === 'true', label: button.dataset.uiLabel ?? '',
    } : undefined);
    if (!previous) return;
    button.disabled = previous.disabled;
    text.textContent = previous.label;
    button.removeAttribute('aria-busy');
    buttonSnapshots.delete(button);
  }
}
