
import React, { useState, useRef, useEffect } from 'react';
import { CORRECT_PIN } from '../constants';
import { Icon } from './Icon';

interface PinScreenProps {
  onLoginSuccess: () => void;
}

const PinScreen: React.FC<PinScreenProps> = ({ onLoginSuccess }) => {
  const [pin, setPin] = useState<string[]>(Array(4).fill(''));
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin === CORRECT_PIN) {
      onLoginSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin(Array(4).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Icon name="shield" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Private Diary Access</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your privacy is our priority. Enter your PIN to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                // FIX: The ref callback should not return a value. Changed implicit return to a block body.
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-3xl font-semibold bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 font-semibold transition duration-300 disabled:bg-gray-400"
            disabled={pin.join('').length !== 4}
          >
            Unlock Diary
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinScreen;