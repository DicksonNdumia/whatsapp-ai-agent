export function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const digitsOnly = (value = "") => String(value).replace(/\D/g, "");

export function truncate(text = "", max = 300) {
  const s = String(text);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Split long text into WhatsApp-sized chunks, preferring paragraph/line/space boundaries. */
export function chunkText(text, max = 3800) {
  const input = String(text ?? "").trim();
  if (!input) return [];
  const chunks = [];
  let rest = input;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n\n", max);
    if (cut < max * 0.5) cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(" ", max);
    if (cut < max * 0.5) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
