import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import { isEmptyEditorHtml } from '@/utils/editorHtml';

export interface TicketDescriptionEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly id?: string;
  readonly className?: string;
  readonly minHeight?: string;
  readonly disabled?: boolean;
}

export function TicketDescriptionEditor({
  value,
  onChange,
  placeholder = 'Description (optional)',
  id,
  className = '',
  minHeight = '5rem',
  disabled = false,
}: TicketDescriptionEditorProps) {
  const lastValueFromParent = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          'ticket-description-editor min-w-0 w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const raw = ed.getHTML();
      lastValueFromParent.current = isEmptyEditorHtml(raw) ? '' : raw;
      onChange(lastValueFromParent.current);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastValueFromParent.current) return;
    lastValueFromParent.current = value;
    editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div
        className={`rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 ${className}`}
        style={{ minHeight }}
        aria-hidden
      />
    );
  }

  return (
    <div
      id={id}
      className={`rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus-within:border-neutral-400 dark:focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-500 overflow-visible ${className}`}
      style={{ minHeight }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
