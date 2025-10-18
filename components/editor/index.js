'use client';

import { useEffect, useRef, useState } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import { useCompletion } from 'ai/react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import { getPrevText } from '@/lib/editor';

import { EditorBubbleMenu } from './components/bubble-menu';
import { ImageResizer } from './components/image-resizer';
import { TiptapExtensions } from './extensions';
import { TiptapEditorProps } from './props';

export default function Editor({ initialContent, onChange }) {
  // const [content, setContent] = useLocalStorage('content', DEFAULT_EDITOR_CONTENT);
  const [content, setContent] = useState(initialContent || {});
  const [saveStatus, setSaveStatus] = useState('Saved');

  const [hydrated, setHydrated] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const html = editor.getHTML();

    setSaveStatus('Saving...');
    setContent(html);
    onChange(html);
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 500);
  }, 750);

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus('Unsaved');
      const selection = e.editor.state.selection;
      const lastTwo = getPrevText(e.editor, {
        chars: 2,
      });
      if (lastTwo === '++' && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(
          getPrevText(e.editor, {
            chars: 5000,
          }),
        );
      } else {
        debouncedUpdates(e);
      }
    },
    autofocus: 'end',
    immediatelyRender: false,
  });

  const { complete, completion, isLoading, stop } = useCompletion({
    id: 'novel',
    api: '/api/generate',
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const prev = useRef('');

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff);
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'z')) {
        stop();
        if (e.key === 'Escape') {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent('++');
      }
    };
    const mousedownHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm('AI writing paused. Continue?')) {
        complete(editor?.getText() || '');
      }
    };
    if (isLoading) {
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('mousedown', mousedownHandler);
    } else {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content);
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  return (
    <div>
      {editor && <EditorBubbleMenu editor={editor} />}
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="border-stone-200 relative min-h-[500px] w-full max-w-screen-lg bg-white p-8 sm:mb-8 sm:rounded-lg sm:border sm:shadow-lg dark:bg-gray-950/40">
        <div className="bg-stone-100 absolute right-5 top-5 mb-5 rounded-lg px-2 py-1 text-sm text-gray-400">
          {saveStatus}
        </div>
        {editor?.isActive('image') && <ImageResizer editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
