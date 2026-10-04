/** Deliberately small APIs: native HTML semantics, plain text, no raw HTML props. */
export interface ActionProps {
  label: string;
  id?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  describedBy?: string;
}
export interface ButtonProps extends ActionProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  controls?: string;
  expanded?: boolean;
  pressed?: boolean;
}
export interface ActionLinkProps extends ActionProps {
  href: string;
  newTab?: boolean;
}
interface FieldBase {
  /** Stable and unique within the document; also namespaces hint/error IDs. */
  id: string;
  name: string;
  label: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  error?: string;
  describedBy?: string;
  className?: string;
}
export type FieldProps = FieldBase & (
  | { kind?: 'input'; type?: 'text' | 'email' | 'search' | 'tel' | 'url'; autocomplete?: string; placeholder?: string; maxLength?: number }
  | { kind: 'textarea'; rows?: number; placeholder?: string; maxLength?: number }
  | { kind: 'select'; options: readonly { value: string; label: string; disabled?: boolean }[] }
);
export type UIState = 'idle' | 'loading' | 'empty' | 'error' | 'success';
export interface StatusProps {
  id: string;
  message?: string;
  state?: UIState;
  className?: string;
}
