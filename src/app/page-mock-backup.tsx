'use client';

import React, { useState } from 'react';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskTable from '@/components/TaskTable';
import CalendarView from '@/components/CalendarView';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import HealthDashboard from '@/components/HealthDashboard';
import JournalDashboard from '@/components/JournalDashboard';
import LinkedInTracker from '@/components/LinkedInTracker';
import { Task, TaskStatus, TaskPriority, Project, getFlagsFromPriority } from '@/types/task';
import { Squares2X2Icon, TableCellsIcon, CalendarIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

// Project definitions
const projects: Project[] = [
  { id: 'personal', name: 'Personal', slug: 'personal', color: '#6366f1', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'csuite', name: 'CSuite', slug: 'csuite', color: '#dc2626', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'health', name: 'Health', slug: 'health', color: '#f59e0b', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'journaling', name: 'Journaling', slug: 'journaling', color: '#8b5cf6', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'linkedin', name: 'LinkedIn', slug: 'linkedin', color: '#0077b5', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Personal tasks from CSV - ALL set to 'todo' status as requested (no due dates)
const personalTasks: Task[] = [
  { id: 'p1', project_id: 'personal', title: 'PnL sheet', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p2', project_id: 'personal', title: 'Legal notice to builder indiabulls', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p3', project_id: 'personal', title: 'Company clouser', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p4', project_id: 'personal', title: 'Increase card limit sbi', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p5', project_id: 'personal', title: 'Workout routine', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p6', project_id: 'personal', title: 'Learn SEO and pSEO', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p7', project_id: 'personal', title: 'Hard disk repair', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p8', project_id: 'personal', title: 'BMI', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p9', project_id: 'personal', title: 'VC Valuation Method Excel Template', description: 'https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p10', project_id: 'personal', title: 'Propretiorship account', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p11', project_id: 'personal', title: 'ICICI card limit increase', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p12', project_id: 'personal', title: 'SEO Video Tutorial', description: 'https://www.youtube.com/watch?v=lOPIutlDFpA', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.youtube.com/watch?v=lOPIutlDFpA'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p13', project_id: 'personal', title: 'SEO Writing AI Tool', description: 'https://seowriting.ai/', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://seowriting.ai/'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT NOT IMPORTANT tasks
  { id: 'p14', project_id: 'personal', title: 'Sell laptop', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p15', project_id: 'personal', title: 'Stripe Payment', description: 'Payment checkout link', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://checkout.stripe.com/c/pay/cs_live_b15wM7oanEh0g9ELAjNVODnh3HiZcUKuuMj2qeGS437PzsxqhDEkPPK1aV'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // More not urgent/not important tasks
  { id: 'p16', project_id: 'personal', title: 'Dickie Bush Twitter thread', description: 'https://x.com/dickiebush/status/1885047573028716889', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/dickiebush/status/1885047573028716889'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p17', project_id: 'personal', title: 'SEO Twitter Thread - Natia', description: 'https://x.com/seonatia/status/1940803656762208515', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/seonatia/status/1940803656762208515'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p18', project_id: 'personal', title: 'Alex Finn Twitter Thread', description: 'https://x.com/AlexFinnX/status/1940559551138615539', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/AlexFinnX/status/1940559551138615539'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p19', project_id: 'personal', title: 'Penal charges and bounce charges CBI loan', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p20', project_id: 'personal', title: 'CBI loan analysis', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p21', project_id: 'personal', title: 'Indusind card', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Sample tasks for other projects
const sampleTasks: Task[] = [
  // CSuite Tasks
  { id: 'c1', project_id: 'csuite', title: 'CSuite Board Presentation', status: 'doing', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c2', project_id: 'csuite', title: 'CSuite Team Building', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Health Tasks
  { id: 'h1', project_id: 'health', title: 'Morning Workout', status: 'done', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'h2', project_id: 'health', title: 'Meal Prep Planning', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Journaling Tasks
  { id: 'j1', project_id: 'journaling', title: 'Daily Reflection', status: 'done', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'j2', project_id: 'journaling', title: 'Weekly Review', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // LinkedIn Tasks
  { id: 'l1', project_id: 'linkedin', title: 'LinkedIn Profile Update', status: 'doing', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'l2', project_id: 'linkedin', title: 'LinkedIn Content Creation', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Combine all tasks
const allTasks: Task[] = [...personalTasks, ...sampleTasks];

export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [activeProject, setActiveProject] = useState<string>('personal');
  const [viewMode, setViewMode] = useState<'matrix' | 'table' | 'calendar'>('matrix');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleTaskUpdateById = (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = { ...task, ...updates };
    handleTaskUpdate(updatedTask);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const task: Task = {
      ...newTask,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([...tasks, task]);
    setShowAddModal(false);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handlePriorityChange = (taskId: string, newPriority: TaskPriority) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { isUrgent, isImportant } = getFlagsFromPriority(newPriority);
    const updatedTask = { ...task, priority: newPriority, is_urgent: isUrgent, is_important: isImportant };
    handleTaskUpdate(updatedTask);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus as TaskStatus };
    handleTaskUpdate(updatedTask);
  };

  const currentProject = projects.find(p => p.slug === activeProject);
  const filteredTasks = tasks.filter(task => task.project_id === activeProject);

  const renderDashboard = () => {
    switch (activeProject) {
      case 'health':
        return <HealthDashboard />;
      case 'journaling':
        return <JournalDashboard />;
      case 'linkedin':
        return <LinkedInTracker />;
      default:
        return null;
    }
  };

  const showSpecialDashboard = ['health', 'journaling', 'linkedin'].includes(activeProject);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Task Tracker Pro</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.slug)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeProject === project.slug
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeProject === project.slug ? project.color : undefined,
                  borderColor: activeProject === project.slug ? project.color : undefined
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      {!showSpecialDashboard && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'matrix'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4 mr-2" />
                  Matrix
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TableCellsIcon className="w-4 h-4 mr-2" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'calendar'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {filteredTasks.length} tasks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSpecialDashboard ? (
          renderDashboard()
        ) : (
          <>
            {viewMode === 'matrix' && (
              <EisenhowerMatrix
                tasks={filteredTasks}
                onTaskClick={setSelectedTask}
                onTaskMove={handlePriorityChange}
              />
            )}
            {viewMode === 'table' && (
              <TaskTable
                tasks={filteredTasks}
                onTaskClick={setSelectedTask}

              />
            )}
            {viewMode === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                onTaskClick={setSelectedTask}
              />
            )}
          </>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdateById}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleTaskCreate}
          currentProject={currentProject?.id || ''}
        />
      )}
    </div>
  );
}