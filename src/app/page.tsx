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

// Personal tasks from CSV - Complete list
const personalTasks: Task[] = [
  { id: 'p1', project_id: 'personal', title: 'PnL sheet', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p2', project_id: 'personal', title: 'Workout routine', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p3', project_id: 'personal', title: 'Company clouser', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p4', project_id: 'personal', title: 'Legal notice to builder indiabulls', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p5', project_id: 'personal', title: 'Sell laptop', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p6', project_id: 'personal', title: 'Increase card limit sbi', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p7', project_id: 'personal', title: 'Dickie Bush Twitter thread', description: 'https://x.com/dickiebush/status/1885047573028716889', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/dickiebush/status/1885047573028716889'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p8', project_id: 'personal', title: 'VC Valuation Method Excel Template', description: 'https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p9', project_id: 'personal', title: 'Hard disk repair', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p10', project_id: 'personal', title: 'BMI', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p11', project_id: 'personal', title: 'Propretiorship account', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p12', project_id: 'personal', title: 'Learn SEO and pSEO', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p13', project_id: 'personal', title: 'SEO Video Tutorial', description: 'https://www.youtube.com/watch?v=lOPIutlDFpA', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.youtube.com/watch?v=lOPIutlDFpA'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p14', project_id: 'personal', title: 'SEO Writing AI Tool', description: 'https://seowriting.ai/', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://seowriting.ai/'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p15', project_id: 'personal', title: 'Stripe Payment', description: 'Payment checkout link', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, links: ['https://checkout.stripe.com/c/pay/cs_live_b15wM7oanEh0g9ELAjNVODnh3HiZcUKuuMj2qeGS437PzsxqhDEkPPK1aV'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p16', project_id: 'personal', title: 'SEO Twitter Thread - Natia', description: 'https://x.com/seonatia/status/1940803656762208515', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/seonatia/status/1940803656762208515'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p17', project_id: 'personal', title: 'Alex Finn Twitter Thread', description: 'https://x.com/AlexFinnX/status/1940559551138615539', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/AlexFinnX/status/1940559551138615539'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p18', project_id: 'personal', title: 'Penal charges and bounce charges CBI loan', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p19', project_id: 'personal', title: 'CBI loan analysis', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p20', project_id: 'personal', title: 'Indusind card', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p21', project_id: 'personal', title: 'Basic Prompts Twitter Thread', description: 'https://x.com/basicprompts/status/1966487017669415400', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/basicprompts/status/1966487017669415400'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p22', project_id: 'personal', title: 'ICICI card limit increase', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p23', project_id: 'personal', title: 'Matt Gray Twitter Thread', description: 'https://x.com/matt_gray_/status/1973053054267122067', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/matt_gray_/status/1973053054267122067'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p24', project_id: 'personal', title: 'Julian Goldie SEO Thread 1', description: 'https://x.com/JulianGoldieSEO/status/1976729630666375226', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/JulianGoldieSEO/status/1976729630666375226'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p25', project_id: 'personal', title: 'Natia Kourdadze SEO Thread', description: 'https://x.com/natiakourdadze/status/1977064491528450346', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/natiakourdadze/status/1977064491528450346'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p26', project_id: 'personal', title: 'Julian Goldie SEO Thread 2', description: 'https://x.com/JulianGoldieSEO/status/1977444094298476979', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/JulianGoldieSEO/status/1977444094298476979'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Mock data for other projects
const otherTasks: Task[] = [
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
    id: '5',
    project_id: 'health',
    title: 'Schedule annual checkup',
    status: 'todo',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTasks: Task[] = [...personalTasks, ...otherTasks];

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
              projectId={activeProject}
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
