
import React, { useState } from 'react';
import { Icon } from './Icon';
import type { AssessmentAnswer, OnboardingResult } from '../types';

interface OnboardingAssessmentProps {
  onComplete: (result: OnboardingResult) => void;
}

const QUESTIONS = [
  { id: 1, text: "I often feel overwhelmed by my daily tasks." },
  { id: 2, text: "I find it easy to identify exactly what I'm feeling." },
  { id: 3, text: "I have healthy ways to cope when I get stressed." },
  { id: 4, text: "I feel comfortable asking for help when I need it." },
  { id: 5, text: "I dwell on past mistakes frequently." },
  { id: 6, text: "I prioritize my sleep and physical health." },
  { id: 7, text: "I feel connected to the people around me." },
  { id: 8, text: "I am optimistic about my future." },
];

const OnboardingAssessment: React.FC<OnboardingAssessmentProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, { questionId: QUESTIONS[currentQuestionIndex].id, score }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsExiting(true);
      setTimeout(() => {
        onComplete({
          completed: true,
          scores: newAnswers,
          timestamp: new Date().toISOString()
        });
      }, 500);
    }
  };

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  if (isExiting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center animate-pulse">
           <Icon name="brain" className="w-16 h-16 text-blue-600 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Personalizing EIGHT for you...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emotional Check-in</h2>
             <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
               {currentQuestionIndex + 1} / {QUESTIONS.length}
             </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-8 flex flex-col justify-center animate-fade-in-up">
           <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-8 text-center leading-relaxed">
             {QUESTIONS[currentQuestionIndex].text}
           </h3>

           <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 px-2 mb-2 uppercase tracking-wider font-semibold">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
              </div>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`
                      w-full aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200
                      ${score === 1 ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' : ''}
                      ${score === 2 ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40' : ''}
                      ${score === 3 ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40' : ''}
                      ${score === 4 ? 'bg-lime-50 text-lime-600 hover:bg-lime-100 dark:bg-lime-900/20 dark:hover:bg-lime-900/40' : ''}
                      ${score === 5 ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40' : ''}
                      hover:scale-105 active:scale-95 shadow-sm border border-transparent hover:border-current
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500">
           Be honest. There are no wrong answers.
        </div>
      </div>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingAssessment;
