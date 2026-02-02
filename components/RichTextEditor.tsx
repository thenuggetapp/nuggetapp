'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Start writing...',
  required,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value || value.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      } else {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = '<p><br></p>';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;

      html = html.replace(/<div>/g, '<p>').replace(/<\/div>/g, '</p>');
      html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p>');

      if (html && !html.match(/^<(p|h[1-6]|ul|ol|blockquote|pre)/)) {
        html = `<p>${html}</p>`;
      }

      onChange(html);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const currentElement = range.startContainer.parentElement;

        if (currentElement?.tagName === 'PRE') {
          return;
        }

        if (!currentElement?.closest('ul, ol, blockquote')) {
          e.preventDefault();
          document.execCommand('formatBlock', false, 'p');
          document.execCommand('insertParagraph', false);
        }
      }
    }
  };

  const insertHeading = (level: 2 | 3) => {
    executeCommand('formatBlock', `h${level}`);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
      setTimeout(() => {
        const imgs = editorRef.current?.querySelectorAll('img:not([alt])');
        if (imgs && imgs.length > 0) {
          const lastImg = imgs[imgs.length - 1] as HTMLImageElement;
          const alt = prompt('Enter image alt text (optional):') || 'image';
          lastImg.alt = alt;
          lastImg.style.maxWidth = '100%';
          lastImg.style.height = 'auto';
          handleInput();
        }
      }, 100);
    }
  };

  const insertList = (ordered: boolean) => {
    executeCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const formatText = (format: string) => {
    executeCommand(format);
  };

  const toolbarButtons = [
    {
      icon: Heading2,
      label: 'Heading 2',
      onClick: () => insertHeading(2),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      onClick: () => insertHeading(3),
    },
    {
      icon: Bold,
      label: 'Bold',
      onClick: () => formatText('bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      onClick: () => formatText('italic'),
    },
    {
      icon: List,
      label: 'Bullet List',
      onClick: () => insertList(false),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      onClick: () => insertList(true),
    },
    {
      icon: LinkIcon,
      label: 'Link',
      onClick: insertLink,
    },
    {
      icon: Image,
      label: 'Image',
      onClick: insertImage,
    },
    {
      icon: Quote,
      label: 'Blockquote',
      onClick: () => executeCommand('formatBlock', 'blockquote'),
    },
    {
      icon: Code,
      label: 'Code',
      onClick: () => executeCommand('formatBlock', 'pre'),
    },
    {
      icon: Undo,
      label: 'Undo',
      onClick: () => executeCommand('undo'),
    },
    {
      icon: Redo,
      label: 'Redo',
      onClick: () => executeCommand('redo'),
    },
  ];

  const isEmpty = !editorRef.current?.textContent?.trim();

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className={`border rounded-lg overflow-hidden ${isFocused ? 'ring-2 ring-slate-950 ring-offset-2' : ''}`}>
        <div className="bg-slate-50 border-b p-2 flex flex-wrap gap-1">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.onClick}
              title={button.label}
              className="h-8 w-8 p-0 hover:bg-slate-200"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="prose prose-slate max-w-none min-h-[500px] p-4 bg-white focus:outline-none"
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>

      <style jsx>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
      `}</style>

      <div className="text-sm text-slate-500">
        <p>
          Use the toolbar buttons to format your content. Content is automatically saved as you type.
        </p>
      </div>

      {required && (
        <input
          type="text"
          value={editorRef.current?.textContent || ''}
          required
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: 'none',
          }}
          tabIndex={-1}
        />
      )}
    </div>
  );
}
