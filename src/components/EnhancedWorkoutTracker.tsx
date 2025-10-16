'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, PlayCircleIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutline, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  WorkoutDay, 
  WorkoutWeek,
  Exercise, 
  generateWorkoutWeeks,
  getTodayWorkout, 
  getWorkoutByDate,
  getCurrentWeek,
  calculateWorkoutProgress,
  formatDate
} from '../types/workout';

interface EnhancedWorkoutTrackerProps {
  onWorkoutUpdate?: (updatedWorkout: WorkoutDay) => void;
}

const EnhancedWorkoutTracker: React.FC<EnhancedWorkoutTrackerProps> = ({ onWorkoutUpdate }) => {
  const [workoutWeeks, setWorkoutWeeks] = useState<WorkoutWeek[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutDay | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WorkoutWeek | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const progress = currentWorkout ? calculateWorkoutProgress(currentWorkout) : 0;

  if (!selectedWeek || !currentWorkout) {
    return <div className="flex justify-center items-center h-64">Loading workout schedule...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Exercise Tracker</h2>
        <p className="text-gray-600">Track your daily workouts with real dates</p>
      </div>

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
                
                {exercise.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    {exercise.notes}
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
    </div>
  );
};

export default EnhancedWorkoutTracker;