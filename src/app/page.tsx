'use client';

import React, { useState } from 'react';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskTable from '@/components/TaskTable';
import { Task, TaskPriority, Project, getFlagsFromPriority } from '@/types/task';
import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';

// Project definitions
const projects: Project[] = [
  { id: 'personal', name: 'Personal', slug: 'personal', color: '#6366f1', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn', name: 'BMN', slug: 'bmn', color: '#10b981', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'csuite', name: 'CSuite', slug: 'csuite', color: '#dc2626', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'health', name: 'Health', slug: 'health', color: '#f59e0b', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'journaling', name: 'Journaling', slug: 'journaling', color: '#8b5cf6', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    project_id: 'personal',
    title: 'Complete workout routine',
    status: 'todo',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
    owner: 'You',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2', 
    project_id: 'bmn',
    title: 'Newsletter emails sent',
    status: 'doing',
    priority: 'urgent_important',
    is_urgent: true,
    is_important: true,
    owner: 'Marketing Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    project_id: 'csuite',
    title: 'LinkedIn Banner',
    status: 'done',
    priority: 'urgent_important',
    is_urgent: true,
    is_important: true,
    owner: 'Najib',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    project_id: 'personal',
    title: 'Check social media',
    status: 'todo',
    priority: 'not_urgent_not_important',
    is_urgent: false,
    is_important: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    project_id: 'health',
    title: 'Schedule annual checkup',
    status: 'todo',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
    owner: 'You',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    project_id: 'health',
    title: 'Take vitamins',
    status: 'doing',
    priority: 'urgent_not_important',
    is_urgent: true,
    is_important: false,
    owner: 'You',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    project_id: 'journaling',
    title: 'Morning reflection',
    status: 'done',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
    owner: 'You',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    project_id: 'journaling',
    title: 'Weekly review',
    status: 'todo',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
    owner: 'You',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type ViewMode = 'matrix' | 'table';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeProject, setActiveProject] = useState<string>('personal');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');

  const handleTaskMove = (taskId: string, newPriority: TaskPriority) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const { isUrgent, isImportant } = getFlagsFromPriority(newPriority);
          return {
            ...task,
            priority: newPriority,
            is_urgent: isUrgent,
            is_important: isImportant,
            updated_at: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const filteredTasks = tasks.filter(task => task.project_id === activeProject);
  const currentProject = projects.find(p => p.id === activeProject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Task Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Organize your tasks using the Eisenhower Matrix
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Projects">
            {projects.map((project) => {
              const isActive = activeProject === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => setActiveProject(project.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  style={{
                    ...(isActive && { borderBottomColor: project.color }),
                    ...(isActive && { color: project.color })
                  }}
                >
                  <span className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    {project.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: currentProject?.color }}
                  ></div>
                  {currentProject?.name} Tasks
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} in this project
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      viewMode === 'matrix'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                  Matrix
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      viewMode === 'table'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <TableCellsIcon className="w-4 h-4" />
                  Table
                </button>
              </div>
            </div>
          </div>
          {/* Content based on view mode */}
          {viewMode === 'matrix' ? (
            <EisenhowerMatrix 
              tasks={filteredTasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          ) : (
            <TaskTable 
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      </main>

      {/* Task Detail Modal (placeholder) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{selectedTask.title}</h3>
            <p className="text-gray-600 mb-4">Task details will be implemented in the next phase.</p>
            <button 
              onClick={() => setSelectedTask(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
