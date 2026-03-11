
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { DiaryEntry, Message, GamificationState, StressHotspot, CalendarEvent, Mood } from '../types';
import { Icon } from './Icon';
import Diary from './Diary';
import LoadingSpinner from './LoadingSpinner';
import MoodLogModal from './MoodLogModal';
import ConfirmationModal from './ConfirmationModal';
import { useCamera } from '../hooks/useCamera';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { analyzeTextAndImage, generateSpeech, runTool, summarizeConversation, performProactiveCheck } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { JOURNAL_PROMPTS, MOOD_CONFIG, MOTIVATIONAL_QUOTES } from '../constants';

interface ChatInterfaceProps {
  diaryEntries: DiaryEntry[];
  onSessionComplete: (entry: DiaryEntry) => void;
  gamification: GamificationState;
  isCalendarConnected: boolean;
  onConnectCalendar: () => void;
  stressHotspots: StressHotspot[];
  calendarEvents: CalendarEvent[];
  onAddHotspot: (hotspot: StressHotspot) => void;
  onDeleteHotspot: (hotspot: StressHotspot) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ diaryEntries, onSessionComplete, gamification, isCalendarConnected, onConnectCalendar, stressHotspots, calendarEvents, onAddHotspot, onDeleteHotspot }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Checking in on your day...", sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start in loading state for proactive check
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAwaitingMoodLog, setIsAwaitingMoodLog] = useState(false);
  const [isQuickCheckInFlow, setIsQuickCheckInFlow] = useState(false);

  // Session Timer State (8 minutes = 480 seconds)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(480);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // End Session Confirmation State
  const [isEndSessionConfirmationOpen, setIsEndSessionConfirmationOpen] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  const { videoRef, canvasRef, isCameraOn } = useCamera();
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Audio Queue State
  const audioQueue = useRef<string[]>([]);
  const isPlayingAudio = useRef(false);
  const nextAudioStartTime = useRef(0);
  const audioPlayerRefs = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Fixed Voice: Breezy & Light
  const FIXED_VOICE = 'Kore';

  const handleTranscriptUpdate = useCallback((transcript: string) => {
    setInput(transcript);
  }, []);

  const { isListening, toggleListening } = useVoiceInput(handleTranscriptUpdate);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
      let interval: any;
      if (isTimerActive && sessionTimeRemaining > 0) {
          interval = setInterval(() => {
              setSessionTimeRemaining(prev => prev - 1);
          }, 1000);
      } else if (sessionTimeRemaining === 0) {
          setIsTimerActive(false);
          // Optional: Notify user time is up, but don't force quit
          const hasTimeUpMsg = messages.some(m => m.id === 'time-up-msg');
          if (!hasTimeUpMsg) {
             setMessages(prev => [...prev, {
                 id: 'time-up-msg',
                 sender: 'ai',
                 text: "That's 8 minutes! We've completed our focused session time. Feel free to wrap up or continue if you need more time."
             }]);
          }
      }
      return () => clearInterval(interval);
  }, [isTimerActive, sessionTimeRemaining, messages]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Initialize AudioContext lazily or on mount
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Global listener to resume audio context on any user interaction
    const resumeAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.error("Audio resume failed", e));
      }
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    document.addEventListener('keydown', resumeAudio);

    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      audioPlayerRefs.current.forEach(source => source.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const ensureAudioContextResumed = async () => {
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.error("Failed to resume AudioContext", err);
      }
    }
  };

  const playAudioQueue = useCallback(async () => {
    if (isPlayingAudio.current || audioQueue.current.length === 0 || !audioContextRef.current) {
        return;
    }
    
    if (audioContextRef.current.state === 'suspended') {
       try { await audioContextRef.current.resume(); } catch (e) { console.warn("Context resume failed in loop", e); }
    }

    isPlayingAudio.current = true;
    const audioData = audioQueue.current.shift();
    
    if (audioData) {
        try {
            const now = audioContextRef.current.currentTime;
            const startTime = Math.max(now, nextAudioStartTime.current);

            const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.start(startTime);
            nextAudioStartTime.current = startTime + audioBuffer.duration;
            audioPlayerRefs.current.add(source);
            
            source.onended = () => {
                audioPlayerRefs.current.delete(source);
                isPlayingAudio.current = false;
                playAudioQueue();
            };

        } catch (e) {
            console.error("Error playing audio from queue", e);
            isPlayingAudio.current = false;
            playAudioQueue();
        }
    } else {
        isPlayingAudio.current = false;
        if (audioPlayerRefs.current.size === 0) {
            nextAudioStartTime.current = 0;
        }
    }
  }, []);

  const addAudioToQueue = useCallback((base64Audio: string) => {
      audioQueue.current.push(base64Audio);
      playAudioQueue();
  }, [playAudioQueue]);

  const processStream = useCallback(async (stream: AsyncGenerator<any>, currentMessageHistory: Message[]) => {
    const aiMessageId = Date.now().toString() + '-ai';
    let updatedMessageHistory: Message[] = [...currentMessageHistory, { id: aiMessageId, text: '', sender: 'ai' }];
    setMessages(updatedMessageHistory);
    
    let sentenceBuffer = '';
    let fullResponseText = '';

    for await (const chunk of stream) {
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        if (!fullResponseText.trim()) {
          updatedMessageHistory = updatedMessageHistory.filter(m => m.id !== aiMessageId);
          setMessages(updatedMessageHistory);
        }

        const fc = chunk.functionCalls[0];
        const toolMessageText = `Calling tool: ${fc.name} with arguments: ${JSON.stringify(fc.args)}`;
        const aiToolMessage: Message = { id: Date.now().toString() + '-tool', text: toolMessageText, sender: 'ai' };
        
        const historyForTool = [...updatedMessageHistory, aiToolMessage];
        setMessages(historyForTool);
        setIsLoading(true);

        const toolStream = await runTool(JSON.stringify(fc), historyForTool);
        await processStream(toolStream, historyForTool);
        return;
      }

      const chunkText = chunk.text;
      if (chunkText) {
          fullResponseText += chunkText;
          sentenceBuffer += chunkText;
          
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponseText } : m));
          updatedMessageHistory = updatedMessageHistory.map(m => m.id === aiMessageId ? { ...m, text: fullResponseText } : m);

          const sentenceEndRegex = /[.?!]/;
          let match;
          while ((match = sentenceBuffer.match(sentenceEndRegex))) {
              const sentenceEndIndex = match.index! + 1;
              const sentence = sentenceBuffer.substring(0, sentenceEndIndex).trim();
              sentenceBuffer = sentenceBuffer.substring(sentenceEndIndex);

              if (sentence) {
                  generateSpeech(sentence, FIXED_VOICE).then(audioData => {
                      if (audioData) addAudioToQueue(audioData);
                  }).catch(e => console.error("Speech gen error", e));
              }
          }
      }
    }
    
    if (sentenceBuffer.trim()) {
        generateSpeech(sentenceBuffer.trim(), FIXED_VOICE).then(audioData => {
            if (audioData) addAudioToQueue(audioData);
        }).catch(e => console.error("Speech gen error", e));
    }
  }, [addAudioToQueue]);
  
  const captureFrame = useCallback(async (): Promise<string | undefined> => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            if (!blob) {
              resolve(undefined);
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = (reader.result as string).split(',')[1];
              resolve(base64data);
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg');
        });
      }
    }
    return undefined;
  }, [videoRef, canvasRef]);

  const handleSendMessage = useCallback(async (text: string) => {
    await ensureAudioContextResumed();

    if (text.trim().toLowerCase() === '/mood') {
        setInput('');
        setIsQuickCheckInFlow(true);
        setIsAwaitingMoodLog(true);
        return;
    }
    
    if (isListening) {
      toggleListening();
    }
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const videoFrame = isCameraOn ? await captureFrame() : undefined;
      const stream = await analyzeTextAndImage(text, videoFrame, updatedMessages);
      setIsLoading(false);
      await processStream(stream, updatedMessages);
    } catch (error) {
      console.error("Error processing message:", error);
      let errorText = "Sorry, I encountered an error. Please try again.";
      if (error instanceof Error && error.message === "API_KEY_MISSING") {
          errorText = "AI features are disabled. The Google AI API key is not configured in your environment. For this application to work, the API_KEY environment variable must be set.";
      }
      const errorMessage: Message = { id: Date.now().toString() + '-err', text: errorText, sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  }, [messages, isLoading, isCameraOn, captureFrame, isListening, toggleListening, processStream]);

  useEffect(() => {
    const initializeSession = async () => {
        try {
            const stream = await performProactiveCheck(isCalendarConnected);
            setIsLoading(false);
            
            let sentenceBuffer = '';
            let fullResponseText = '';
            const aiMessageId = '1';
            setMessages([{ id: aiMessageId, text: '', sender: 'ai' as const }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    sentenceBuffer += chunkText;
                    setMessages([{ id: aiMessageId, text: fullResponseText, sender: 'ai' as const }]);
                    
                    const sentenceEndRegex = /[.?!]/;
                    let match;
                    while ((match = sentenceBuffer.match(sentenceEndRegex))) {
                        const sentenceEndIndex = match.index! + 1;
                        const sentence = sentenceBuffer.substring(0, sentenceEndIndex).trim();
                        sentenceBuffer = sentenceBuffer.substring(sentenceEndIndex);

                        if (sentence) {
                             generateSpeech(sentence, FIXED_VOICE).then(audioData => {
                                if (audioData) addAudioToQueue(audioData);
                             }).catch(e => console.error("Speech gen error", e));
                        }
                    }
                }
            }
             if (sentenceBuffer.trim()) {
                 generateSpeech(sentenceBuffer.trim(), FIXED_VOICE).then(audioData => {
                    if (audioData) addAudioToQueue(audioData);
                 }).catch(e => console.error("Speech gen error", e));
            }
        } catch (error) {
            console.error("Error during proactive check-in:", error);
            let errorText = "Hello! I couldn't check your schedule, but I'm here for you. How are you feeling today?";
            if (error instanceof Error && error.message === "API_KEY_MISSING") {
                errorText = "AI features are disabled. The Google AI API key is not configured in your environment. For this application to work, the API_KEY environment variable must be set.";
            }
            setMessages([{ id: '1', text: errorText, sender: 'ai' as const }]);
            setIsLoading(false);
        }
    };
    
    // Only run if messages list is empty (first load)
    if (messages.length === 1 && messages[0].text === "Checking in on your day...") {
        initializeSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarConnected, addAudioToQueue]);

  
  const handleEndSession = () => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setMotivationalQuote(randomQuote);
    setIsEndSessionConfirmationOpen(true);
  };

  const handleConfirmEndSession = () => {
    setIsEndSessionConfirmationOpen(false);
    setIsAwaitingMoodLog(true);
  };

  const handleCancelEndSession = () => {
    setIsEndSessionConfirmationOpen(false);
  };

  const handleMoodSelected = async (mood: Mood) => {
    setIsAwaitingMoodLog(false);

    if (isQuickCheckInFlow) {
        const newEntry: DiaryEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            summary: `Quick mood check-in. Mood: ${MOOD_CONFIG[mood].label}.`,
            conversation: [],
            mood: mood,
        };
        onSessionComplete(newEntry);
        setMessages([
            { id: '1', text: "Got it! Your mood is logged. Great job checking in with yourself! You've earned 10 points.", sender: 'ai' as const },
        ]);
        setIsQuickCheckInFlow(false);
    } else {
        setIsLoading(true);
        try {
            const summary = await summarizeConversation(messages, mood);
            const newEntry: DiaryEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                summary: summary,
                conversation: messages,
                mood: mood,
            };
            onSessionComplete(newEntry);
            setMessages([
                { id: '1', text: "Session and mood saved! You've earned 10 points. Ready for a new conversation when you are.", sender: 'ai' as const },
            ]);
        } catch (error) {
            console.error("Error summarizing session: ", error);
            let errorText = "Could not save session summary.";
            if (error instanceof Error && error.message === "API_KEY_MISSING") {
              errorText = "Could not save session summary. The API key is missing."
            }
            setMessages(prev => [...prev, { id: Date.now().toString(), text: errorText, sender: 'ai' as const }]);
        } finally {
            setIsLoading(false);
        }
    }
  }

  const handleGetPrompt = () => {
    const categories = Object.keys(JOURNAL_PROMPTS);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const prompts = JOURNAL_PROMPTS[randomCategory];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setInput(randomPrompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
      <Diary 
        entries={diaryEntries} 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        gamification={gamification}
        isCalendarConnected={isCalendarConnected}
        onConnectCalendar={onConnectCalendar}
        stressHotspots={stressHotspots}
        calendarEvents={calendarEvents}
        onAddHotspot={onAddHotspot}
        onDeleteHotspot={onDeleteHotspot}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative transition-all duration-300">
        {!isSidebarOpen && (
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
           >
             <Icon name="menu" className="w-6 h-6 text-gray-600 dark:text-gray-300" />
           </button>
        )}

        {/* Header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center space-x-3 ml-12 md:ml-0">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Icon name="brain" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
             <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">EIGHT</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wellbeing Companion</p>
             </div>
          </div>

          <div className="flex items-center space-x-4">
             {/* 8-Minute Session Timer */}
             <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isTimerActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-sm font-mono font-medium ${sessionTimeRemaining < 60 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                   {formatTime(sessionTimeRemaining)}
                </span>
             </div>

             <button
              onClick={handleEndSession}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              End Session
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start animate-fade-in-up">
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm">
                 <LoadingSpinner />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
           <div className="max-w-4xl mx-auto flex items-end space-x-2">
             <button
                onClick={handleGetPrompt}
                className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                title="Get a journal prompt"
             >
                <Icon name="lightbulb" className="w-6 h-6" />
             </button>

             <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(input);
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white resize-none max-h-32"
                  rows={1}
                />
             </div>
             
             <button
               onClick={() => handleSendMessage(input)}
               disabled={!input.trim() || isLoading}
               className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95 flex-shrink-0"
             >
               <Icon name="send" className="w-5 h-5" />
             </button>
           </div>
           <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
             AI can make mistakes. Consider checking important information.
           </p>
        </div>
      </main>

      {/* Modals */}
      {isAwaitingMoodLog && (
        <MoodLogModal onMoodSelect={handleMoodSelected} onCancel={() => setIsAwaitingMoodLog(false)} />
      )}
      
      {isEndSessionConfirmationOpen && (
        <ConfirmationModal 
          title="End Session"
          message="Are you sure you want to end this session? You'll be asked to log your mood."
          confirmText="Yes, End Session"
          onConfirm={handleConfirmEndSession}
          onCancel={handleCancelEndSession}
          quote={motivationalQuote}
        />
      )}

      {/* Hidden Video Element for Camera (Logic retained but UI hidden as per previous request, keeps hook valid) */}
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
