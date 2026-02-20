import type { CSSProperties, ReactNode } from 'react';

interface JiraAdfMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface JiraAdfNode {
  type: string;
  text?: string;
  marks?: JiraAdfMark[];
  attrs?: Record<string, unknown>;
  content?: JiraAdfNode[];
}

interface JiraAdfRendererProps {
  readonly doc: unknown;
  readonly className?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toJiraAdfNode(value: unknown): JiraAdfNode | null {
  if (!isObject(value) || typeof value.type !== 'string') {
    return null;
  }

  const content = Array.isArray(value.content)
    ? value.content
        .map((child) => toJiraAdfNode(child))
        .filter((child): child is JiraAdfNode => child !== null)
    : undefined;

  const marks = Array.isArray(value.marks)
    ? value.marks
        .filter((mark): mark is Record<string, unknown> => isObject(mark))
        .map((mark) => ({
          type: typeof mark.type === 'string' ? mark.type : '',
          attrs: isObject(mark.attrs) ? mark.attrs : undefined,
        }))
        .filter((mark) => mark.type.length > 0)
    : undefined;

  return {
    type: value.type,
    text: typeof value.text === 'string' ? value.text : undefined,
    marks,
    attrs: isObject(value.attrs) ? value.attrs : undefined,
    content,
  };
}

function getStringAttr(
  attrs: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  const value = attrs?.[key];
  return typeof value === 'string' ? value : undefined;
}

function getNumberAttr(
  attrs: Record<string, unknown> | undefined,
  key: string
): number | undefined {
  const value = attrs?.[key];
  return typeof value === 'number' ? value : undefined;
}

function isSafeLink(href: string): boolean {
  return href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:');
}

function applyMarks(text: string, marks: JiraAdfMark[] | undefined, key: string): ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let content: ReactNode = text;
  for (const [index, mark] of marks.entries()) {
    const markKey = `${key}-mark-${index}`;
    switch (mark.type) {
      case 'strong':
        content = <strong key={markKey}>{content}</strong>;
        break;
      case 'em':
        content = <em key={markKey}>{content}</em>;
        break;
      case 'underline':
        content = <u key={markKey}>{content}</u>;
        break;
      case 'strike':
        content = <s key={markKey}>{content}</s>;
        break;
      case 'code':
        content = (
          <code
            key={markKey}
            className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-xs"
          >
            {content}
          </code>
        );
        break;
      case 'link': {
        const href = getStringAttr(mark.attrs, 'href');
        content =
          href && isSafeLink(href) ? (
            <a
              key={markKey}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {content}
            </a>
          ) : (
            <span key={markKey}>{content}</span>
          );
        break;
      }
      case 'textColor': {
        const color = getStringAttr(mark.attrs, 'color');
        const style: CSSProperties | undefined = color ? { color } : undefined;
        content = (
          <span key={markKey} style={style}>
            {content}
          </span>
        );
        break;
      }
      default:
        content = <span key={markKey}>{content}</span>;
        break;
    }
  }

  return content;
}

function renderHeading(level: number, key: string, children: ReactNode): ReactNode {
  switch (level) {
    case 1:
      return <h1 key={key} className="font-semibold">{children}</h1>;
    case 2:
      return <h2 key={key} className="font-semibold">{children}</h2>;
    case 3:
      return <h3 key={key} className="font-semibold">{children}</h3>;
    case 4:
      return <h4 key={key} className="font-semibold">{children}</h4>;
    case 5:
      return <h5 key={key} className="font-semibold">{children}</h5>;
    default:
      return <h6 key={key} className="font-semibold">{children}</h6>;
  }
}

function renderNode(node: JiraAdfNode, key: string): ReactNode {
  const children = node.content?.map((child, index) =>
    renderNode(child, `${key}-child-${index}`)
  );

  switch (node.type) {
    case 'doc':
      return <div key={key} className="space-y-2">{children}</div>;
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'text':
      return (
        <span key={key}>
          {applyMarks(node.text ?? '', node.marks, key)}
        </span>
      );
    case 'hardBreak':
      return <br key={key} />;
    case 'bulletList':
      return <ul key={key} className="list-disc pl-5 space-y-1">{children}</ul>;
    case 'orderedList':
      return <ol key={key} className="list-decimal pl-5 space-y-1">{children}</ol>;
    case 'listItem':
      return <li key={key} className="space-y-1">{children}</li>;
    case 'heading': {
      const level = Math.min(6, Math.max(1, getNumberAttr(node.attrs, 'level') ?? 1));
      return renderHeading(level, key, children);
    }
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-2 border-neutral-300 dark:border-neutral-600 pl-3 italic"
        >
          {children}
        </blockquote>
      );
    case 'codeBlock':
      return (
        <pre
          key={key}
          className="rounded bg-neutral-200 dark:bg-neutral-800 p-2 overflow-x-auto"
        >
          <code>{children}</code>
        </pre>
      );
    case 'panel':
      return (
        <div
          key={key}
          className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-2"
        >
          {children}
        </div>
      );
    case 'rule':
      return <hr key={key} className="border-neutral-300 dark:border-neutral-700" />;
    case 'emoji': {
      const emojiText = getStringAttr(node.attrs, 'text') ?? getStringAttr(node.attrs, 'shortName') ?? '';
      return <span key={key}>{emojiText}</span>;
    }
    case 'mention': {
      const mentionText = getStringAttr(node.attrs, 'text') ?? 'User';
      return <span key={key} className="font-medium">@{mentionText}</span>;
    }
    case 'table':
      return (
        <div key={key} className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
      );
    case 'tableRow':
      return <tr key={key} className="border-b border-neutral-300 dark:border-neutral-700">{children}</tr>;
    case 'tableHeader':
      return <th key={key} className="text-left font-semibold p-2 border border-neutral-300 dark:border-neutral-700">{children}</th>;
    case 'tableCell':
      return <td key={key} className="align-top p-2 border border-neutral-300 dark:border-neutral-700">{children}</td>;
    default:
      if (children && children.length > 0) {
        return <span key={key}>{children}</span>;
      }
      return null;
  }
}

export function JiraAdfRenderer({ doc, className }: JiraAdfRendererProps) {
  const normalizedDoc = toJiraAdfNode(doc);
  if (!normalizedDoc) {
    return null;
  }
  return <div className={className}>{renderNode(normalizedDoc, 'root')}</div>;
}
