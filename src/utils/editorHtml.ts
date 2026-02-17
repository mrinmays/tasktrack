const EMPTY_HTML = /^<p>(<\/p>|<br\s*\/?>)?<\/p>$/i;

export function isEmptyEditorHtml(html: string): boolean {
  return !html || EMPTY_HTML.test(html) || html.replaceAll(/<[^>]*>/g, '').trim() === '';
}
