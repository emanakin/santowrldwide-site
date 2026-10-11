function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export function renderLinksAsHtml(value: string) {
  const links = /https?:\/\/[^\s<>]+/g;
  let result = "";
  let previous = 0;
  for (const match of value.matchAll(links)) {
    const start = match.index ?? 0;
    result += escapeHtml(value.slice(previous, start));
    const raw = match[0];
    const url = raw.replace(/[.,;!?]+$/, "");
    result += `<a href="${escapeHtml(url)}" style="color:inherit;text-decoration:underline">${escapeHtml(url)}</a>${escapeHtml(raw.slice(url.length))}`;
    previous = start + raw.length;
  }
  return result + escapeHtml(value.slice(previous));
}

export { escapeHtml };
