
import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';
import NotificationToast, { Notification } from './components/NotificationToast';
import OnboardingAssessment from './components/OnboardingAssessment';
import type { DiaryEntry, GamificationState, StressHotspot, CalendarEvent, OnboardingResult } from './types';
import { BADGES } from './constants';
import { getCalendarEvents, sendEmailNotification } from './services/mockApiService';
import { analyzeStressHotspots } from './services/geminiService';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [gamification, setGamification] = useState<GamificationState>({
    points: 0,
    streak: 0,
    badges: [],
    lastCheckInDate: null,
  });
  const [stressHotspots, setStressHotspots] = useState<StressHotspot[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedEventIds, setNotifiedEventIds] = useState<Set<string>>(new Set());

  const handleLoginSuccess = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    // In a real app, we'd check the DB if the user has completed onboarding.
    // For this demo, we'll assume they haven't if it's the first login in this session.
    setHasCompletedOnboarding(false);
  }, []);

  const handleOnboardingComplete = useCallback((result: OnboardingResult) => {
      console.log("Onboarding complete:", result);
      // Here you would save the emotional profile to the backend/context
      // to tailor future AI responses.
      setHasCompletedOnboarding(true);
  }, []);

  const handleAddHotspot = useCallback((hotspot: StressHotspot) => {
    setStressHotspots(prev => [...prev, hotspot]);
  }, []);

  const handleDeleteHotspot = useCallback((hotspotToDelete: StressHotspot) => {
    setStressHotspots(prev => prev.filter(h => 
        h.reason !== hotspotToDelete.reason || h.startTime !== hotspotToDelete.startTime
    ));
  }, []);

  const handleConnectCalendar = useCallback(async () => {
    // In a real application, this would trigger the OAuth flow.
    // For this simulation, we'll just set the state to connected.
    setIsCalendarConnected(true);
    // Fetch events and analyze hotspots upon connection
    try {
      const events = await getCalendarEvents();
      setCalendarEvents(events);
      if (events.length > 0) {
        const hotspots = await analyzeStressHotspots(events);
        // Merge detected hotspots with existing ones
        setStressHotspots(prev => [...prev, ...hotspots]);
      }
    } catch (error) {
      console.error("Failed to analyze calendar events:", error);
    }
  }, []);

  useEffect(() => {
    // If calendar is already connected on load (e.g. from a previous session),
    // fetch events and analyze.
    if (isCalendarConnected) {
      handleConnectCalendar();
    }
  }, [isCalendarConnected, handleConnectCalendar]);

  // Notification Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkEvents = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      // Check Calendar Events
      calendarEvents.forEach(event => {
        const startTime = new Date(event.startTime);
        const eventId = event.title + event.startTime; // Simple unique key

        // Trigger if event starts in the next 15 minutes and hasn't been notified
        if (startTime > now && startTime <= fifteenMinutesFromNow && !notifiedEventIds.has(eventId)) {
           const message = `Upcoming Event: "${event.title}" starts in ${Math.ceil((startTime.getTime() - now.getTime()) / 60000)} minutes.`;
           setNotifications(prev => [...prev, {
             id: Date.now().toString(),
             message: message,
             type: 'info'
           }]);
           setNotifiedEventIds(prev => new Set(prev).add(eventId));
        }
      });

      // Check Stress Hotspots (Override or Add to calendar check)
      stressHotspots.forEach(hotspot => {
         const startTime = new Date(hotspot.startTime);
         const hotspotId = 'hotspot-' + hotspot.reason + hotspot.startTime;
         
         if (startTime > now && startTime <= fifteenMinutesFromNow && !notifiedEventIds.has(hotspotId)) {
            const message = `Stress Alert: "${hotspot.reason}" is coming up. Consider a quick breathing exercise.`;
            setNotifications(prev => [...prev, {
              id: Date.now().toString() + 'h',
              message: message,
              type: 'warning'
            }]);
            
            // Send email notification
            if (userEmail && userEmail !== 'guest@eight.app') {
                sendEmailNotification(userEmail, "Proactive Stress Alert", message);
            }

            setNotifiedEventIds(prev => new Set(prev).add(hotspotId));
         }
      });
    };

    const intervalId = setInterval(checkEvents, 10000); // Check every 10 seconds for demo responsiveness
    checkEvents(); // Initial check

    return () => clearInterval(intervalId);
  }, [isAuthenticated, calendarEvents, stressHotspots, notifiedEventIds, userEmail]);

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  const handleSessionComplete = useCallback((newEntry: DiaryEntry) => {
    setDiaryEntries(prevEntries => [...prevEntries, newEntry]);

    setGamification(prev => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const newPoints = prev.points + 10; // 10 points per session
      let newStreak = prev.streak;

      if (prev.lastCheckInDate === yesterday) {
        newStreak += 1; // Continue streak
      } else if (prev.lastCheckInDate !== today) {
        newStreak = 1; // Start a new streak if not already checked in today
      }
      // If last check-in was today, streak doesn't change.

      const earnedBadges = BADGES.filter(badge =>
        !prev.badges.includes(badge.id) &&
        (
          (badge.requirement.type === 'points' && newPoints >= badge.requirement.value) ||
          (badge.requirement.type === 'streak' && newStreak >= badge.requirement.value)
        )
      ).map(b => b.id);

      return {
        points: newPoints,
        streak: newStreak,
        badges: [...prev.badges, ...earnedBadges],
        lastCheckInDate: today,
      };
    });
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotification} />
      {!isAuthenticated ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : !hasCompletedOnboarding ? (
        <OnboardingAssessment onComplete={handleOnboardingComplete} />
      ) : (
        <ChatInterface 
          diaryEntries={diaryEntries}
          onSessionComplete={handleSessionComplete}
          gamification={gamification}
          isCalendarConnected={isCalendarConnected}
          onConnectCalendar={handleConnectCalendar}
          stressHotspots={stressHotspots}
          calendarEvents={calendarEvents}
          onAddHotspot={handleAddHotspot}
          onDeleteHotspot={handleDeleteHotspot}
        />
      )}
    </div>
  );
};

export default App;
