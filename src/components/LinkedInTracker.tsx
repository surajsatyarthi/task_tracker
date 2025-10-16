'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface LinkedInPost {
  date: string;
  day: 'Monday' | 'Thursday';
  posted: boolean;
  content?: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface WeekData {
  weekStart: string;
  weekEnd: string;
  monday: LinkedInPost | null;
  thursday: LinkedInPost | null;
  completed: number; // 0, 1, or 2
}

const LinkedInTracker: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followerInput, setFollowerInput] = useState('');

  // Generate weekly data starting from Oct 17, 2025
  useEffect(() => {
    const startDate = new Date('2025-10-17'); // First Friday
    const weeks: WeekData[] = [];
    
    for (let i = 0; i < 52; i++) { // Generate 52 weeks
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7) - 4); // Go to Monday
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      
      const monday = new Date(weekStart);
      const thursday = new Date(weekStart);
      thursday.setDate(weekStart.getDate() + 3);
      
      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        monday: {
          date: monday.toISOString().split('T')[0],
          day: 'Monday',
          posted: false
        },
        thursday: {
          date: thursday.toISOString().split('T')[0],
          day: 'Thursday',
          posted: false
        },
        completed: 0
      });
    }
    
    setWeeklyData(weeks);
    setCurrentWeek(new Date());
  }, []);

  const getCurrentWeekData = (): WeekData | null => {
    const today = new Date();
    return weeklyData.find(week => {
      const start = new Date(week.weekStart);
      const end = new Date(week.weekEnd);
      return today >= start && today <= end;
    }) || null;
  };

  const getWeekForDate = (date: Date): WeekData | null => {
    return weeklyData.find(week => {
      const start = new Date(week.weekStart);
      const end = new Date(week.weekEnd);
      return date >= start && date <= end;
    }) || null;
  };

  const togglePost = (weekIndex: number, postType: 'monday' | 'thursday') => {
    setWeeklyData(prev => {
      const updated = [...prev];
      const week = updated[weekIndex];
      
      if (week[postType]) {
        week[postType]!.posted = !week[postType]!.posted;
        week.completed = (week.monday?.posted ? 1 : 0) + (week.thursday?.posted ? 1 : 0);
        
        // Update total posts count
        const allPosts = updated.flatMap(w => [w.monday, w.thursday]).filter(p => p?.posted);
        setTotalPosts(allPosts.length);
      }
      
      return updated;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newWeek;
    });
  };

  const updateFollowerCount = () => {
    const count = parseInt(followerInput);
    if (count > 0) {
      setFollowerCount(count);
      setFollowerInput('');
    }
  };

  const currentWeekData = getWeekForDate(currentWeek);
  const currentWeekIndex = weeklyData.findIndex(week => week.weekStart === currentWeekData?.weekStart);
  
  // Calculate statistics
  const totalWeeksWithData = weeklyData.filter(week => week.completed > 0).length;
  const perfectWeeks = weeklyData.filter(week => week.completed === 2).length;
  const consistencyRate = totalWeeksWithData > 0 ? Math.round((perfectWeeks / totalWeeksWithData) * 100) : 0;

  if (!currentWeekData) {
    return <div className="flex justify-center items-center h-64">Loading LinkedIn tracker...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Growth Tracker</h2>
        <p className="text-gray-600">Track your Monday & Thursday posting schedule to grow your following</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalPosts}</div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{perfectWeeks}</div>
          <div className="text-sm text-gray-600">Perfect Weeks</div>
          <div className="text-xs text-gray-500">2 posts/week</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{consistencyRate}%</div>
          <div className="text-sm text-gray-600">Consistency</div>
          <div className="text-xs text-gray-500">rate</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserGroupIcon className="w-5 h-5 text-orange-500" />
            <div className="text-2xl font-bold text-orange-600">{followerCount}</div>
          </div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
      </div>

      {/* Follower Count Update */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Follower Count</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={followerInput}
            onChange={(e) => setFollowerInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter current follower count..."
          />
          <button
            onClick={updateFollowerCount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      {/* Weekly Posting Tracker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {new Date(currentWeekData.weekStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(currentWeekData.weekEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-gray-600 mt-1">
              Week {currentWeekIndex + 1} • {currentWeekData.completed}/2 posts completed
            </p>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Monday & Thursday Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monday Post */}
          <div className={`p-6 rounded-xl border-2 transition-all ${
            currentWeekData.monday?.posted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Monday Post</h4>
                <p className="text-gray-600">
                  {new Date(currentWeekData.monday!.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => togglePost(currentWeekIndex, 'monday')}
                className="p-3 rounded-full transition-colors hover:bg-gray-100"
              >
                {currentWeekData.monday?.posted ? (
                  <CheckCircleIconSolid className="w-8 h-8 text-green-600" />
                ) : (
                  <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="text-center">
              <div className={`text-sm font-medium ${
                currentWeekData.monday?.posted ? 'text-green-800' : 'text-gray-600'
              }`}>
                {currentWeekData.monday?.posted ? '✅ Posted!' : '📝 Not posted yet'}
              </div>
            </div>
          </div>

          {/* Thursday Post */}
          <div className={`p-6 rounded-xl border-2 transition-all ${
            currentWeekData.thursday?.posted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Thursday Post</h4>
                <p className="text-gray-600">
                  {new Date(currentWeekData.thursday!.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => togglePost(currentWeekIndex, 'thursday')}
                className="p-3 rounded-full transition-colors hover:bg-gray-100"
              >
                {currentWeekData.thursday?.posted ? (
                  <CheckCircleIconSolid className="w-8 h-8 text-green-600" />
                ) : (
                  <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="text-center">
              <div className={`text-sm font-medium ${
                currentWeekData.thursday?.posted ? 'text-green-800' : 'text-gray-600'
              }`}>
                {currentWeekData.thursday?.posted ? '✅ Posted!' : '📝 Not posted yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Week Progress */}
        <div className="mt-6 text-center">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">
              Weekly Progress: {currentWeekData.completed}/2 posts
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 max-w-xs mx-auto">
            <div 
              className="bg-blue-500 rounded-full h-3 transition-all duration-300"
              style={{ width: `${(currentWeekData.completed / 2) * 100}%` }}
            />
          </div>
          {currentWeekData.completed === 2 && (
            <div className="mt-3 text-green-600 font-medium">
              🎉 Perfect week! Keep up the consistency!
            </div>
          )}
        </div>
      </div>

      {/* Recent Weeks Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weeks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {weeklyData.slice(Math.max(0, currentWeekIndex - 5), currentWeekIndex + 1).reverse().map((week, index) => {
            const isCurrentWeek = week.weekStart === currentWeekData.weekStart;
            return (
              <div key={week.weekStart} className={`text-center p-3 rounded-lg ${
                isCurrentWeek ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <div className={`text-sm font-medium ${isCurrentWeek ? 'text-blue-800' : 'text-gray-600'}`}>
                  {new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  <div className={`w-3 h-3 rounded-full ${week.monday?.posted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-3 h-3 rounded-full ${week.thursday?.posted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{week.completed}/2</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LinkedInTracker;