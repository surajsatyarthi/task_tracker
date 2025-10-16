'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first day of the week containing the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Get last day of the week containing the last day of month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Generate all calendar days
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.due_date === dateStr);
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === today,
        tasks: dayTasks
      });
    }
    
    return {
      calendarDays: days,
      monthYear: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [currentDate, tasks]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent_important': return 'bg-red-500';
      case 'urgent_not_important': return 'bg-orange-500';
      case 'not_urgent_important': return 'bg-green-500';
      case 'not_urgent_not_important': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircleIcon className="w-3 h-3 text-green-600" />;
      case 'doing': return <ClockIcon className="w-3 h-3 text-blue-600" />;
      case 'on_hold': return <ExclamationCircleIcon className="w-3 h-3 text-yellow-600" />;
      case 'help_me': return <ExclamationCircleIcon className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const tasksWithDueDates = tasks.filter(task => task.due_date).length;
  const tasksThisMonth = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    return taskDate.getMonth() === currentDate.getMonth() && 
           taskDate.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{monthYear}</h3>
            <p className="text-gray-600 text-sm">
              {tasksThisMonth} tasks this month • {tasksWithDueDates} tasks with due dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 rounded-md">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((calendarDay, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-gray-200 rounded-md ${
                !calendarDay.isCurrentMonth 
                  ? 'bg-gray-50' 
                  : calendarDay.isToday 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-white hover:bg-gray-50'
              } transition-colors`}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-1 ${
                !calendarDay.isCurrentMonth 
                  ? 'text-gray-400' 
                  : calendarDay.isToday 
                  ? 'text-blue-700' 
                  : 'text-gray-900'
              }`}>
                {calendarDay.day}
              </div>
              
              {/* Tasks */}
              <div className="space-y-1">
                {calendarDay.tasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`w-full text-left p-1 rounded text-xs font-medium transition-all hover:shadow-sm ${
                      task.status === 'done' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                      <span className="truncate flex-1">{task.title}</span>
                      {getStatusIcon(task.status)}
                    </div>
                  </button>
                ))}
                
                {/* Show more indicator */}
                {calendarDay.tasks.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{calendarDay.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks without due dates */}
      {tasks.filter(task => !task.due_date).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks without due dates</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {tasks.filter(task => !task.due_date).length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.filter(task => !task.due_date).map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  task.status === 'done'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${
                        task.status === 'done' 
                          ? 'text-green-800 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      {getStatusIcon(task.status)}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Add due dates to these tasks to see them in the calendar above. 
              Click any task to edit and set a deadline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;