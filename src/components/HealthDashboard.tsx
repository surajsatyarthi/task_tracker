'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  PlayCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  ScaleIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  TableCellsIcon
} from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutline, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  WorkoutDay, 
  WorkoutWeek,
  Exercise, 
  DailyWeight,
  generateWorkoutWeeks,
  getTodayWorkout, 
  getWorkoutByDate,
  getCurrentWeek,
  calculateWorkoutProgress,
  calculateMonthlyStats,
  calculateYearlyStats,
  getWorkoutStreak,
  formatDate
} from '../types/workout';

interface HealthDashboardProps {
  onWorkoutUpdate?: (updatedWorkout: WorkoutDay) => void;
}

type DashboardView = 'workout' | 'weight' | 'progress';
type WeightView = 'table' | 'graph';

const HealthDashboard: React.FC<HealthDashboardProps> = ({ onWorkoutUpdate }) => {
  const [workoutWeeks, setWorkoutWeeks] = useState<WorkoutWeek[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutDay | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WorkoutWeek | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeView, setActiveView] = useState<DashboardView>('workout');
  const [weightView, setWeightView] = useState<WeightView>('table');
  const [dailyWeights, setDailyWeights] = useState<DailyWeight[]>([]);
  const [weightInput, setWeightInput] = useState<string>('');
  const [weightNotes, setWeightNotes] = useState<string>('');

  useEffect(() => {
    // Generate workout schedule for the next year
    const weeks = generateWorkoutWeeks();
    setWorkoutWeeks(weeks);
    
    // Set current week and today's workout
    const currentWeek = getCurrentWeek(weeks);
    const todayWorkout = getTodayWorkout(weeks);
    
    setSelectedWeek(currentWeek || weeks[0]);
    setCurrentWorkout(todayWorkout || weeks[0]?.days[0] || null);
    setSelectedDate(todayWorkout?.date || new Date().toISOString().split('T')[0]);

    // Load sample weight data for demonstration
    setDailyWeights([
      { date: '2025-10-01', weight: 78.2, notes: 'Starting weight' },
      { date: '2025-10-03', weight: 77.9, notes: 'Morning weight' },
      { date: '2025-10-05', weight: 77.6, notes: 'After workout' },
      { date: '2025-10-07', weight: 77.8, notes: 'Weekend weight' },
      { date: '2025-10-09', weight: 77.4, notes: 'Morning weight' },
      { date: '2025-10-11', weight: 77.1, notes: 'Post cardio' },
      { date: '2025-10-13', weight: 76.9, notes: 'Morning weight' },
      { date: '2025-10-15', weight: 76.6, notes: 'Great progress!' },
    ]);
  }, []);

  const handleDateSelect = (date: string) => {
    const workout = getWorkoutByDate(workoutWeeks, date);
    if (workout) {
      setCurrentWorkout(workout);
      setSelectedDate(date);
      
      // Update selected week if needed
      const workoutWeek = workoutWeeks.find(week => 
        week.weekStart <= date && date <= week.weekEnd
      );
      if (workoutWeek) {
        setSelectedWeek(workoutWeek);
      }
    }
  };

  const handleExerciseToggle = (exerciseId: string) => {
    if (!currentWorkout) return;

    const updatedExercises = currentWorkout.exercises.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, completed: !exercise.completed }
        : exercise
    );

    const updatedWorkout = {
      ...currentWorkout,
      exercises: updatedExercises,
      completed: updatedExercises.every(ex => ex.completed),
      completedAt: updatedExercises.every(ex => ex.completed) ? new Date().toISOString() : undefined
    };

    setCurrentWorkout(updatedWorkout);
    
    // Update workout weeks
    const updatedWeeks = workoutWeeks.map(week => ({
      ...week,
      days: week.days.map(day => 
        day.id === updatedWorkout.id ? updatedWorkout : day
      ),
      completedDays: week.days.filter(day => 
        day.id === updatedWorkout.id ? updatedWorkout.completed : day.completed
      ).length
    }));
    
    setWorkoutWeeks(updatedWeeks);

    if (onWorkoutUpdate) {
      onWorkoutUpdate(updatedWorkout);
    }
  };

  const handleWeightSubmit = () => {
    const weight = parseFloat(weightInput);
    if (weight > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newWeight: DailyWeight = {
        date: today,
        weight,
        notes: weightNotes.trim() || undefined
      };
      
      // Update or add today's weight
      setDailyWeights(prev => {
        const filtered = prev.filter(w => w.date !== today);
        return [...filtered, newWeight].sort((a, b) => b.date.localeCompare(a.date));
      });
      
      setWeightInput('');
      setWeightNotes('');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!selectedWeek) return;
    
    const currentIndex = workoutWeeks.findIndex(week => week.id === selectedWeek.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(workoutWeeks.length - 1, currentIndex + 1);
    }
    
    const newWeek = workoutWeeks[newIndex];
    setSelectedWeek(newWeek);
    
    // Set first day of new week as current workout
    if (newWeek.days.length > 0) {
      setCurrentWorkout(newWeek.days[0]);
      setSelectedDate(newWeek.days[0].date);
    }
  };

  const renderExerciseDetails = (exercise: Exercise) => {
    const details = [];
    
    if (exercise.sets) details.push(`${exercise.sets} sets`);
    if (exercise.reps) details.push(`${exercise.reps} reps`);
    if (exercise.weight) details.push(`${exercise.weight}kg`);
    if (exercise.duration) details.push(`${exercise.duration} min`);
    
    return details.join(' • ');
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isPast = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  };

  // Calculate statistics
  const workoutStreak = getWorkoutStreak(workoutWeeks);
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyStats = calculateMonthlyStats(workoutWeeks, currentMonth);
  const yearlyStats = calculateYearlyStats(workoutWeeks, 2025);
  
  const todayWeight = dailyWeights.find(w => w.date === new Date().toISOString().split('T')[0]);
  const latestWeight = dailyWeights[0];

  const progress = currentWorkout ? calculateWorkoutProgress(currentWorkout) : 0;

  if (!selectedWeek || !currentWorkout) {
    return <div className="flex justify-center items-center h-64">Loading health dashboard...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Health & Fitness Dashboard</h2>
        <p className="text-gray-600">Track workouts, weight, and progress starting October 17, 2025</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('workout')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'workout'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏋️‍♂️ Workout Tracker
          </button>
          <button
            onClick={() => setActiveView('weight')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'weight'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚖️ Weight Log
          </button>
          <button
            onClick={() => setActiveView('progress')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'progress'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Progress Stats
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{workoutStreak}</div>
          <div className="text-xs text-gray-500">consecutive days</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{monthlyStats.completionRate}%</div>
          <div className="text-xs text-gray-500">{monthlyStats.completedWorkouts}/{monthlyStats.totalWorkouts} completed</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Weight</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {latestWeight ? `${latestWeight.weight}kg` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {latestWeight ? formatDate(latestWeight.date) : 'No records'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Year Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{yearlyStats.completionRate}%</div>
          <div className="text-xs text-gray-500">{yearlyStats.completedWorkouts}/{yearlyStats.totalWorkouts} completed</div>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'workout' && (
        <>
          {/* Week Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  {formatDate(selectedWeek.weekStart)} - {formatDate(selectedWeek.weekEnd)}
                </h3>
                <p className="text-sm text-gray-600">
                  Week {workoutWeeks.findIndex(w => w.id === selectedWeek.id) + 1} of {workoutWeeks.length}
                </p>
              </div>
              
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {selectedWeek.days.map((day) => {
                const dayProgress = calculateWorkoutProgress(day);
                const isSelected = day.date === selectedDate;
                const isTodayDate = isToday(day.date);
                const isPastDate = isPast(day.date);
                
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDateSelect(day.date)}
                    className={`p-3 rounded-lg font-medium transition-all text-sm ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : day.completed
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : isTodayDate
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ring-2 ring-yellow-300'
                        : isPastDate
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{day.day}</div>
                    <div className="text-xs opacity-90 mb-1">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-xs">
                      {day.focus} • {dayProgress}%
                    </div>
                    {isTodayDate && (
                      <div className="text-xs mt-1 font-bold">TODAY</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Week Progress */}
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600 mb-2">
                Weekly Progress: {selectedWeek.completedDays} of 6 days completed
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(selectedWeek.completedDays / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Workout Details */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="text-blue-100">{formatDate(currentWorkout.date)}</span>
                  {isToday(currentWorkout.date) && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      TODAY
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold">{currentWorkout.day}</h3>
                <p className="text-blue-100">{currentWorkout.focus} Focus</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{progress}%</div>
                <p className="text-blue-100">Complete</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-blue-400/30 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PlayCircleIcon className="w-5 h-5 text-blue-500" />
              Exercises ({currentWorkout.exercises.length})
            </h4>
            
            {currentWorkout.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exercise.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleExerciseToggle(exercise.id)}
                    className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full transition-colors ${
                      exercise.completed
                        ? 'text-green-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    {exercise.completed ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <CheckCircleOutline className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium ${
                        exercise.completed 
                          ? 'text-green-800 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {index + 1}. {exercise.name}
                      </h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {exercise.duration && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {exercise.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {renderExerciseDetails(exercise) && (
                      <p className={`text-sm mt-1 ${
                        exercise.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {renderExerciseDetails(exercise)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Status */}
          {currentWorkout.completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-bold text-green-800 text-lg mb-2">
                Workout Complete! 🎉
              </h4>
              <p className="text-green-600">
                Great job finishing your {currentWorkout.focus.toLowerCase()} workout on {formatDate(currentWorkout.date)}!
              </p>
              {currentWorkout.completedAt && (
                <p className="text-sm text-green-500 mt-2">
                  Completed at {new Date(currentWorkout.completedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Weight Tracking View */}
      {activeView === 'weight' && (
        <div className="space-y-6">
          {/* Weight Entry */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ScaleIcon className="w-5 h-5 text-blue-500" />
                Daily Weight Entry
              </h3>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setWeightView('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    weightView === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TableCellsIcon className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setWeightView('graph')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    weightView === 'graph'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Graph
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Morning weight, after workout..."
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleWeightSubmit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Record Weight
                </button>
              </div>
            </div>

            {todayWeight && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  ✅ Today&apos;s weight: <strong>{todayWeight.weight}kg</strong>
                  {todayWeight.notes && ` • ${todayWeight.notes}`}
                </p>
              </div>
            )}
          </div>

          {/* Weight History */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weight History ({dailyWeights.length} records)
            </h3>
            
            {dailyWeights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No weight records yet. Start by recording your daily weight above.
              </div>
            ) : weightView === 'table' ? (
              /* Table View - Compact */
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dailyWeights.slice(0, 12).map((weight) => (
                    <div key={weight.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">
                          {new Date(weight.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        {weight.notes && (
                          <div className="text-xs text-gray-500 truncate">{weight.notes}</div>
                        )}
                      </div>
                      <div className="text-lg font-bold text-blue-600 ml-2">
                        {weight.weight}kg
                      </div>
                    </div>
                  ))}
                </div>
                
                {dailyWeights.length > 12 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-500">
                      Showing latest 12 entries of {dailyWeights.length} total
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Graph View */
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyWeights.map(weight => ({
                      date: new Date(weight.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      }),
                      weight: weight.weight,
                      fullDate: weight.date,
                      notes: weight.notes
                    }))}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                      label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-900">{label}</p>
                              <p className="text-blue-600 font-bold">
                                Weight: {data.weight}kg
                              </p>
                              {data.notes && (
                                <p className="text-sm text-gray-600 mt-1">{data.notes}</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Graph Statistics */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {Math.max(...dailyWeights.map(w => w.weight))}kg
                    </div>
                    <div className="text-xs text-gray-500">Highest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {Math.min(...dailyWeights.map(w => w.weight))}kg
                    </div>
                    <div className="text-xs text-gray-500">Lowest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {(Math.max(...dailyWeights.map(w => w.weight)) - Math.min(...dailyWeights.map(w => w.weight))).toFixed(1)}kg
                    </div>
                    <div className="text-xs text-gray-500">Change</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Statistics View */}
      {activeView === 'progress' && (
        <div className="space-y-6">
          {/* Monthly Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Month ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{monthlyStats.completedWorkouts}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{monthlyStats.missedWorkouts}</div>
                <div className="text-sm text-gray-600">Missed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{monthlyStats.completionRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Yearly Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Annual Progress</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{yearlyStats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{yearlyStats.completedWorkouts}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{yearlyStats.missedWorkouts}</div>
                <div className="text-sm text-gray-600">Missed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{yearlyStats.completionRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <h4 className="font-medium text-gray-900 mb-3">Monthly Breakdown</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {yearlyStats.monthlyBreakdown.map((month) => (
                <div key={month.month} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-600">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-gray-900">{month.completionRate}%</div>
                  <div className="text-xs text-gray-500">{month.completedWorkouts}/{month.totalWorkouts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;