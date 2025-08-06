'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect, useState } from 'react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Unlink, ArrowRight } from 'lucide-react';

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
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
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
      Link.extend({
        inclusive: false,
      }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
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
      handleKeyDown: (view, event) => {
        // Handle space key to exit link formatting when at the end of a link
        if (event.key === ' ') {
          const { state } = view;
          const { from, to } = state.selection;

          if (from === to) {
            const $pos = state.doc.resolve(from);
            const linkMark = $pos.marks().find(mark => mark.type.name === 'link');

            if (linkMark) {
              // Insert space without link formatting
              const tr = state.tr.insertText(' ', from);
              // Remove link mark from the inserted space
              tr.removeStoredMark(linkMark.type);
              view.dispatch(tr);
              return true;
            }
          }
        }

        return false;
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

  const openLinkDialog = useCallback(() => {
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const selectedText = editor?.state.doc.textBetween(from, to) || '';

    // If text is selected, use it as link text
    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }

    // If the selection is already a link, get the current URL
    const currentLink = editor?.getAttributes('link');
    if (currentLink?.href) {
      setLinkUrl(currentLink.href);
    } else {
      setLinkUrl('');
    }

    setShowLinkDialog(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!linkUrl) return;

    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const selectedText = editor?.state.doc.textBetween(from, to) || '';

    if (selectedText) {
      // If text is selected, just add the link
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    } else if (linkText) {
      // If no text is selected but we have link text, insert it
      editor?.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
    } else {
      // If no text provided, use the URL as text
      editor?.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run();
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText]);

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const cancelLink = useCallback(() => {
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, []);

  const exitLink = useCallback(() => {
    if (!editor?.isActive('link')) return;

    // Insert a space at the current position and remove link formatting from it
    editor?.chain()
      .focus()
      .insertContent(' ')
      .unsetLink()
      .run();
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

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={openLinkDialog}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center ${
            editor.isActive('link')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </button>

        <button
          onClick={unsetLink}
          className="px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          title="Remove Link"
          disabled={!editor.isActive('link')}
        >
          <Unlink size={18} />
        </button>

        <button
          onClick={exitLink}
          className="px-3 py-1 rounded text-sm font-medium transition-colors flex items-center justify-center bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          title="Exit Link (add space after link)"
          disabled={!editor.isActive('link')}
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px] bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text or leave empty to use selected text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelLink}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={setLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}