'use client';

import React, { useState, useEffect } from 'react';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskTable from '@/components/TaskTable';
import CalendarView from '@/components/CalendarView';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import HealthDashboard from '@/components/HealthDashboard';
import JournalDashboard from '@/components/JournalDashboard';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus, TaskPriority, Project } from '@/types/task';
import { Squares2X2Icon, TableCellsIcon, CalendarIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner, LoadingSkeleton } from '@/components/LoadingStates';

export default function TaskTracker() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>('personal');
  const [viewMode, setViewMode] = useState<'matrix' | 'table' | 'calendar'>('matrix');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tasks when active project changes
  useEffect(() => {
    if (projects.length > 0) {
      fetchTasks();
    }
  }, [activeProject, projects]);

  const fetchProjects = async () => {
    try {
      const token = await supabase.auth.getSession();
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await supabase.auth.getSession();
      const response = await fetch(`/api/tasks?project=${activeProject}`, {
        headers: {
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      
      // Transform database data to match Task type
      const transformedTasks = (data.tasks || []).map((task: unknown) => {
        const t = task as Record<string, unknown>;
        return {
          id: t.id as string,
          project_id: t.project_id as string,
          title: t.title as string,
          description: t.description as string | undefined,
          status: t.status as TaskStatus,
          priority: t.priority as TaskPriority,
          is_urgent: t.is_urgent as boolean,
          is_important: t.is_important as boolean,
          owner: t.owner as string | undefined,
          department: t.department as string | undefined,
          due_date: t.due_date as string | undefined,
          completed_date: t.completed_date as string | undefined,
          remarks: t.remarks as string | undefined,
          links: (t.links as string[] | undefined) || [],
          tags: (t.tags as string[] | undefined) || [],
          original_csv_row: t.original_csv_row as number | undefined,
          created_at: t.created_at as string,
          updated_at: t.updated_at as string,
        };
      });
      
      setTasks(transformedTasks);

      // Removed auto-import - slows down app
      /*
      if ((transformedTasks || []).length === 0) {
        const token = await supabase.auth.getSession();
        const importResponse = await fetch('/api/import/csv', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.data.session?.access_token}`,
          },
        });
        if (importResponse.ok) {
          const refresh = await fetch(`/api/tasks?project=${activeProject}`, {
            headers: {
              'Authorization': `Bearer ${token.data.session?.access_token}`,
            },
          });
          if (refresh.ok) {
            const fresh = await refresh.json();
            const refreshed = (fresh.tasks || []).map((task: unknown) => {
              const t = task as Record<string, unknown>;
              return {
                id: t.id as string,
                project_id: t.project_id as string,
                title: t.title as string,
                description: t.description as string | undefined,
                status: t.status as TaskStatus,
                priority: t.priority as TaskPriority,
                is_urgent: t.is_urgent as boolean,
                is_important: t.is_important as boolean,
                owner: t.owner as string | undefined,
                department: t.department as string | undefined,
                due_date: t.due_date as string | undefined,
                completed_date: t.completed_date as string | undefined,
                remarks: t.remarks as string | undefined,
                links: (t.links as string[] | undefined) || [],
                tags: (t.tags as string[] | undefined) || [],
                original_csv_row: t.original_csv_row as number | undefined,
                created_at: t.created_at as string,
                updated_at: t.updated_at as string,
              };
            });
            setTasks(refreshed);
          }
        }
      }
      */
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdateById = (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = { ...task, ...updates };
    handleTaskUpdate(updatedTask);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    if (operationLoading) return;
    try {
      setOperationLoading(true);
      const token = await supabase.auth.getSession();
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
        body: JSON.stringify(updatedTask),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (operationLoading) return;
    try {
      setOperationLoading(true);
      const token = await supabase.auth.getSession();
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
        body: JSON.stringify(newTask),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      // Refresh tasks
      await fetchTasks();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (operationLoading) return;
    try {
      setOperationLoading(true);
      const token = await supabase.auth.getSession();
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    } finally {
      setOperationLoading(false);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || operationLoading) return;

    // Only send the changed fields for better performance
    const updates = { priority: newPriority };
    
    try {
      setOperationLoading(true);
      const token = await supabase.auth.getSession();
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task priority:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || operationLoading) return;

    // Only send the changed fields
    const updates = { status: newStatus as TaskStatus };
    
    try {
      const token = await supabase.auth.getSession();
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.data.session?.access_token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const currentProject = projects.find(p => p.slug === activeProject);
  
  // Filter tasks by project and search query
  const filteredTasks = tasks.filter(task => {
    const matchesProject = task.project_id === currentProject?.id;
    if (!matchesProject) return false;
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.owner?.toLowerCase().includes(query) ||
      task.department?.toLowerCase().includes(query) ||
      task.remarks?.toLowerCase().includes(query) ||
      (task.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Count tasks per project
  const getTaskCountForProject = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">Task Tracker Pro</h1>
              <LoadingSpinner size="sm" text="" />
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton type={viewMode} count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (activeProject) {
      case 'health':
        return <HealthDashboard />;
      case 'journaling':
        return <JournalDashboard />;
      default:
        return null;
    }
  };

  const showSpecialDashboard = ['health', 'journaling'].includes(activeProject);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Task Tracker Pro</h1>
            <div className="flex items-center space-x-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  style={{ width: '300px' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add Task
              </button>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      signOut();
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user?.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {projects.map((project) => {
              const taskCount = getTaskCountForProject(project.id);
              return (
                <button
                  key={project.id}
                  onClick={() => setActiveProject(project.slug)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeProject === project.slug
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{
                    color: activeProject === project.slug ? project.color : undefined,
                    borderColor: activeProject === project.slug ? project.color : undefined
                  }}
                >
                  <span>{project.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeProject === project.slug 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {taskCount}
                  </span>
                </button>
              );
            })}
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
                {searchQuery ? (
                  <>
                    {filteredTasks.length} results for &ldquo;{searchQuery}&rdquo;
                    {filteredTasks.length === 0 && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        Clear search
                      </button>
                    )}
                  </>
                ) : (
                  <>{filteredTasks.length} tasks</>
                )}
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
                highlight={searchQuery}
              />
            )}
            {viewMode === 'table' && (
              <TaskTable
                tasks={filteredTasks}
                onTaskClick={setSelectedTask}
                highlight={searchQuery}

              />
            )}
            {viewMode === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                onTaskClick={setSelectedTask}
                highlight={searchQuery}
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