
import React from 'react';

type IconName = 'shield' | 'book' | 'menu' | 'camera' | 'send' | 'bot' | 'users' | 'inbox' | 'close' | 'chevronUp' | 'chevronDown' | 'star' | 'flame' | 'award' | 'lightbulb' | 'speaker' | 'microphone' | 'mood-great' | 'mood-good' | 'mood-okay' | 'mood-bad' | 'mood-awful' | 'brain' | 'moon' | 'bed' | 'calendar' | 'bell' | 'check' | 'trash';

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  // FIX: Changed SVG attributes to camelCase for React compatibility.
  const icons: Record<IconName, React.ReactElement> = {
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />,
    book: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />,
    camera: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
    bot: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.226c-3.42.064-6.58.34-9.578.827A3 3 0 002.25 18.72v.538c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-.538c0-1.33-1.07-2.422-2.38-2.528A41.22 41.22 0 0012 15.75c-2.903 0-5.74.234-8.433.666zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    inbox: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.12-1.588H6.88a2.25 2.25 0 00-2.12 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    chevronUp: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />,
    chevronDown: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
    flame: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c.393 2.118.723 4.227 1.047 6.331 1.091-2.148 2.31-4.433 3.645-6.713a8.26 8.26 0 00-1.33-3.004z" />,
    award: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    lightbulb: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a3 3 0 00-3-3m3 3a3 3 0 003-3m-3 3V11.25m2.25 2.25a.75.75 0 000-1.5m-4.5 0a.75.75 0 000 1.5M12 21a9 9 0 110-18 9 9 0 010 18z" />,
    speaker: <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />,
    microphone: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />,
    'mood-great': <><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5a.5.5 0 11-1 0 .5.5 0 011 0zM15.5 14.5a.5.5 0 11-1 0 .5.5 0 011 0z" /></>,
    'mood-good': <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'mood-okay': <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5h5M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'mood-bad': <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15.5a4 4 0 105 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'mood-awful': <><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15.5a4 4 0 105 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 16l-1.5-1.5M8 16l1.5-1.5" /></>,
    brain: <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.75c0 .414.336.75.75.75H12a.75.75 0 00.75-.75V9.75A.75.75 0 0012 9h-1.75a.75.75 0 00-.75.75v3zm0-6.25a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-.25zM12.75 6h.25a.75.75 0 00.75-.75V5a.75.75 0 00-.75-.75h-.25a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75zM12 3.75a.75.75 0 01.75-.75h.25a.75.75 0 01.75.75v.25a.75.75 0 01-.75.75h-.25a.75.75 0 01-.75-.75V3.75zM9 15.75a.75.75 0 00-.75.75v.25a.75.75 0 00.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75H9zM3.375 13.5a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75h-.25zM4.5 10.5a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75H4.5zM16.125 3.375a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75h-.25zM19.5 7.5a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75h-.25zM19.5 11.25a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75h-.25zM16.125 15.375a.75.75 0 00-.75.75v.25c0 .414.336.75.75.75h.25a.75.75 0 00.75-.75v-.25a.75.75 0 00-.75-.75h-.25z" />,
    moon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
    bed: <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.25v2.25c0 .966.784 1.75 1.75 1.75h12.5a1.75 1.75 0 001.75-1.75v-2.25M4 11.25V9a1.75 1.75 0 011.75-1.75h12.5A1.75 1.75 0 0120 9v2.25M4 11.25h16M11.25 7.5v-2.25c0-.966.784-1.75 1.75-1.75h0a1.75 1.75 0 011.75 1.75v2.25" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name]}
    </svg>
  );
};
