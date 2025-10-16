export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in minutes for cardio
  distance?: number; // for treadmill, cycling
  completed: boolean;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  day: string;
  date: string; // ISO date string for the specific day
  focus: string; // 'Shoulders', 'Cardio', 'Legs', etc.
  exercises: Exercise[];
  totalDuration?: number;
  completed: boolean;
  completedAt?: string;
}

export interface WorkoutWeek {
  id: string;
  weekStart: string; // ISO date string
  weekEnd: string; // ISO date string
  days: WorkoutDay[];
  completedDays: number;
}

export interface WorkoutProgress {
  exerciseId: string;
  date: string;
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  notes?: string;
}

export interface DailyWeight {
  date: string;
  weight: number; // in kg
  notes?: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalWorkouts: number;
  completedWorkouts: number;
  missedWorkouts: number;
  completionRate: number; // percentage
  averageWeight?: number;
}

export interface YearlyStats {
  year: number;
  totalWorkouts: number;
  completedWorkouts: number;
  missedWorkouts: number;
  completionRate: number; // percentage
  monthlyBreakdown: MonthlyStats[];
  weightProgress: { month: string; averageWeight: number }[];
}

// Weekly workout plan template (dates will be generated dynamically)
export interface WorkoutTemplate {
  id: string;
  day: string;
  focus: string;
  exercises: Exercise[];
  completed: boolean;
}

