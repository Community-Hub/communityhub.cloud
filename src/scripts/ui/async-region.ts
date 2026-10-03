import { setStatus } from './state';

export interface AsyncRegionOptions<T> {
  status: HTMLElement;
  content: HTMLElement;
  retry: HTMLButtonElement;
  load: (signal: AbortSignal) => Promise<T>;
  isEmpty: (data: T) => boolean;
  /** Return a detached node; never interpolate untrusted data as HTML. */
  render: (data: T) => Node;
  messages: { loading: string; empty: string; error: string; success: string };
  timeoutMs?: number;
}

/** Latest request wins, including when a loader ignores cancellation. */
export function createAsyncRegion<T>(options: AsyncRegionOptions<T>) {
  let generation = 0;
  let current: AbortController | undefined;
  let disposed = false;
  const timeoutMs = options.timeoutMs ?? 15000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be positive');

  async function reload(): Promise<void> {
    if (disposed) return;
    const ticket = ++generation;
    current?.abort();
    const controller = new AbortController();
    current = controller;
    options.content.hidden = true;
    options.content.setAttribute('aria-busy', 'true');
    setStatus(options.status, 'loading', options.messages.loading);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;
    try {
      const cancelled = new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error('Request cancelled'));
        controller.signal.addEventListener('abort', onAbort, { once: true });
        timer = setTimeout(() => controller.abort(), timeoutMs);
      });
      const data = await Promise.race([Promise.resolve().then(() => options.load(controller.signal)), cancelled]);
      if (disposed || ticket !== generation) return;
      if (options.isEmpty(data)) {
        options.content.replaceChildren();
        setStatus(options.status, 'empty', options.messages.empty);
        options.retry.hidden = false;
      } else {
        const node = options.render(data);
        options.content.replaceChildren(node);
        options.content.hidden = false;
        setStatus(options.status, 'success', options.messages.success);
        if (options.retry.ownerDocument.activeElement === options.retry) {
          options.content.tabIndex = -1;
          options.content.focus({ preventScroll: true });
        }
        options.retry.hidden = true;
      }
    } catch {
      if (disposed || ticket !== generation) return;
      options.content.replaceChildren();
      options.content.hidden = true;
      options.retry.hidden = false;
      setStatus(options.status, 'error', options.messages.error);
    } finally {
      clearTimeout(timer);
      if (onAbort) controller.signal.removeEventListener('abort', onAbort);
      if (!disposed && ticket === generation) options.content.removeAttribute('aria-busy');
    }
  }
  const retry = () => { void reload(); };
  options.retry.addEventListener('click', retry);
  return {
    reload,
    dispose() {
      disposed = true;
      generation++;
      current?.abort();
      options.content.removeAttribute('aria-busy');
      options.retry.removeEventListener('click', retry);
    },
  };
}
