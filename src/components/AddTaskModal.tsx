'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, getFlagsFromPriority, getTodayDate, priorityConfig, Project } from '@/types/task';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  currentProject: string;
  projects: Project[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, currentProject, projects }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'not_urgent_not_important' as TaskPriority,
    project_id: '',
    remarks: '',
    links: [] as string[],
    tags: [] as string[],
    due_date: '',
  });

  const [linkInput, setLinkInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update project_id when currentProject or projects change
  useEffect(() => {
    const project = projects.find(p => p.slug === currentProject);
    const projectId = project?.id || projects[0]?.id || '';

    setFormData(prev => {
      if (prev.project_id !== projectId) {
        return { ...prev, project_id: projectId };
      }
      return prev;
    });
  }, [currentProject, projects]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const project = projects.find(p => p.slug === currentProject);
      const projectId = project?.id || projects[0]?.id || '';

      setFormData({
        title: '',
        description: '',
        priority: 'not_urgent_not_important',
        project_id: projectId,
        remarks: '',
        links: [],
        tags: [],
        due_date: '',
      });
      setLinkInput('');
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, currentProject, projects]);

  if (!isOpen) return null;

  const isValidURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 500) {
      newErrors.title = 'Title must be 500 characters or less';
    }
    
    // Description validation
    if (formData.description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }
    
    // Links validation
    if (formData.links.length > 50) {
      newErrors.links = 'Maximum 50 links allowed';
    }
    
    // Tags validation
    if (formData.tags.length > 50) {
      newErrors.tags = 'Maximum 50 tags allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { isUrgent, isImportant } = getFlagsFromPriority(formData.priority);
    
    const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      project_id: formData.project_id,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: 'todo', // All new tasks start as 'todo'
      priority: formData.priority,
      is_urgent: isUrgent,
      is_important: isImportant,
      remarks: formData.remarks.trim() || undefined,
      links: formData.links.length > 0 ? formData.links : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      due_date: formData.due_date || undefined,
    };
    
    onAdd(newTask);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    const project = projects.find(p => p.slug === currentProject);
    const projectId = project?.id || projects[0]?.id || '';

    setFormData({
      title: '',
      description: '',
      priority: 'not_urgent_not_important',
      project_id: projectId,
      remarks: '',
      links: [],
      tags: [],
      due_date: '',
    });
    setLinkInput('');
    setTagInput('');
    setErrors({});
  };

  const addLink = () => {
    const trimmedLink = linkInput.trim();
    
    if (!trimmedLink) return;
    
    // Validate URL format
    if (!isValidURL(trimmedLink)) {
      setErrors(prev => ({ ...prev, linkInput: 'Please enter a valid URL (e.g., https://example.com)' }));
      return;
    }
    
    if (formData.links.includes(trimmedLink)) {
      setErrors(prev => ({ ...prev, linkInput: 'This link is already added' }));
      return;
    }
    
    if (formData.links.length >= 50) {
      setErrors(prev => ({ ...prev, linkInput: 'Maximum 50 links allowed' }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, trimmedLink]
    }));
    setLinkInput('');
    setErrors(prev => {
      const { linkInput, ...rest } = prev;
      return rest;
    });
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) return;
    
    if (formData.tags.includes(trimmedTag)) {
      setErrors(prev => ({ ...prev, tagInput: 'This tag is already added' }));
      return;
    }
    
    if (formData.tags.length >= 50) {
      setErrors(prev => ({ ...prev, tagInput: 'Maximum 50 tags allowed' }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setTagInput('');
    setErrors(prev => {
      const { tagInput, ...rest } = prev;
      return rest;
    });
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-2 sm:mx-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title * <span className="text-gray-500 text-xs">({formData.title.length}/500)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-800 placeholder:font-medium ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
            >
              {projects.filter(p => p.slug === 'personal' || p.slug === 'csuite').map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500 text-xs">({formData.description.length}/5000)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={5000}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-800 placeholder:font-medium ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter task description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Status Info and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                📝 To Do (All new tasks start here)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (Eisenhower Matrix)
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              >
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <option key={priority} value={priority}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              min={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              placeholder="Select a date"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select a future date for deadline tracking
            </p>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Links <span className="text-gray-500 text-xs">({formData.links.length}/50)</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  setErrors(prev => {
                    const { linkInput, ...rest } = prev;
                    return rest;
                  });
                }}
                onKeyPress={(e) => handleKeyPress(e, addLink)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-800 placeholder:font-medium ${
                  errors.linkInput ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={addLink}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            {errors.linkInput && (
              <p className="text-red-500 text-sm mb-2">{errors.linkInput}</p>
            )}
            {errors.links && (
              <p className="text-red-500 text-sm mb-2">{errors.links}</p>
            )}
            {formData.links.length > 0 && (
              <div className="space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm text-blue-600 truncate">{link}</span>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-gray-500 text-xs">({formData.tags.length}/50)</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setErrors(prev => {
                    const { tagInput, ...rest } = prev;
                    return rest;
                  });
                }}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-800 placeholder:font-medium ${
                  errors.tagInput ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="urgent, meeting, research"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            {errors.tagInput && (
              <p className="text-red-500 text-sm mb-2">{errors.tagInput}</p>
            )}
            {errors.tags && (
              <p className="text-red-500 text-sm mb-2">{errors.tags}</p>
            )}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-800 placeholder:font-medium"
              placeholder="Any additional notes or context..."
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px] order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors min-h-[44px] order-1 sm:order-2"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;