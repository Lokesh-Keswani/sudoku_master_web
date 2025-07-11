import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Play, AlertCircle } from 'lucide-react';
import { createGuestUser } from '../utils/guestUser';
import { useAuthStore } from '../store/authStore';

interface GuestModeButtonProps {
  onGuestStart: () => void;
  className?: string;
}

export const GuestModeButton: React.FC<GuestModeButtonProps> = ({ 
  onGuestStart, 
  className = '' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { setUser } = useAuthStore();

  const handleGuestStart = async () => {
    if (!guestName.trim()) {
      setGuestName(`Guest_${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    }
    
    setIsCreating(true);
    
    try {
      const guestUser = createGuestUser(guestName.trim() || undefined);
      
      // Set guest user in auth store
      setUser({
        uid: guestUser.id,
        email: '',
        displayName: guestUser.name,
        photoURL: undefined,
      });
      
      // Close modal and start guest mode
      setShowModal(false);
      setGuestName('');
      onGuestStart();
    } catch (error) {
      console.error('Error creating guest user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${className}`}
      >
        <User className="w-5 h-5" />
        <span>Play as Guest</span>
      </motion.button>

      {/* Guest Mode Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Play as Guest
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Start playing immediately without creating an account. Your progress will be saved locally.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guest Name (Optional)
              </label>
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter a name or leave blank"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                maxLength={20}
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Guest Mode Limitations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Progress saved only on this device</li>
                    <li>No cloud synchronization</li>
                    <li>Limited access to advanced features</li>
                    <li>Data may be lost if you clear browser data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleGuestStart}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Playing
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}; 