"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Pencil } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { useState, useEffect } from "react"
import { EditableImage } from "./admin/editable-image"

export interface Project {
  id?: number
  title: string
  subtitle?: string
  description: string
  image?: string
  image_path?: string
  date: string
  beneficiaries?: string
  url?: string
}

export function ProjectCard({ project, onUpdate }: { project: Project; onUpdate?: () => void }) {
  const { isEditMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [editedSubtitle, setEditedSubtitle] = useState(project.subtitle);
  const [editedDescription, setEditedDescription] = useState(project.description);
  const [editedDate, setEditedDate] = useState(project.date);
  const [editedBeneficiaries, setEditedBeneficiaries] = useState(project.beneficiaries);

  // Close editing mode when admin mode is turned off
  useEffect(() => {
    if (!isEditMode && isEditing) {
      setIsEditing(false);
    }
  }, [isEditMode, isEditing]);

  const handleCardClick = () => {
    if (!isEditMode && !isEditing) {
      window.open(project.url, '_blank');
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!project.id) {
      console.log('No project ID, cannot save');
      return;
    }

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          title: editedTitle,
          subtitle: editedSubtitle,
          description: editedDescription,
          date: editedDate,
          beneficiaries: editedBeneficiaries,
        }),
      });

      if (response.ok) {
        console.log('Project saved successfully');
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        console.error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(project.title);
    setEditedSubtitle(project.subtitle);
    setEditedDescription(project.description);
    setEditedDate(project.date);
    setEditedBeneficiaries(project.beneficiaries);
    setIsEditing(false);
  };

  return (
    <Card 
      className={`bg-white/95 backdrop-blur-lg border-white/30 shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden p-0 group relative ${
        !isEditMode && !isEditing ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Edit Button - Only visible in edit mode */}
      {isEditMode && !isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-2 right-2 z-10 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition-opacity"
          title="Edit Project"
        >
          <Pencil size={16} />
        </button>
      )}

      <div className="relative">
        {isEditMode ? (
          <EditableImage
            currentPath={project.image_path || project.image || "/placeholder.svg"}
            onImageChange={async (newPath) => {
              if (!project.id) return;
              
              try {
                const response = await fetch('/api/admin/projects', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: project.id,
                    image_path: newPath,
                  }),
                });

                if (response.ok && onUpdate) {
                  onUpdate();
                }
              } catch (error) {
                console.error('Error updating image:', error);
              }
            }}
            alt={project.title}
            width={400}
            height={300}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
          />
        ) : (
          <img
            src={project.image_path || project.image || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
            loading="lazy"
            width={400}
            height={300}
          />
        )}
      </div>
      <CardHeader className="pb-2 px-4 sm:px-6">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-primary leading-tight text-center border-2 border-blue-500 rounded px-2 py-1 w-full"
            style={{fontSize: 'clamp(1rem, 1.5vw, 1.25rem)'}}
          />
        ) : (
          <CardTitle className="font-bold text-primary leading-tight text-center" style={{fontSize: 'clamp(1rem, 1.5vw, 1.25rem)'}}>{project.title}</CardTitle>
        )}
      </CardHeader>
       <CardContent className="space-y-4 flex-1 flex flex-col px-4 sm:px-6 pb-4" onClick={(e) => isEditing && e.stopPropagation()}>
         {isEditing ? (
           <>
             <input
               type="text"
               value={editedSubtitle || ''}
               onChange={(e) => setEditedSubtitle(e.target.value)}
               onClick={(e) => e.stopPropagation()}
               placeholder="Subtitle (optional)"
               className="font-semibold text-gray-800 leading-tight border-2 border-blue-500 rounded px-2 py-1 w-full"
               style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}
             />
             <textarea
               value={editedDescription}
               onChange={(e) => setEditedDescription(e.target.value)}
               onClick={(e) => e.stopPropagation()}
               className="text-gray-600 font-medium text-pretty leading-relaxed flex-1 border-2 border-blue-500 rounded px-2 py-1 w-full resize-none"
               style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}
               rows={6}
             />
           </>
         ) : (
           <>
             {project.subtitle && (
               <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>{project.subtitle}</h3>
             )}
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>{project.description}</p>
           </>
         )}

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-gray-700 border-b border-blue-500 flex-1"
              />
            ) : (
              <span className="text-sm font-medium text-gray-700 truncate">{project.date}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={editedBeneficiaries}
                onChange={(e) => setEditedBeneficiaries(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-gray-700 border-b border-blue-500 flex-1"
              />
            ) : (
              <span className="text-sm font-medium text-gray-700 truncate">{project.beneficiaries}</span>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCancel(); }}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

