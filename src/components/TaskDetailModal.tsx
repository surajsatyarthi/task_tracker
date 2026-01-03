'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, statusConfig, getTodayDate, formatMinutes, getTimeComparisonStatus } from '@/types/task';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LinkPreview from './LinkPreview';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { useTimerNotifications } from '@/hooks/useTimerNotifications';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  initialEditMode?: boolean;
}

const priorityConfig = {
  urgent_important: { label: 'Do First', color: 'bg-red-100 text-red-800', icon: '🚨' },
  urgent_not_important: { label: 'Delegate', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
  not_urgent_important: { label: 'Schedule', color: 'bg-green-100 text-green-800', icon: '📅' },
  not_urgent_not_important: { label: 'Eliminate', color: 'bg-blue-100 text-blue-800', icon: '🗑️' },
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete, initialEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [statusChanging, setStatusChanging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estimateHours, setEstimateHours] = useState(0);
  const [estimateMinutes, setEstimateMinutes] = useState(0);
  const [manualHours, setManualHours] = useState(0);
  const [manualMinutes, setManualMinutes] = useState(0);
  
  // Timer hook
  const { isRunning, totalMinutes, displayMinutes, displaySeconds, startTimer, pauseTimer, stopTimer } = useTaskTimer(task);
  useTimerNotifications(task, totalMinutes);

  if (!isOpen || !task) return null;

  const statusStyle = statusConfig[task.status];
  const priorityStyle = priorityConfig[task.priority];

  const handleEdit = () => {
    setIsEditing(true);
    const estimatedMins = task.estimated_minutes || 0;
    setEstimateHours(Math.floor(estimatedMins / 60));
    setEstimateMinutes(estimatedMins % 60);
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      remarks: task.remarks,
      due_date: task.due_date,
      estimated_minutes: task.estimated_minutes,
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleSave = async () => {
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

    setSaving(true);
    await onUpdate(task.id, editedTask);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTask({});
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (isEditing) {
      setEditedTask({ ...editedTask, status });
    } else {
      setStatusChanging(true);
      // If moving to done and timer is running, stop it first
      if (status === 'done' && isRunning) {
        await stopTimer();
      }
      await onUpdate(task.id, { status });
      setTimeout(() => setStatusChanging(false), 500);
    }
  };

  const currentTask = isEditing ? { ...task, ...editedTask } : task;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
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

          {/* Time Tracking Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">⏱️ Time Tracking</h3>
            
            {/* Estimated Time */}
            {isEditing ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={estimateHours}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        setEstimateHours(hours);
                        const totalMins = (hours * 60) + estimateMinutes;
                        setEditedTask({ ...editedTask, estimated_minutes: totalMins > 0 ? totalMins : undefined });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={estimateMinutes}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value) || 0;
                        setEstimateMinutes(mins);
                        const totalMins = (estimateHours * 60) + mins;
                        setEditedTask({ ...editedTask, estimated_minutes: totalMins > 0 ? totalMins : undefined });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : task.estimated_minutes ? (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Estimated:</span>
                <span className="text-sm font-medium">{formatMinutes(task.estimated_minutes)}</span>
              </div>
            ) : null}
            
            {/* Active Timer - Only show when status is "doing" */}
            {!isEditing && task.status === 'doing' && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-3xl font-mono font-bold text-blue-900">
                      {Math.floor(totalMinutes / 60)}h {displayMinutes}m {displaySeconds}s
                    </div>
                    {task.estimated_minutes && (
                      <div className="text-xs text-blue-600 mt-1">
                        {Math.round((totalMinutes / task.estimated_minutes) * 100)}% of estimate
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isRunning ? (
                      <>
                        <button
                          onClick={pauseTimer}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-semibold"
                        >
                          ⏸️ Pause
                        </button>
                        <button
                          onClick={stopTimer}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          ⏹️ Stop
                        </button>
                      </>
                    ) : task.timer_minutes || totalMinutes > 0 ? (
                      <>
                        <button
                          onClick={startTimer}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                          ▶️ Resume
                        </button>
                        <button
                          onClick={stopTimer}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          ⏹️ Stop
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startTimer}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        ▶️ Start
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {task.estimated_minutes && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        totalMinutes > task.estimated_minutes
                          ? 'bg-red-600'
                          : totalMinutes > task.estimated_minutes * 0.8
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min((totalMinutes / task.estimated_minutes) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Manual Time Entry - for backdating or when task is done */}
            {!isEditing && task.status === 'done' && task.estimated_minutes && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual Time Entry (for backdating)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={manualHours}
                      onChange={(e) => setManualHours(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const totalMins = (manualHours * 60) + manualMinutes;
                      if (totalMins > 0) {
                        onUpdate(task.id, { manual_minutes: totalMins });
                        setManualHours(0);
                        setManualMinutes(0);
                      }
                    }}
                    className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            
            {/* Final Comparison - only show when done and has estimate */}
            {!isEditing && task.status === 'done' && task.estimated_minutes && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Estimated:</span>
                  <span className="text-sm font-medium">{formatMinutes(task.estimated_minutes)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Actual:</span>
                  <span className="text-sm font-medium">
                    {formatMinutes((task.timer_minutes || 0) + (task.manual_minutes || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold">Result:</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    getTimeComparisonStatus(task) === 'under' ? 'text-green-600' :
                    getTimeComparisonStatus(task) === 'over' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {getTimeComparisonStatus(task) === 'under' ? '✓ Under estimate' : 
                     getTimeComparisonStatus(task) === 'over' ? '⚠️ Over estimate' : 
                     '≈ Near estimate'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Actions */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Quick Actions {statusChanging && <span className="text-blue-600 text-xs ml-2 animate-pulse">✓ Updating...</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as TaskStatus)}
                    disabled={task.status === status || statusChanging}
                    className={`
                      px-3 py-1 rounded-md text-sm font-semibold transition-all
                      ${task.status === status 
                        ? `${config.color} opacity-50 cursor-not-allowed` 
                        : statusChanging
                        ? `${config.color} opacity-60 cursor-wait`
                        : `${config.color} hover:opacity-80 hover:scale-105 cursor-pointer`
                      }
                    `}
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
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors min-h-[44px] mr-auto"
              >
                Delete
              </button>
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