import { useEffect, useRef } from 'react';

import { Check, Trash } from 'lucide-react';

import { cn, getUrlFromString } from '@/lib/utils';

export const LinkSelector = ({ editor, isOpen, setIsOpen }) => {
  const inputRef = useRef(null);

  // Autofocus on input by default
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleLinkSubmission = () => {
    const url = getUrlFromString(inputRef.current?.value || '');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="hover:bg-stone-100 active:bg-stone-200 flex h-full items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        type="button">
        <p className="text-base">↗</p>
        <p
          className={cn('decoration-stone-400 underline underline-offset-4', {
            'text-blue-500': editor.isActive('link'),
          })}>
          Link
        </p>
      </button>
      {isOpen && (
        <div className="border-stone-200 fixed top-full z-[99999] mt-1 flex w-60 overflow-hidden rounded border bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-1">
          <input
            ref={inputRef}
            type="url"
            placeholder="Paste a link"
            className="flex-1 bg-white p-1 text-sm outline-none"
            defaultValue={editor.getAttributes('link').href || ''}
          />
          {editor.getAttributes('link').href ? (
            <button
              className="flex items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setIsOpen(false);
              }}
              type="button">
              <Trash className="h-4 w-4" />
            </button>
          ) : (
            <button
              className="hover:bg-stone-100 flex items-center rounded-sm p-1 text-gray-600 transition-all"
              onClick={handleLinkSubmission}
              type="button">
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
