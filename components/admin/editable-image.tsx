'use client';

import React, { useState, useRef } from 'react';
import { useAdmin } from '@/contexts/admin-context';
import { Upload, Loader2 } from 'lucide-react';

interface EditableImageProps {
  currentPath: string;
  onImageChange: (newPath: string) => void;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function EditableImage({
  currentPath,
  onImageChange,
  alt,
  className = '',
  width,
  height,
}: EditableImageProps) {
  const { isEditMode } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageChange(data.path);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative group">
      <img
        src={currentPath}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
      
      {isEditMode && (
        <>
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            title="Change image"
          >
            {isUploading ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <Upload size={32} />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

