import React from 'react';
import type { Mood } from '../types';
import { Icon } from './Icon';
import { MOOD_CONFIG } from '../constants';

interface MoodLogModalProps {
  onMoodSelect: (mood: Mood) => void;
  onCancel: () => void;
}

const MoodLogModal: React.FC<MoodLogModalProps> = ({ onMoodSelect, onCancel }) => {
  const moods: Mood[] = ['great', 'good', 'okay', 'bad', 'awful'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center transform transition-all scale-100">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How are you feeling?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Select a mood to log it with your session entry.</p>

        <div className="flex justify-around items-center mb-8">
          {moods.map((mood) => {
            const config = MOOD_CONFIG[mood];
            return (
              <button
                key={mood}
                onClick={() => onMoodSelect(mood)}
                className="flex flex-col items-center justify-center space-y-2 group"
                aria-label={config.label}
              >
                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors`}>
                   <Icon name={config.icon as any} className={`w-12 h-12 ${config.color} transition-transform group-hover:scale-110`} />
                </div>
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{config.label}</span>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MoodLogModal;