import { Editor } from '@tiptap/core';

interface GetPrevTextOptions {
  chars: number;
  offset?: number;
}

/**
 * Gets the text preceding the current cursor position
 *
 * @param editor - The TipTap editor instance
 * @param options - Configuration options
 * @param options.chars - Number of characters to retrieve
 * @param options.offset - Offset from cursor position (default: 0)
 * @returns The text preceding the cursor
 */
export const getPrevText = (editor: Editor, { chars, offset = 0 }: GetPrevTextOptions): string => {
  return editor.state.doc.textBetween(
    Math.max(0, editor.state.selection.from - chars),
    editor.state.selection.from - offset,
    '\n',
  );
};
