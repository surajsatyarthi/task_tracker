'use client';

import React from 'react';
import { Task, statusConfig, priorityConfig, sortTasks, isTaskOverdue, formatDateForDisplay, getDaysUntilDue } from '@/types/task';
import { CalendarIcon, LinkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LinkPreview from './LinkPreview';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  highlight?: string;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onTaskClick, highlight }) => {
  const sortedTasks = sortTasks(tasks);
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
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500">Add your first task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => {
              const statusStyle = statusConfig[task.status];
              const priorityStyle = priorityConfig[task.priority];
              const isOverdue = isTaskOverdue(task);
              
              return (
                <tr
                  key={task.id}
                  className={`cursor-pointer transition-colors ${
                    isOverdue 
                      ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onTaskClick(task)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className={`text-sm font-medium line-clamp-2 flex items-center gap-2 ${
                          isOverdue ? 'text-red-800' : 'text-gray-900'
                        }`}>
                          {isOverdue && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
                          )}
                          <span>{renderWithHighlight(task.title)}</span>
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {renderWithHighlight(task.description)}
                          </div>
                        )}
                        {task.remarks && (
                          <div className="text-xs text-gray-400 line-clamp-1 mt-1">
                            {renderWithHighlight(task.remarks)}
                          </div>
                        )}
                        {task.links && task.links.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.links.slice(0, 2).map((link) => (
                              <LinkPreview key={link} url={link} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                      <span className="mr-1">{statusStyle.icon}</span>
                      {statusStyle.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle.color}`}>
                      <span className="mr-1">{priorityStyle.icon}</span>
                      {priorityStyle.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.due_date && (
                      <div className={`flex items-center ${
                        isOverdue ? 'text-red-600 font-medium' : ''
                      }`}>
                        <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                        <div className="flex flex-col">
                          <span>{formatDateForDisplay(task.due_date)}</span>
                          {isOverdue && (
                            <span className="text-xs text-red-600 font-bold">
                              Overdue: {Math.abs(getDaysUntilDue(task.due_date))} days
                            </span>
                          )}
                          {!isOverdue && (
                            <span className="text-xs text-green-600">
                              {getDaysUntilDue(task.due_date)} days left
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {!task.due_date && <span className="text-gray-400">-</span>}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {task.links && task.links.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          {task.links.length}
                        </div>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">#</span>
                          {task.tags.length}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-xs px-3 py-2 min-h-[44px] sm:min-h-0 flex items-center justify-center"
                        aria-label={`View details for ${task.title}`}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;