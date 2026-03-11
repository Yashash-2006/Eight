
import React from 'react';
import { Icon } from './Icon';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className={`flex items-start p-4 rounded-lg shadow-lg max-w-sm pointer-events-auto transition-all transform animate-slide-in ${
            n.type === 'warning' ? 'bg-red-50 dark:bg-red-900/80 border-l-4 border-red-500' : 
            n.type === 'success' ? 'bg-green-50 dark:bg-green-900/80 border-l-4 border-green-500' :
            'bg-white dark:bg-gray-800 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex-shrink-0 mr-3">
             <Icon name={n.type === 'warning' ? 'flame' : n.type === 'success' ? 'check' : 'bell'} className={`w-5 h-5 ${
                n.type === 'warning' ? 'text-red-500' : 
                n.type === 'success' ? 'text-green-500' : 
                'text-blue-500'
             }`} />
          </div>
          <div className="flex-1 mr-2">
            <p className={`text-sm font-medium ${
                 n.type === 'warning' ? 'text-red-800 dark:text-red-100' : 
                 n.type === 'success' ? 'text-green-800 dark:text-green-100' : 
                 'text-gray-900 dark:text-white'
            }`}>
              {n.message}
            </p>
          </div>
          <button onClick={() => onDismiss(n.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
