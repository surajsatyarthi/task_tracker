'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, statusConfig, getTodayDate } from '@/types/task';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LinkPreview from './LinkPreview';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const priorityConfig = {
  urgent_important: { label: 'Do First', color: 'bg-red-100 text-red-800', icon: '🚨' },
  urgent_not_important: { label: 'Delegate', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
  not_urgent_important: { label: 'Schedule', color: 'bg-green-100 text-green-800', icon: '📅' },
  not_urgent_not_important: { label: 'Eliminate', color: 'bg-blue-100 text-blue-800', icon: '🗑️' },
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  if (!isOpen || !task) return null;

  const statusStyle = statusConfig[task.status];
  const priorityStyle = priorityConfig[task.priority];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      remarks: task.remarks,
      due_date: task.due_date,
    });
  };

  const handleSave = () => {
    // Validate title
    const title = editedTask.title?.trim() || task.title.trim();
    if (!title) {
      alert('Title is required');
      return;
    }
    if (title.length > 500) {
      alert('Title must be 500 characters or less');
      return;
    }

    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTask({});
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (isEditing) {
      setEditedTask({ ...editedTask, status });
    } else {
      onUpdate(task.id, { status });
    }
  };

  const currentTask = isEditing ? { ...task, ...editedTask } : task;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{currentTask.title}</h3>
            )}
          </div>

          {/* Description */}
          {(currentTask.description || isEditing) && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              ) : (
                <p className="text-gray-900 font-medium">{currentTask.description}</p>
              )}
            </div>
          )}

          {/* Status, Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Status</label>
              {isEditing ? (
                <select
                  value={editedTask.status || task.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                >
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.color}`}>
                  <span className="mr-2">{statusStyle.icon}</span>
                  {statusStyle.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Priority</label>
              {isEditing ? (
                <select
                  value={editedTask.priority || task.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  aria-label="Task priority"
                >
                  {Object.entries(priorityConfig).map(([priority, config]) => (
                    <option key={priority} value={priority}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${priorityStyle.color}`}>
                  <span className="mr-2">{priorityStyle.icon}</span>
                  {priorityStyle.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.due_date || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value || undefined })}
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                />
              ) : (
                <div className="text-gray-900 font-medium">
                  {currentTask.due_date ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      new Date(currentTask.due_date) < new Date(getTodayDate()) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      📅 {new Date(currentTask.due_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">No deadline</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Status Actions */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as TaskStatus)}
                    className={`
                      px-3 py-1 rounded-md text-sm font-semibold transition-colors
                      ${task.status === status 
                        ? `${config.color} opacity-50 cursor-not-allowed` 
                        : `${config.color} hover:opacity-80 cursor-pointer`
                      }
                    `}
                    disabled={task.status === status}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {currentTask.links && currentTask.links.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Links</label>
              <div className="space-y-2">
                {currentTask.links.map((link, index) => (
                  <LinkPreview
                    key={index}
                    url={link}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          {(currentTask.remarks || isEditing) && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Remarks</label>
              {isEditing ? (
                <textarea
                  value={editedTask.remarks || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              ) : (
                <p className="text-gray-900 font-medium">{currentTask.remarks}</p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-bold text-gray-800">Created</label>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(task.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800">Last Updated</label>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(task.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors min-h-[44px]"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px]"
              >
                Close
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors min-h-[44px]"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;