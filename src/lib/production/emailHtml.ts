function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export function trackedOutreachHref(url: string, token: string, base: string) {
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return url;
  let parsed: URL;
  try { parsed = new URL(url); } catch { return url; }
  if (parsed.origin !== "https://santowrldwide.com" || parsed.search || parsed.hash) return url;
  const destination = parsed.pathname.replace(/\/$/, "") === "/productions" ? "portfolio"
    : parsed.pathname.replace(/\/$/, "") === "/book/zeb" ? "booking" : null;
  if (!destination) return url;
  return `${base}/api/production/click/${token}/${destination}`;
}

export function renderLinksAsHtml(value: string, hrefFor: (url: string) => string = (url) => url) {
  const links = /https?:\/\/[^\s<>]+/g;
  let result = "";
  let previous = 0;
  for (const match of value.matchAll(links)) {
    const start = match.index ?? 0;
    result += escapeHtml(value.slice(previous, start));
    const raw = match[0];
    const url = raw.replace(/[.,;!?]+$/, "");
    result += `<a href="${escapeHtml(hrefFor(url))}" style="color:inherit;text-decoration:underline">${escapeHtml(url)}</a>${escapeHtml(raw.slice(url.length))}`;
    previous = start + raw.length;
  }
  return result + escapeHtml(value.slice(previous));
}

export { escapeHtml };
