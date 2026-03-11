import React from 'react';
import { Icon } from './Icon';
import { MEDITATION_THEMES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface MeditationModalProps {
  onSelectTheme: (theme: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const MeditationModal: React.FC<MeditationModalProps> = ({ onSelectTheme, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center transform transition-all scale-100">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guided Meditation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Choose a theme to begin a new session.</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <LoadingSpinner />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Preparing your session...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {MEDITATION_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.name)}
                  className="flex flex-col items-center justify-center p-6 space-y-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
                  aria-label={theme.name}
                >
                  <Icon name={theme.icon as any} className="w-10 h-10 text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110" />
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{theme.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onCancel}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MeditationModal;