export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: 'monday',
    day: 'Monday',
    focus: 'Shoulders',
    completed: false,
    exercises: [
      {
        id: 'mon_1',
        name: '15 min treadmill walking running mix',
        duration: 15,
        completed: false,
      },
      {
        id: 'mon_2',
        name: 'Burpee',
        sets: 2,
        reps: 10,
        completed: false,
      },
      {
        id: 'mon_3',
        name: 'Dumbbell press overhead',
        sets: 4,
        weight: 7.5,
        completed: false,
      },
      {
        id: 'mon_4',
        name: 'Front raise',
        sets: 4,
        completed: false,
      },
      {
        id: 'mon_5',
        name: 'Lateral raise',
        sets: 4,
        completed: false,
      },
      {
        id: 'mon_6',
        name: 'Shrugs',
        sets: 4,
        completed: false,
      },
    ],
  },
  {
    id: 'tuesday',
    day: 'Tuesday',
    focus: 'Cardio',
    completed: false,
    exercises: [
      {
        id: 'tue_1',
        name: '15 min treadmill',
        duration: 15,
        completed: false,
      },
      {
        id: 'tue_2',
        name: '15 min cycling',
        duration: 15,
        completed: false,
      },
      {
        id: 'tue_3',
        name: '1 min stairs',
        sets: 5,
        duration: 1,
        completed: false,
      },
      {
        id: 'tue_4',
        name: 'Skipping rope',
        reps: 100,
        completed: false,
      },
      {
        id: 'tue_5',
        name: 'Jumping jacks',
        sets: 4,
        duration: 0.5,
        completed: false,
      },
      {
        id: 'tue_6',
        name: 'High knee',
        sets: 4,
        duration: 0.5,
        completed: false,
      },
      {
        id: 'tue_7',
        name: 'Planks',
        sets: 3,
        completed: false,
      },
      {
        id: 'tue_8',
        name: 'Crunches',
        sets: 3,
        completed: false,
      },
      {
        id: 'tue_9',
        name: 'Leg raises',
        sets: 3,
        completed: false,
      },
    ],
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    focus: 'Legs',
    completed: false,
    exercises: [
      {
        id: 'wed_1',
        name: '15 min cycling',
        duration: 15,
        completed: false,
      },
      {
        id: 'wed_2',
        name: '15 min treadmill',
        duration: 15,
        completed: false,
      },
      {
        id: 'wed_3',
        name: 'Squats',
        sets: 4,
        reps: 15,
        completed: false,
      },
      {
        id: 'wed_4',
        name: 'Walking lunges',
        sets: 4,
        reps: 15,
        completed: false,
      },
      {
        id: 'wed_5',
        name: 'Russian squats',
        sets: 4,
        reps: 15,
        completed: false,
      },
      {
        id: 'wed_6',
        name: 'Calf raises',
        sets: 4,
        reps: 15,
        completed: false,
      },
    ],
  },
  {
    id: 'thursday',
    day: 'Thursday',
    focus: 'Chest',
    completed: false,
    exercises: [
      {
        id: 'thu_1',
        name: '10 min treadmill',
        duration: 10,
        completed: false,
      },
      {
        id: 'thu_2',
        name: 'Dand (Push-ups)',
        reps: 30,
        completed: false,
      },
      {
        id: 'thu_3',
        name: 'Push-ups',
        reps: 30,
        completed: false,
      },
      {
        id: 'thu_4',
        name: 'Dumbbell press laying down',
        sets: 5,
        reps: 15,
        completed: false,
      },
      {
        id: 'thu_5',
        name: 'Cable fly',
        sets: 4,
        reps: 10,
        completed: false,
      },
      {
        id: 'thu_6',
        name: 'Lower chest',
        sets: 4,
        reps: 10,
        weight: 5,
        completed: false,
      },
    ],
  },
  {
    id: 'friday',
    day: 'Friday',
    focus: 'Biceps',
    completed: false,
    exercises: [
      {
        id: 'fri_1',
        name: 'Dand',
        reps: 20,
        completed: false,
      },
      {
        id: 'fri_2',
        name: 'Pullup reverse',
        reps: 10,
        completed: false,
      },
      {
        id: 'fri_3',
        name: 'Bend over row',
        sets: 4,
        reps: 15,
        completed: false,
      },
      {
        id: 'fri_4',
        name: 'One arm dumbbell',
        sets: 4,
        reps: 15,
        completed: false,
      },
      {
        id: 'fri_5',
        name: 'Deadlift',
        sets: 4,
        reps: 15,
        weight: 7.5,
        completed: false,
      },
      {
        id: 'fri_6',
        name: 'Dumbbell curl',
        sets: 2,
        reps: 15,
        weight: 7.5,
        completed: false,
      },
      {
        id: 'fri_7',
        name: 'Hammer curl',
        sets: 2,
        reps: 15,
        weight: 7.5,
        completed: false,
      },
      {
        id: 'fri_8',
        name: 'Concentration curls',
        sets: 4,
        completed: false,
      },
      {
        id: 'fri_9',
        name: 'Reverse curls',
        sets: 4,
        completed: false,
      },
      {
        id: 'fri_10',
        name: 'Forearms',
        sets: 2,
        completed: false,
      },
    ],
  },
  {
    id: 'saturday',
    day: 'Saturday',
    focus: 'Triceps',
    completed: false,
    exercises: [
      {
        id: 'sat_1',
        name: 'Reverse pushups',
        sets: 2,
        completed: false,
      },
      {
        id: 'sat_2',
        name: 'Close grip pushups',
        sets: 2,
        completed: false,
      },
      {
        id: 'sat_3',
        name: 'Thera band overhead',
        sets: 2,
        completed: false,
      },
      {
        id: 'sat_4',
        name: 'Thera band parallel',
        sets: 2,
        completed: false,
      },
      {
        id: 'sat_5',
        name: 'Both hands behind head',
        sets: 2,
        completed: false,
      },
      {
        id: 'sat_6',
        name: '15 min treadmill',
        duration: 15,
        completed: false,
      },
      {
        id: 'sat_7',
        name: '15 min cycling',
        duration: 15,
        completed: false,
      },
    ],
  },
];

// Generate workout weeks starting from Oct 17, 2025 (Friday)
export const generateWorkoutWeeks = (): WorkoutWeek[] => {
  const weeks: WorkoutWeek[] = [];
  const startDate = new Date('2025-10-17'); // First workout day (Friday)
  const weeksToGenerate = 52; // 1 year
  
  // Calculate which day of the week Oct 17 falls on (0=Sunday, 1=Monday, etc.)
  const startDayOfWeek = startDate.getDay(); // Friday = 5
  
  // Create continuous daily workouts starting from Oct 17
  const allWorkoutDays: WorkoutDay[] = [];
  
  for (let dayCount = 0; dayCount < weeksToGenerate * 7; dayCount++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayCount);
    
    const dayOfWeek = currentDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Skip Sundays (rest day)
    if (dayOfWeek === 0) continue;
    
    // Map day of week to workout plan index
    // Monday=1->0, Tuesday=2->1, Wednesday=3->2, Thursday=4->3, Friday=5->4, Saturday=6->5
    const workoutIndex = dayOfWeek - 1;
    const workoutTemplate = WORKOUT_PLAN[workoutIndex];
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][workoutIndex];
    
    allWorkoutDays.push({
      ...workoutTemplate,
      id: `workout-${dayCount}`,
      date: currentDate.toISOString().split('T')[0],
      day: dayName,
      completed: false,
      exercises: workoutTemplate.exercises.map(ex => ({ ...ex, completed: false })),
    });
  }
  
  // Group workout days into weeks (Monday to Sunday)
  let currentWeekStart = new Date('2025-10-13'); // Monday of week containing Oct 17
  
  for (let weekIndex = 0; weekIndex < weeksToGenerate; weekIndex++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + (weekIndex * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Find workout days that fall within this week
    const weekDays = allWorkoutDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate <= weekEnd;
    });
    
    weeks.push({
      id: `week-${weekIndex}`,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      days: weekDays,
      completedDays: 0,
    });
  }
  
  return weeks;
};

