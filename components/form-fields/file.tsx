'use client';

import * as React from 'react';

export interface FileProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * The ID of the file input element
   */
  id: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileProps>(({ ...props }, ref) => {
  return (
    <div className="mt-4 flex items-center">
      <input {...props} type="file" multiple className="hidden" accept="image/*" ref={ref} />
      <label
        htmlFor={props.id}
        className="focus:ring-indigo-500 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2">
        Select image(s)
      </label>
    </div>
  );
});

FileInput.displayName = 'FileInput';

export { FileInput };
