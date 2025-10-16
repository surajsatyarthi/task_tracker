export interface DailyJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  
  // Morning Reflection
  morningIntention?: string;
  morningGratitude?: string[];
  morningAffirmation?: string;
  morningCompleted: boolean;
  morningCompletedAt?: string;
  
  // Evening Reflection
  thingsLearned?: string[];
  winsAchievements?: string[];
  challengesGrowth?: string;
  eveningGratitude?: string[];
  tomorrowPriority?: string;
  eveningCompleted: boolean;
  eveningCompletedAt?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface JournalStats {
  totalEntries: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  morningCompletionRate: number;
  eveningCompletionRate: number;
  thisMonthEntries: number;
}

// Journal prompts for inspiration
export const JOURNAL_PROMPTS = {
  gratitude: [
    "What made me smile today?",
    "Who am I thankful for and why?",
    "What simple pleasure brought me joy?",
    "What opportunity am I grateful for?",
    "What part of my body am I grateful for today?",
  ],
  learning: [
    "What did I discover about myself today?",
    "What skill did I practice or improve?",
    "What mistake taught me something valuable?",
    "What feedback did I receive that helped me grow?",
    "What book, article, or conversation inspired me?",
  ],
  achievements: [
    "What small victory am I proud of?",
    "How did I help someone today?",
    "What challenge did I overcome?",
    "What goal did I make progress on?",
    "What habit did I maintain or start?",
  ],
  affirmations: [
    "I am capable of handling whatever comes my way",
    "I choose to focus on what I can control",
    "I am growing stronger through every experience",
    "I deserve love, happiness, and success",
    "I am grateful for this moment and this day",
  ],
};

// Utility functions
export const getTodayEntry = (entries: DailyJournalEntry[]): DailyJournalEntry | null => {
  const today = new Date().toISOString().split('T')[0];
  return entries.find(entry => entry.date === today) || null;
};

export const createEmptyEntry = (date: string): Omit<DailyJournalEntry, 'id' | 'created_at' | 'updated_at'> => ({
  date,
  morningGratitude: ['', '', ''],
  morningCompleted: false,
  eveningGratitude: ['', '', ''],
  thingsLearned: ['', ''],
  winsAchievements: [''],
  eveningCompleted: false,
});

export const calculateJournalStreak = (entries: DailyJournalEntry[]): number => {
  const today = new Date();
  let streak = 0;
  
  // Sort entries by date (most recent first)
  const sortedEntries = entries
    .filter(entry => {
      const isCompleted = entry.morningCompleted || entry.eveningCompleted;
      return isCompleted;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  
  // Count consecutive days from today backwards
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateJournalStats = (entries: DailyJournalEntry[]): JournalStats => {
  const totalEntries = entries.length;
  const completedDays = entries.filter(entry => 
    entry.morningCompleted || entry.eveningCompleted
  ).length;
  
  const morningCompletedCount = entries.filter(entry => entry.morningCompleted).length;
  const eveningCompletedCount = entries.filter(entry => entry.eveningCompleted).length;
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  const thisMonthEntries = entries.filter(entry => 
    entry.date.startsWith(currentMonth) && (entry.morningCompleted || entry.eveningCompleted)
  ).length;
  
  return {
    totalEntries,
    completedDays,
    currentStreak: calculateJournalStreak(entries),
    longestStreak: calculateJournalStreak(entries), // Simplified - could be enhanced
    morningCompletionRate: totalEntries > 0 ? Math.round((morningCompletedCount / totalEntries) * 100) : 0,
    eveningCompletionRate: totalEntries > 0 ? Math.round((eveningCompletedCount / totalEntries) * 100) : 0,
    thisMonthEntries,
  };
};

export const getRandomPrompt = (category: keyof typeof JOURNAL_PROMPTS): string => {
  const prompts = JOURNAL_PROMPTS[category];
  return prompts[Math.floor(Math.random() * prompts.length)];
};