// Utility functions
export const getTodayWorkout = (workoutWeeks: WorkoutWeek[]): WorkoutDay | null => {
  const today = new Date().toISOString().split('T')[0];
  
  for (const week of workoutWeeks) {
    const todayWorkout = week.days.find(day => day.date === today);
    if (todayWorkout) {
      return todayWorkout;
    }
  }
  
  return null;
};

export const getWorkoutByDate = (workoutWeeks: WorkoutWeek[], date: string): WorkoutDay | null => {
  for (const week of workoutWeeks) {
    const workout = week.days.find(day => day.date === date);
    if (workout) {
      return workout;
    }
  }
  return null;
};

export const getCurrentWeek = (workoutWeeks: WorkoutWeek[]): WorkoutWeek | null => {
  const today = new Date().toISOString().split('T')[0];
  
  return workoutWeeks.find(week => 
    week.weekStart <= today && today <= week.weekEnd
  ) || null;
};

export const getWorkoutByDay = (dayName: string): WorkoutTemplate | undefined => {
  return WORKOUT_PLAN.find(workout => workout.day.toLowerCase() === dayName.toLowerCase());
};

export const calculateWorkoutProgress = (workout: WorkoutDay): number => {
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  return Math.round((completedExercises / workout.exercises.length) * 100);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const calculateMonthlyStats = (workoutWeeks: WorkoutWeek[], month: string): MonthlyStats => {
  const monthWorkouts = workoutWeeks.flatMap(week => 
    week.days.filter(day => day.date.startsWith(month))
  );
  
  const totalWorkouts = monthWorkouts.length;
  const completedWorkouts = monthWorkouts.filter(day => day.completed).length;
  const missedWorkouts = monthWorkouts.filter(day => {
    const dayDate = new Date(day.date);
    const today = new Date();
    return dayDate < today && !day.completed;
  }).length;
  
  return {
    month,
    totalWorkouts,
    completedWorkouts,
    missedWorkouts,
    completionRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0,
  };
};

export const calculateYearlyStats = (workoutWeeks: WorkoutWeek[], year: number): YearlyStats => {
  const yearStr = year.toString();
  const yearWorkouts = workoutWeeks.flatMap(week => 
    week.days.filter(day => day.date.startsWith(yearStr))
  );
  
  const totalWorkouts = yearWorkouts.length;
  const completedWorkouts = yearWorkouts.filter(day => day.completed).length;
  const missedWorkouts = yearWorkouts.filter(day => {
    const dayDate = new Date(day.date);
    const today = new Date();
    return dayDate < today && !day.completed;
  }).length;
  
  // Generate monthly breakdown
  const monthlyBreakdown: MonthlyStats[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    monthlyBreakdown.push(calculateMonthlyStats(workoutWeeks, monthStr));
  }
  
  return {
    year,
    totalWorkouts,
    completedWorkouts,
    missedWorkouts,
    completionRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0,
    monthlyBreakdown,
    weightProgress: [], // Will be populated with actual weight data
  };
};

export const getWorkoutStreak = (workoutWeeks: WorkoutWeek[]): number => {
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  
  // Find all past workouts in chronological order
  const pastWorkouts = workoutWeeks
    .flatMap(week => week.days)
    .filter(day => day.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  
  // Count consecutive completed workouts from today backwards
  for (const workout of pastWorkouts) {
    if (workout.completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};
