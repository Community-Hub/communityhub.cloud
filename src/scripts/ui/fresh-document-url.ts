/** The public dashboard server can retire hashed scripts while a browser still
 * caches their HTML entry document. Refresh that document on actual navigation;
 * its versioned scripts remain cacheable. Never use this during layout updates. */
export function freshDocumentUrl(source: string, now = Date.now()): string {
  let url: URL;
  try { url = new URL(source); } catch { return source; }
  const communityHost = url.hostname === 'communityhub.cloud' || url.hostname.endsWith('.communityhub.cloud');
  if (url.protocol !== 'https:' || !communityHost
    || (url.pathname !== '/dh-public' && !url.pathname.startsWith('/dh-public/'))) return source;
  url.searchParams.set('_ch_embed_refresh', String(now));
  return url.href;
}
