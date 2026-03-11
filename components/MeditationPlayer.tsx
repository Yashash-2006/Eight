import React, { useEffect, useRef, useState } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';

interface MeditationPlayerProps {
  base64Audio: string;
  onFinish: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ base64Audio, onFinish }) => {
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
        console.error("Error playing meditation audio:", error);
        onFinish(); // Exit if there's an error
      }
    };

    setupAndPlayAudio();

    return () => {
      isCancelled = true;
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null; // Prevent onFinish from being called on manual stop
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [base64Audio, onFinish]);

  return (
    <div className="fixed inset-0 bg-purple-900 bg-gradient-to-br from-purple-800 to-indigo-900 flex flex-col items-center justify-center z-50 text-white p-8">
      {/* Animated background circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="w-[500px] h-[500px] bg-indigo-500/20 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation-delay:-2s]"></div>
        <div className="w-[700px] h-[700px] bg-purple-500/10 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation-delay:-4s]"></div>
      </div>
      
      <div className="z-10 flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <>
            <LoadingSpinner />
            <p className="mt-4 text-lg">Preparing your meditation...</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">Be Present</h1>
            <p className="text-lg text-purple-200 mb-12">Close your eyes, relax, and follow the voice.</p>
            {/* FIX: Corrected broken className from pasted error message and completed the button element. */}
            <button
              onClick={onFinish}
              className="px-8 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-full font-semibold transition-colors"
            >
              End Meditation
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// FIX: Added default export to resolve module import error.
export default MeditationPlayer;
