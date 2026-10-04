import type { ActionLinkProps, ButtonProps, FieldProps, StatusProps } from './types';

/** Escape every text/attribute boundary, including values supplied by content feeds. */
export function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
function attributes(values: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(values).filter(([, value]) => value !== undefined && value !== false)
    .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${escapeHTML(String(value))}"`).join('');
}
function requireText(value: string, name: string): void {
  if (!value.trim()) throw new Error(`${name} must not be empty`);
}
function requireId(value: string): void {
  requireText(value, 'id');
  if (/\s/.test(value)) throw new Error('id must not contain whitespace');
}
function actionClass(variant = 'primary', className = ''): string {
  return `ui-action ui-action--${variant} ${className}`.trim();
}
export function renderButton(props: ButtonProps): string {
  requireText(props.label, 'Button label');
  const { label, loading = false, loadingLabel = 'Loading…' } = props;
  return `<button${attributes({ id: props.id, class: actionClass(props.variant, props.className), type: props.type ?? 'button', disabled: props.disabled || loading, 'aria-busy': loading ? 'true' : undefined, 'aria-describedby': props.describedBy, 'aria-controls': props.controls, 'aria-expanded': props.expanded === undefined ? undefined : String(props.expanded), 'aria-pressed': props.pressed === undefined ? undefined : String(props.pressed), 'data-ui-button': true, 'data-ui-label': label, 'data-ui-disabled': String(Boolean(props.disabled)) })}><span data-ui-button-label>${escapeHTML(loading ? loadingLabel : label)}</span></button>`;
}
export function renderActionLink(props: ActionLinkProps): string {
  requireText(props.label, 'Link label');
  requireText(props.href, 'Link href');
  const href = props.href.trim();
  // Scheme-less local paths/fragments plus explicit web/email/phone destinations.
  if (/[\u0000-\u0020\u007f\\]/.test(href) || (/^[^/?#]*:/.test(href) && !/^(https?:|mailto:|tel:)/i.test(href)) || href.startsWith('//')) {
    throw new Error('Unsupported link destination');
  }
  return `<a${attributes({ id: props.id, class: actionClass(props.variant, props.className), href, target: props.newTab ? '_blank' : undefined, rel: props.newTab ? 'noopener noreferrer' : undefined, 'aria-describedby': props.describedBy })}>${escapeHTML(props.label)}${props.newTab ? '<span class="ui-sr-only"> (opens in a new tab)</span>' : ''}</a>`;
}
export function renderField(props: FieldProps): string {
  requireId(props.id);
  requireText(props.name, 'Field name');
  requireText(props.label, 'Field label');
  const describedBy = [props.describedBy, props.hint ? `${props.id}-hint` : '', `${props.id}-error`].filter(Boolean).join(' ');
  const shared = { id: props.id, name: props.name, class: 'ui-field-control', required: props.required, disabled: props.disabled, 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': describedBy };
  let control: string;
  if (props.kind === 'select') {
    control = `<select${attributes(shared)}>${props.options.map(option => `<option${attributes({ value: option.value, selected: option.value === props.value, disabled: option.disabled })}>${escapeHTML(option.label)}</option>`).join('')}</select>`;
  } else {
    const maxLength = props.maxLength;
    if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength < 1)) throw new Error('maxLength must be a positive integer');
    if (props.kind === 'textarea') {
      const rows = props.rows ?? 4;
      if (!Number.isInteger(rows) || rows < 1) throw new Error('rows must be a positive integer');
      control = `<textarea${attributes({ ...shared, rows, placeholder: props.placeholder, maxlength: maxLength })}>${escapeHTML(props.value ?? '')}</textarea>`;
    } else {
      control = `<input${attributes({ ...shared, type: props.type ?? 'text', value: props.value, autocomplete: props.autocomplete, placeholder: props.placeholder, maxlength: maxLength })}>`;
    }
  }
  return `<div${attributes({ class: `ui-field ${props.className ?? ''}`.trim(), 'data-ui-field': true })}><label for="${escapeHTML(props.id)}">${escapeHTML(props.label)}${props.required ? '<span class="ui-field-required"> (required)</span>' : ''}</label>${control}${props.hint ? `<p class="ui-field-hint" id="${escapeHTML(props.id)}-hint">${escapeHTML(props.hint)}</p>` : ''}<p class="ui-field-error" id="${escapeHTML(props.id)}-error"${props.error ? '' : ' hidden'}>${escapeHTML(props.error ?? '')}</p></div>`;
}
/** Keep this live region mounted before updating it; do not nest other live regions. */
export function renderStatus(props: StatusProps): string {
  requireId(props.id);
  return `<div${attributes({ id: props.id, class: `ui-status ${props.className ?? ''}`.trim(), role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-ui-state': props.state ?? 'idle' })}><p data-ui-message>${escapeHTML(props.message ?? '')}</p></div>`;
}
