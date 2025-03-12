"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TipTapEditor = ({ value, onChange, className = '' }: TipTapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Criar o editor
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Garantir que o componente só renderiza no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Atualizar o conteúdo do editor quando o valor muda externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="border-b border-gray-300 bg-gray-100 p-2 flex flex-wrap gap-2">
        {/* Barra de ferramentas básica */}
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="Título"
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="Subtítulo"
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Lista com marcadores"
        >
          • Lista
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Lista numerada"
        >
          1. Lista
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          title="Citação"
        >
          &ldquo;Citação&rdquo;
        </button>
        <button
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="p-1 rounded"
          title="Linha horizontal"
        >
          ―
        </button>
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          className="p-1 rounded"
          title="Desfazer"
        >
          ↩
        </button>
        <button
          onClick={() => editor?.chain().focus().redo().run()}
          className="p-1 rounded"
          title="Refazer"
        >
          ↪
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 flex-1 overflow-y-auto min-h-[300px]" />
    </div>
  );
};

export default TipTapEditor; 