import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface SanitizedHtmlProps {
  readonly html: string;
  readonly className?: string;
  readonly as?: 'div' | 'span' | 'p';
}

/**
 * Renders sanitized HTML. For plain text (no HTML tags), preserves newlines.
 */
export function SanitizedHtml({ html, className, as: Tag = 'div' }: SanitizedHtmlProps) {
  const isHtml = html.includes('<');
  const sanitized = isHtml ? sanitizeHtml(html) : sanitizeHtml(html.replaceAll('\n', '<br>'));
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
