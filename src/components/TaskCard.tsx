'use client';

import React from 'react';
import { Task, statusConfig, isTaskOverdue, formatDateForDisplay, getDaysUntilDue, formatMinutes } from '@/types/task';
import { CalendarIcon, UserIcon, LinkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
  highlight?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onClick, highlight }) => {
  const statusStyle = statusConfig[task.status];
  const isOverdue = isTaskOverdue(task);

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const renderWithHighlight = (text: string) => {
    const q = (highlight || '').trim();
    if (!q) return text;
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    const parts = text.split(re);
    return (
      <>
        {parts.map((part, i) => (
          re.test(part) ? (
            <mark key={i} className="bg-yellow-200">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </>
    );
  };

  return (
    <div
      className={`
        bg-white rounded-lg border p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-[1.01] relative min-h-[44px] animate-fadeIn
        ${isDragging ? 'shadow-2xl border-blue-300 scale-105 rotate-1' : 'hover:border-gray-300'}
        ${isOverdue ? 'border-red-300 bg-red-50 shadow-red-100 shadow-md' : 'border-gray-200'}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Overdue Warning */}
      {isOverdue && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg animate-pulse">
          <ExclamationTriangleIcon className="w-4 h-4" />
        </div>
      )}
      
      {/* Task Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className={`font-semibold leading-tight line-clamp-2 ${
          isOverdue ? 'text-red-800' : 'text-gray-900'
        }`}>
          {renderWithHighlight(task.title)}
        </h4>
        <span className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0
          ${statusStyle.color}
        `}>
          <span className="mr-1">{statusStyle.icon}</span>
          {statusStyle.label}
        </span>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {renderWithHighlight(task.description)}
        </p>
      )}

      {/* Task Remarks */}
      {task.remarks && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">
          {renderWithHighlight(task.remarks)}
        </p>
      )}

      {/* Task Metadata */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {/* Timer Badge - Only show when doing and timer running */}
        {task.status === 'doing' && task.timer_running && (
          <div className="flex items-center gap-1 text-red-500 font-semibold">
            <span className="animate-pulse">●</span>
            <span>Timer active</span>
          </div>
        )}
        
        {/* Time Estimate Badge */}
        {task.estimated_minutes && (
          <div className="flex items-center gap-1 text-blue-600">
            <span>⏱️</span>
            <span>{formatMinutes(task.estimated_minutes)} est.</span>
          </div>
        )}
        
        {/* Tracked Time Badge */}
        {(task.timer_minutes > 0 || task.manual_minutes > 0) && (
          <div className="flex items-center gap-1 text-green-600">
            <span>⏲️</span>
            <span>{formatMinutes(task.timer_minutes + task.manual_minutes)} tracked</span>
          </div>
        )}
        
        {task.owner && (
          <div className="flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            <span>{task.owner}</span>
          </div>
        )}
        
        {task.due_date && (
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-red-600 font-medium' : ''
          }`}>
            <CalendarIcon className="w-3 h-3" />
            <span>
              {formatDateForDisplay(task.due_date)}
              {isOverdue && (
                <span className="ml-1 text-red-600 font-bold">
                  (Overdue: {Math.abs(getDaysUntilDue(task.due_date))} days)
                </span>
              )}
              {!isOverdue && task.due_date && (
                <span className="ml-1 text-green-600">
                  ({getDaysUntilDue(task.due_date)} days left)
                </span>
              )}
            </span>
          </div>
        )}
        
        {task.links && task.links.length > 0 && (
          <div className="flex items-center gap-1">
            <LinkIcon className="w-3 h-3" />
            <span>{task.links.length} link{task.links.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Drag Handle Indicator */}
      {!isDragging && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-0.5">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;