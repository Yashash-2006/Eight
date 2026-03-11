import React, { useEffect, useRef, useState } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';

interface SleepStoryPlayerProps {
  base64Audio: string;
  onFinish: () => void;
}

const SleepStoryPlayer: React.FC<SleepStoryPlayerProps> = ({ base64Audio, onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const setupAndPlayAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
        
        if (isCancelled || !audioContextRef.current) return;

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          onFinish();
        };

        source.start();
        audioSourceRef.current = source;
        setIsLoading(false);
      } catch (error) {
        console.error("Error playing sleep story audio:", error);
        onFinish(); // Exit if there's an error
      }
    };

    setupAndPlayAudio();

    return () => {
      isCancelled = true;
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null; 
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [base64Audio, onFinish]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center z-50 text-white p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        {/* Simple starfield effect */}
        {[...Array(100)].map((_, i) => {
          const style = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          };
          return <div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={style}></div>;
        })}
      </div>
       <style>{`
        @keyframes twinkle {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
      `}</style>
      
      <div className="z-10 flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <>
            <LoadingSpinner />
            <p className="mt-4 text-lg">Preparing your story...</p>
          </>
        ) : (
          <>
            <Icon name="moon" className="w-24 h-24 text-indigo-300 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Time to Dream</h1>
            <p className="text-lg text-indigo-200 mb-12 max-w-md">Let the story carry you to a peaceful sleep. Breathe deeply and let go.</p>
            <button
              onClick={onFinish}
              className="px-8 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-full font-semibold transition-colors"
            >
              End Story
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SleepStoryPlayer;
