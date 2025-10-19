'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/contexts/admin-context';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
  contentKey: string;
  initialValue: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  multiline?: boolean;
}

export function EditableText({
  contentKey,
  initialValue,
  className = '',
  as: Component = 'p',
  multiline = false,
}: EditableTextProps) {
  const { isEditMode } = useAdmin();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async (newValue: string) => {
    if (newValue === initialValue) return;

    setIsSaving(true);
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: contentKey,
          value: newValue,
          type: 'text',
        }),
      });

      if (response.ok) {
        console.log('Content saved:', contentKey);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 500ms of no typing
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newValue);
    }, 500);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Save immediately on blur
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    handleSave(value);
  };

  if (!isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <div className="relative group">
      {isEditing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`${className} border-2 border-blue-500 rounded px-2 py-1 w-full resize-none`}
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`${className} border-2 border-blue-500 rounded px-2 py-1 w-full`}
            autoFocus
          />
        )
      ) : (
        <Component className={className}>{value}</Component>
      )}
      
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white p-1 rounded-sm hover:bg-blue-600"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
      )}
      
      {isSaving && (
        <span className="absolute -right-16 top-0 text-xs text-gray-500">
          Saving...
        </span>
      )}
    </div>
  );
}

