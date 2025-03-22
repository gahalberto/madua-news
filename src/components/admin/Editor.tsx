'use client';

import { useState, useEffect } from 'react';
import { Bold, Italic, Heading, Link, ImageIcon, Code, List } from 'lucide-react';

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

const Editor = ({ initialContent, onChange, className = '', placeholder = 'Escreva o conteúdo do seu post aqui...' }: EditorProps) => {
  const [content, setContent] = useState(initialContent || '');

  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'texto em negrito'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'texto em itálico'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'heading':
        formattedText = `## ${selectedText || 'Título'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link'}](url)`;
        cursorOffset = -1;
        break;
      case 'image':
        formattedText = `![${selectedText || 'alt text'}](url)`;
        cursorOffset = -1;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText || 'código'}\n\`\`\``;
        cursorOffset = selectedText ? -4 : -8;
        break;
      case 'list':
        if (selectedText) {
          formattedText = selectedText
            .split('\n')
            .map(line => `- ${line}`)
            .join('\n');
        } else {
          formattedText = '- item';
        }
        cursorOffset = selectedText ? 0 : 0;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    setContent(newContent);
    onChange(newContent);

    // Reposicionar o cursor após a formatação
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length + cursorOffset;
      textarea.selectionStart = newPosition;
      textarea.selectionEnd = newPosition;
    }, 0);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex flex-wrap gap-1 border border-gray-300 bg-gray-50 p-2 rounded-t-lg">
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('bold')}
          title="Negrito"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('italic')}
          title="Itálico"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('heading')}
          title="Título"
        >
          <Heading size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('link')}
          title="Link"
        >
          <Link size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('image')}
          title="Imagem"
        >
          <ImageIcon size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('code')}
          title="Código"
        >
          <Code size={18} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => insertFormatting('list')}
          title="Lista"
        >
          <List size={18} />
        </button>
      </div>
      <textarea
        id="editor"
        className="w-full min-h-[300px] p-4 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-primary focus:border-primary"
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
      ></textarea>
      <div className="mt-2 text-xs text-gray-500">
        <p>Use a formatação Markdown para estruturar seu texto:</p>
        <ul className="list-disc pl-5 mt-1">
          <li><strong>**Negrito**</strong> para texto em negrito</li>
          <li><em>*Itálico*</em> para texto em itálico</li>
          <li><strong>## Título</strong> para títulos</li>
          <li><strong>[Link](url)</strong> para adicionar links</li>
        </ul>
      </div>
    </div>
  );
};

export default Editor; 