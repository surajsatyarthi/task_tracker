'use client';

import React, { useMemo } from 'react';
import { Task, priorityColorMap, statusIconMap } from '@/types/task';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  highlight?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, highlight }) => {
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const renderWithHighlight = (text?: string) => {
    if (!text) return null;
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

  const { calendarDays, dateRange, monthHeaders } = useMemo(() => {
    // Always show current year's calendar
    const now = new Date();
    const currentYear = now.getFullYear();

    // Use UTC to avoid timezone issues
    const START_DATE = new Date(Date.UTC(currentYear, 0, 1));
    const END_DATE = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

    // Generate all days from START_DATE to END_DATE
    const days: CalendarDay[] = [];
    const headers: { index: number; month: string }[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Start from the Sunday of the week containing START_DATE
    const startWeek = new Date(START_DATE);
    startWeek.setDate(startWeek.getDate() - startWeek.getDay());

    // End on the Saturday of the week containing END_DATE, but don't go past year boundary
    const endWeek = new Date(END_DATE);
    endWeek.setDate(endWeek.getDate() + (6 - endWeek.getDay()));
    // Ensure we don't show next year's dates
    const maxEndDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));
    if (endWeek > maxEndDate) {
      endWeek.setTime(maxEndDate.getTime());
    }

    let currentMonthIndex = -1;
    let dayIndex = 0;
    
    // Generate all calendar days
    for (let date = new Date(startWeek); date <= endWeek; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.due_date === dateStr);
      
      // Check if date is within our 3-month range
      const isInRange = date >= START_DATE && date <= END_DATE;
      
      // Add month header when month changes
      if (date.getMonth() !== currentMonthIndex && isInRange) {
        currentMonthIndex = date.getMonth();
        headers.push({
          index: dayIndex,
          month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: isInRange, // Only highlight dates within range
        isToday: dateStr === today,
        tasks: dayTasks
      });
      
      dayIndex++;
    }
    
    return {
      calendarDays: days,
      monthHeaders: headers,
      dateRange: `${START_DATE.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${END_DATE.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    };
  }, [tasks]);

  // Remove monthly navigation since we have a fixed 1-year range
  const goToStart = () => {
    // Scroll to the beginning of the calendar
    const calendarElement = document.querySelector('.calendar-grid-container');
    if (calendarElement) {
      calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorityColorMap[priority as keyof typeof priorityColorMap] || 'bg-gray-500';
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

  // Calculate tasks in range dynamically using UTC
  const now = new Date();
  const currentYear = now.getFullYear();
  const rangeStart = new Date(Date.UTC(currentYear, 0, 1));
  const rangeEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

  const tasksInRange = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    return taskDate >= rangeStart && taskDate <= rangeEnd;
  }).length;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{dateRange}</h3>
            <p className="text-gray-600 text-sm">
              {tasksInRange} tasks in date range • {tasksWithDueDates} tasks with due dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToStart}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              Go to Start
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid-container max-h-[800px] overflow-y-auto">
          {/* Day headers - repeat for each month section */}
          {monthHeaders.map((header, headerIndex) => (
            <div key={headerIndex} className="mb-6">
              <div className="sticky top-0 bg-white z-10 py-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {header.month}
                </h4>
                <div className="grid grid-cols-7 gap-1 mt-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 rounded-md">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Calendar days for this month */}
                {calendarDays.slice(header.index, headerIndex < monthHeaders.length - 1 ? monthHeaders[headerIndex + 1].index : calendarDays.length).map((calendarDay, index) => (
                  <div
                    key={header.index + index}
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
                        ? 'text-gray-300' 
                        : calendarDay.isToday 
                        ? 'text-blue-700 font-bold' 
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
                            <span className="truncate flex-1">{renderWithHighlight(task.title)}</span>
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
                        {renderWithHighlight(task.title)}
                      </h4>
                      {getStatusIcon(task.status)}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {renderWithHighlight(task.description)}
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