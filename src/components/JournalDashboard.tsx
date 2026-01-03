'use client';

import React, { useState, useEffect } from 'react';
import { 
  SunIcon,
  MoonIcon,
  FireIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import {
  DailyJournalEntry,
  getTodayEntry,
  createEmptyEntry,
  calculateJournalStats,
  getRandomPrompt
} from '../types/journal';

interface JournalDashboardProps {
  onEntryUpdate?: (entry: DailyJournalEntry) => void;
}

type JournalView = 'today' | 'history';

const JournalDashboard: React.FC<JournalDashboardProps> = ({ onEntryUpdate }) => {
  const [activeView, setActiveView] = useState<JournalView>('today');
  const [entries, setEntries] = useState<DailyJournalEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<DailyJournalEntry | null>(null);

  useEffect(() => {
    // Initialize with empty entries - journaling starts from January 1, 2026
    const sampleEntries: DailyJournalEntry[] = [];
    
    setEntries(sampleEntries);
    
    // Create or get today's entry (starting from Oct 17, 2025)
    const startDate = new Date('2026-01-01');
    const currentDate = new Date();
    
    // Only create entry if current date is Oct 17 or later
    if (currentDate >= startDate) {
      const today = currentDate.toISOString().split('T')[0];
      const existing = getTodayEntry(sampleEntries);
      
      if (existing) {
        setTodayEntry(existing);
      } else {
        const newEntry: DailyJournalEntry = {
          id: `entry-${Date.now()}`,
          ...createEmptyEntry(today),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTodayEntry(newEntry);
        setEntries(prev => [...prev, newEntry]);
      }
    } else {
      // Before Oct 17, show empty state for tomorrow
      const tomorrow = '2026-01-01';
      const newEntry: DailyJournalEntry = {
        id: 'entry-tomorrow',
        ...createEmptyEntry(tomorrow),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTodayEntry(newEntry);
    }
  }, []);

  const updateEntry = (updates: Partial<DailyJournalEntry>) => {
    if (!todayEntry) return;
    
    const updatedEntry = {
      ...todayEntry,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    setTodayEntry(updatedEntry);
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    
    if (onEntryUpdate) {
      onEntryUpdate(updatedEntry);
    }
  };

  const handleMorningComplete = () => {
    updateEntry({
      morningCompleted: true,
      morningCompletedAt: new Date().toISOString(),
    });
  };

  const handleEveningComplete = () => {
    updateEntry({
      eveningCompleted: true,
      eveningCompletedAt: new Date().toISOString(),
    });
  };

  const updateArrayField = (field: keyof DailyJournalEntry, index: number, value: string) => {
    if (!todayEntry) return;
    
    const currentArray = (todayEntry[field] as string[]) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    
    updateEntry({ [field]: newArray });
  };

  const addArrayItem = (field: keyof DailyJournalEntry) => {
    if (!todayEntry) return;
    
    const currentArray = (todayEntry[field] as string[]) || [];
    const newArray = [...currentArray, ''];
    
    updateEntry({ [field]: newArray });
  };

  const stats = calculateJournalStats(entries);

  if (!todayEntry) {
    return <div className="flex justify-center items-center h-64">Loading journal...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Journal</h2>
        <p className="text-gray-600">Cultivate gratitude, reflection, and mindful growth</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('today')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'today'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Today&apos;s Entry
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 History & Stats
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
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">consecutive days</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <SunIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Morning</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.morningCompletionRate}%</div>
          <div className="text-xs text-gray-500">completion rate</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <MoonIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Evening</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.eveningCompletionRate}%</div>
          <div className="text-xs text-gray-500">completion rate</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.thisMonthEntries}</div>
          <div className="text-xs text-gray-500">entries completed</div>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'today' && (
        <div className="space-y-6">
          {/* Today's Date */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {new Date(todayEntry.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>

          {/* Morning Reflection */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <SunIcon className="w-6 h-6 text-yellow-500" />
                Morning Reflection
              </h4>
              {!todayEntry.morningCompleted && (
                <button
                  onClick={handleMorningComplete}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              {todayEntry.morningCompleted && (
                <span className="text-sm text-green-600 font-medium">✅ Completed</span>
              )}
            </div>

            <div className="space-y-4">
              {/* Today's Intention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 What do I want to focus on today?
                </label>
                <textarea
                  value={todayEntry.morningIntention || ''}
                  onChange={(e) => updateEntry({ morningIntention: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={2}
                  placeholder="My intention for today is..."
                />
              </div>

              {/* Morning Gratitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🙏 Three things I&apos;m grateful for right now:
                </label>
                {(todayEntry.morningGratitude || []).map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) => updateArrayField('morningGratitude', index, e.target.value)}
                    className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder={`Grateful for... (${getRandomPrompt('gratitude')})`}
                  />
                ))}
              </div>

              {/* Morning Affirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✨ Positive affirmation for myself:
                </label>
                <input
                  value={todayEntry.morningAffirmation || ''}
                  onChange={(e) => updateEntry({ morningAffirmation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder={getRandomPrompt('affirmations')}
                />
              </div>
            </div>
          </div>

          {/* Evening Reflection */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MoonIcon className="w-6 h-6 text-purple-500" />
                Evening Reflection
              </h4>
              {!todayEntry.eveningCompleted && (
                <button
                  onClick={handleEveningComplete}
                  className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              {todayEntry.eveningCompleted && (
                <span className="text-sm text-green-600 font-medium">✅ Completed</span>
              )}
            </div>

            <div className="space-y-4">
              {/* Things Learned */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💡 Two things I learned today:
                </label>
                {(todayEntry.thingsLearned || []).map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      value={item}
                      onChange={(e) => updateArrayField('thingsLearned', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={`Learning #${index + 1}: ${getRandomPrompt('learning')}`}
                    />
                  </div>
                ))}
              </div>

              {/* Wins & Achievements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏆 What went well today:
                </label>
                {(todayEntry.winsAchievements || []).map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      value={item}
                      onChange={(e) => updateArrayField('winsAchievements', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={getRandomPrompt('achievements')}
                    />
                    {index === (todayEntry.winsAchievements?.length || 1) - 1 && (
                      <button
                        onClick={() => addArrayItem('winsAchievements')}
                        className="p-3 text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Challenges & Growth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌱 How I handled challenges and grew:
                </label>
                <textarea
                  value={todayEntry.challengesGrowth || ''}
                  onChange={(e) => updateEntry({ challengesGrowth: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="I grew today by..."
                />
              </div>

              {/* Evening Gratitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🙏 Three more things I&apos;m grateful for from today:
                </label>
                {(todayEntry.eveningGratitude || []).map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) => updateArrayField('eveningGratitude', index, e.target.value)}
                    className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`Grateful for... (${getRandomPrompt('gratitude')})`}
                  />
                ))}
              </div>

              {/* Tomorrow's Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌅 One important thing for tomorrow:
                </label>
                <input
                  value={todayEntry.tomorrowPriority || ''}
                  onChange={(e) => updateEntry({ tomorrowPriority: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tomorrow I will focus on..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className="space-y-6">
          {/* Statistics Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reflection Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.completedDays}</div>
                <div className="text-sm text-gray-600">Completed Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.morningCompletionRate}%</div>
                <div className="text-sm text-gray-600">Morning Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.eveningCompletionRate}%</div>
                <div className="text-sm text-gray-600">Evening Rate</div>
              </div>
            </div>
          </div>
          
          {/* History Table */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal History ({entries.length} entries)</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning Intention</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Things Learned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins & Achievements</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tomorrow&apos;s Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.sort((a, b) => b.date.localeCompare(a.date)).map((entry, index) => (
                    <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {entry.morningCompleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              ☀️ Morning ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                              ☀️ Morning -
                            </span>
                          )}
                          {entry.eveningCompleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              🌙 Evening ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                              🌙 Evening -
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {entry.morningIntention || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {entry.thingsLearned && entry.thingsLearned.filter(Boolean).length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {entry.thingsLearned.filter(Boolean).map((learning, idx) => (
                                <li key={idx} className="text-xs">{learning}</li>
                              ))}
                            </ul>
                          ) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {entry.winsAchievements && entry.winsAchievements.filter(Boolean).length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {entry.winsAchievements.filter(Boolean).map((win, idx) => (
                                <li key={idx} className="text-xs">{win}</li>
                              ))}
                            </ul>
                          ) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {entry.tomorrowPriority || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalDashboard;