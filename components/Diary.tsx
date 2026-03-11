
import React, { useState } from 'react';
import type { DiaryEntry, GamificationState, StressHotspot, CalendarEvent } from '../types';
import { Icon } from './Icon';
import { BADGES, MOOD_CONFIG } from '../constants';
import AddHotspotModal from './AddHotspotModal';

interface DiaryProps {
  entries: DiaryEntry[];
  isOpen: boolean;
  onToggle: () => void;
  gamification: GamificationState;
  isCalendarConnected: boolean;
  onConnectCalendar: () => void;
  stressHotspots: StressHotspot[];
  calendarEvents: CalendarEvent[];
  onAddHotspot: (hotspot: StressHotspot) => void;
  onDeleteHotspot: (hotspot: StressHotspot) => void;
}

const Diary: React.FC<DiaryProps> = ({ entries, isOpen, onToggle, gamification, isCalendarConnected, onConnectCalendar, stressHotspots, calendarEvents, onAddHotspot, onDeleteHotspot }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddHotspotModalOpen, setIsAddHotspotModalOpen] = useState(false);

  const toggleEntry = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getBadgeDetails = (badgeId: string) => BADGES.find(b => b.id === badgeId);

  const recentEntriesWithMood = entries.filter(e => e.mood).slice(-7);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const handleAddHotspotSubmit = (hotspot: StressHotspot) => {
    onAddHotspot(hotspot);
    setIsAddHotspotModalOpen(false);
  }

  return (
    <>
      <aside className={`flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${isOpen ? 'w-full md:w-96' : 'w-0'
        } overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Icon name="book" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Diary & Progress</h2>
          </div>
          <button onClick={onToggle} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Icon name="close" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Gamification Stats */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-around text-center">
            <div className="flex flex-col items-center">
              <Icon name="star" className="w-6 h-6 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{gamification.points}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Points</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="flame" className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{gamification.streak}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Day Streak</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {gamification.badges.length > 0 ? (
                gamification.badges.map(badgeId => {
                  const badge = getBadgeDetails(badgeId);
                  return badge ? (
                    <div key={badge.id} title={`${badge.name}: ${badge.description}`} className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                      <Icon name={badge.icon} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : null;
                })
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Keep checking in to earn badges!</p>
              )}
            </div>
          </div>
        </div>

         {/* Stress Hotspots */}
         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Today's Stress Hotspots</h3>
             <button 
              onClick={() => setIsAddHotspotModalOpen(true)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="Add Stress Hotspot"
             >
               <Icon name="calendar" className="w-5 h-5" />
             </button>
          </div>
          
          {!isCalendarConnected && stressHotspots.length === 0 ? (
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon name="calendar" className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Connect calendar or add manually to track stress points.</p>
              <button onClick={onConnectCalendar} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">
                Connect Calendar
              </button>
            </div>
          ) : stressHotspots.length > 0 ? (
            <div className="space-y-3">
               {/* Display Hotspots */}
              {stressHotspots.map((hotspot, index) => (
                <div key={index} className="group relative p-2 rounded-lg border-l-4 bg-red-100 dark:bg-red-900/40 border-red-500 flex justify-between items-start">
                   <div>
                       <p className="text-xs font-bold text-red-800 dark:text-red-300">{hotspot.reason}</p>
                       <p className="text-xs text-red-600 dark:text-red-400">{formatTime(hotspot.startTime)} - {formatTime(hotspot.endTime)}</p>
                   </div>
                   <button 
                       onClick={() => onDeleteHotspot(hotspot)}
                       className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-200 dark:hover:bg-red-900 rounded"
                       title="Delete Hotspot"
                   >
                       <Icon name="trash" className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">No stress hotspots detected or added today.</p>
          )}
        </div>


        {/* Mood Trends */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mood Trends (Last 7 Sessions)</h3>
          {recentEntriesWithMood.length > 0 ? (
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {recentEntriesWithMood.map(entry => {
                const moodConfig = MOOD_CONFIG[entry.mood!];
                return (
                  <div key={entry.id} className="flex flex-col items-center group" title={`${new Date(entry.timestamp).toLocaleDateString()}: ${moodConfig.label}`}>
                     <Icon name={moodConfig.icon as any} className={`w-7 h-7 ${moodConfig.color}`} />
                     <span className="text-xs mt-1 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                       {new Date(entry.timestamp).getDate()}
                     </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">Log your mood after a session to see trends here.</p>
          )}
        </div>


        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <Icon name="inbox" className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2">No entries yet.</p>
              <p className="text-sm">Complete a session to create your first diary entry.</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <button onClick={() => toggleEntry(entry.id)} className="w-full text-left p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {entry.summary.split('\n')[0]}
                    </p>
                  </div>
                  <Icon name={expandedId === entry.id ? "chevronUp" : "chevronDown"} className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </button>
                {expandedId === entry.id && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.summary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
      {isAddHotspotModalOpen && (
        <AddHotspotModal onAdd={handleAddHotspotSubmit} onCancel={() => setIsAddHotspotModalOpen(false)} />
      )}
    </>
  );
};

export default Diary;
