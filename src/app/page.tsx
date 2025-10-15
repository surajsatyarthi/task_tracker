'use client';

import React, { useState } from 'react';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import { Task, TaskPriority, getFlagsFromPriority } from '@/types/task';

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
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Import CSV
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <EisenhowerMatrix 
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
        />
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
