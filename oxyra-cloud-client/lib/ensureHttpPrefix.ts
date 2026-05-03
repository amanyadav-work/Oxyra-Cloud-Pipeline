// Utility to ensure a URL has http/https prefix
const DEFAULT_PROTOCOL = "http://";
export function ensureHttpPrefix(url?: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return DEFAULT_PROTOCOL + url;
}
