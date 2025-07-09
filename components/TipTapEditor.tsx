'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect } from 'react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote } from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TipTapEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
        'data-placeholder': placeholder,
      },
    },
  });

  // Add this useEffect to update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          onClick={toggleBold}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('bold')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        
        <button
          onClick={toggleItalic}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('italic')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        
        <button
          onClick={toggleStrike}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('strike')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Strike"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={() => toggleHeading(1)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        
        <button
          onClick={() => toggleHeading(2)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        
        <button
          onClick={() => toggleHeading(3)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={toggleBulletList}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('bulletList')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        
        <button
          onClick={toggleOrderedList}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('orderedList')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        
        <button
          onClick={toggleBlockquote}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('blockquote')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Blockquote"
        >
          <Quote size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px] bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}