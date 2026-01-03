import React, { useState, useMemo } from 'react';
import { Task, Project } from '@/types/task';
import {
  calculateOverallStats,
  groupTasksByDate,
  getTopOvertimeTasks,
  groupTimeByProject,
  groupTimeByPriority,
  formatTimeMinutes,
  calculateTotalTime,
  calculateVariance
} from '@/lib/timeAnalytics';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TimeAnalyticsProps {
  tasks: Task[];
  projects: Project[];
}

type DateRange = '7' | '30' | '90' | 'all';

// Generate dummy data for demo purposes
const generateDummyTasks = (projects: Project[]): Task[] => {
  const now = new Date();
  const dummyTasks: Task[] = [];
  const priorities: Array<'urgent_important' | 'urgent_not_important' | 'not_urgent_important' | 'not_urgent_not_important'> = 
    ['urgent_important', 'urgent_not_important', 'not_urgent_important', 'not_urgent_not_important'];
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const estimated = Math.floor(Math.random() * 180) + 30; // 30-210 minutes
    const variance = (Math.random() - 0.3) * 0.8; // -30% to +50%
    const actual = Math.floor(estimated * (1 + variance));
    
    dummyTasks.push({
      id: `dummy-${i}`,
      title: `Task ${i + 1}: ${['Design mockups', 'Code review', 'Write documentation', 'Team meeting', 'Bug fixes', 'Feature development'][i % 6]}`,
      status: Math.random() > 0.3 ? 'done' : 'in_progress',
      priority: priorities[i % 4],
      project_id: projects[i % Math.min(projects.length, 2)]?.id || 'p1',
      user_id: 'demo-user',
      timer_minutes: Math.floor(actual * 0.7),
      manual_minutes: Math.floor(actual * 0.3),
      estimated_minutes: estimated,
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  return dummyTasks;
};

const TimeAnalytics: React.FC<TimeAnalyticsProps> = ({ tasks, projects }) => {
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [useDummyData, setUseDummyData] = useState(false);

  // Use dummy data ONLY in development and ONLY if explicitly enabled
  const effectiveTasks = useMemo(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && useDummyData) {
      return generateDummyTasks(projects);
    }
    return tasks;
  }, [tasks, projects, useDummyData]);

  // Filter tasks by date range and project
  const filteredTasks = useMemo(() => {
    let filtered = effectiveTasks;
    let filtered = tasks;

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(task => task.project_id === selectedProject);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(task => {
        if (!task.updated_at) return false;
        return new Date(task.updated_at) >= cutoffDate;
      });
    }

    return filtered;
  }, [effectiveTasks, dateRange, selectedProject]);

  const stats = useMemo(() => calculateOverallStats(filteredTasks), [filteredTasks]);
  const dailyData = useMemo(() => groupTasksByDate(filteredTasks, parseInt(dateRange === 'all' ? '90' : dateRange)), [filteredTasks, dateRange]);
  const projectData = useMemo(() => groupTimeByProject(filteredTasks, projects), [filteredTasks, projects]);
  const priorityData = useMemo(() => groupTimeByPriority(filteredTasks), [filteredTasks]);
  const overtimeTasks = useMemo(() => getTopOvertimeTasks(filteredTasks, 10), [filteredTasks]);

  const hasData = stats.totalMinutes > 0;
  const hasRealData = tasks.some(t => (t.timer_minutes || 0) + (t.manual_minutes || 0) > 0);
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Time Data Yet</h2>
          <p className="text-gray-600 mb-6">
            Start tracking time on your tasks to see analytics and insights about where your time goes.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 To get started:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Add time estimates to your tasks</li>
              <li>Use the timer to track actual time</li>
              <li>Come back here to see your analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Analytics</h2>
          <p className="text-sm text-gray-600">
            {useDummyData && '🎨 Demo Data - '}Track where your time goes and improve your estimates
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Demo Data Toggle - ONLY in development */}
          {isDevelopment && (
            <button
              onClick={() => setUseDummyData(!useDummyData)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {useDummyData ? '📊 Show Real Data' : '🎨 Show Demo Data'}
            </button>
          )}
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Time Tracked"
          value={`${stats.totalHours}h ${stats.totalMinutes % 60}m`}
          icon="⏱️"
          color="blue"
        />
        <StatCard
          title="Average Per Task"
          value={formatTimeMinutes(stats.averageMinutes)}
          icon="📊"
          color="green"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.completedTasks.toString()}
          subtitle={`of ${stats.tasksTracked} tracked`}
          icon="✅"
          color="purple"
        />
        <StatCard
          title="Efficiency Score"
          value={stats.efficiencyScore > 0 ? `${stats.efficiencyScore}%` : 'N/A'}
          subtitle={stats.efficiencyScore > 100 ? 'Over estimate' : stats.efficiencyScore > 0 ? 'Of estimate' : 'Set estimates'}
          icon="🎯"
          color={stats.efficiencyScore > 120 ? 'red' : stats.efficiencyScore >= 80 ? 'green' : 'yellow'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Time Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatTimeMinutes(value) : ''}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="minutes" fill="#3b82f6" name="Time Logged" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time by Project */}
        {projectData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time by Project</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatTimeMinutes(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatTimeMinutes(value) : ''} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Time by Priority */}
        {priorityData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatTimeMinutes(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatTimeMinutes(value) : ''} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Overtime Tasks List */}
        {overtimeTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Over-Estimate Tasks</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {overtimeTasks.map(({ task, variance, actual }) => (
                <div key={task.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Estimated: {formatTimeMinutes(task.estimated_minutes || 0)} • Actual: {formatTimeMinutes(actual)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      +{Math.round(variance)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Efficiency Breakdown */}
      {(stats.onTimeCount > 0 || stats.overtimeCount > 0 || stats.undertimeCount > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimation Accuracy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.onTimeCount}</div>
              <div className="text-sm text-gray-600 mt-1">On-time (±10%)</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{stats.overtimeCount}</div>
              <div className="text-sm text-gray-600 mt-1">Overtime (&gt;10%)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.undertimeCount}</div>
              <div className="text-sm text-gray-600 mt-1">Undertime (&lt;-10%)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-3xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default TimeAnalytics;
