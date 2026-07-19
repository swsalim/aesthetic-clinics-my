'use client';

import { useState } from 'react';

import Image from 'next/image';

import type { ClinicImageEntry } from '@/lib/clinic-images';
import { GripVertical, XIcon } from 'lucide-react';

import { ImageKit } from '@/components/image/image-kit';
import { cn } from '@/lib/utils';

interface ClinicImageGalleryProps {
  images: ClinicImageEntry[];
  onChange: (images: ClinicImageEntry[]) => void;
  onRemoveExisting: (imagekitFileId: string) => void;
}

function getEntryKey(entry: ClinicImageEntry): string {
  return entry.kind === 'existing' ? entry.id : entry.tempId;
}

export function ClinicImageGallery({
  images,
  onChange,
  onRemoveExisting,
}: ClinicImageGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    const entry = images[index];

    if (entry.kind === 'existing') {
      onRemoveExisting(entry.imagekit_file_id);
    }

    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Drag images to reorder. The first image is shown first on the listing.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((entry, index) => {
          const isDragging = draggedIndex === index;
          const isDropTarget = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={getEntryKey(entry)}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative rounded-md shadow-md transition-opacity',
                isDragging && 'opacity-50',
                isDropTarget && 'ring-2 ring-primary ring-offset-2',
              )}>
              <div className="aspect-h-3 aspect-w-4 relative overflow-hidden rounded-md">
                <button
                  type="button"
                  className="absolute left-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-full border-2 border-gray-700 bg-white active:cursor-grabbing dark:bg-gray-900/90"
                  aria-label={`Drag image ${index + 1}`}>
                  <GripVertical className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white dark:bg-gray-900/90"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove image ${index + 1}`}>
                  <XIcon className="mx-auto h-5 w-5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 z-10 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                    Cover
                  </span>
                )}
                {entry.kind === 'new' ? (
                  <Image
                    src={URL.createObjectURL(entry.file)}
                    alt={`New image ${index + 1}`}
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                ) : (
                  <ImageKit
                    src={entry.image_url}
                    alt={`Clinic image ${index + 1}`}
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
