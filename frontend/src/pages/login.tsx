import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { AuthForm } from '../components/AuthForm';
import { GuestModeButton } from '../components/GuestModeButton';
import { useAuth } from '../hooks/useAuth';
import { useThemeStore } from '../store/themeStore';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user, loading, error, signIn, signUp, signInWithGoogle, clearError } = useAuth();
  const router = useRouter();
  const { theme } = useThemeStore();

  // Set mode from URL parameter
  useEffect(() => {
    const urlMode = router.query.mode as string;
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [router.query.mode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const redirectTo = router.query.redirect as string || '/dashboard';
      router.push(redirectTo);
    }
  }, [user, loading, router]);

  const handleSubmit = async (email: string, password: string) => {
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleModeToggle = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
  };

  const handleGuestStart = () => {
    router.push('/dashboard');
  };

  // Show loading if checking authentication
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign In' : 'Sign Up'} - Sudoku Master</title>
        <meta name="description" content="Sign in to your Sudoku Master account" />
      </Head>

      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">9</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Sudoku Master
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Master the art of Sudoku
            </p>
          </motion.div>

          {/* Auth Form */}
          <AuthForm
            mode={mode}
            onSubmit={handleSubmit}
            onGoogleSignIn={handleGoogleSignIn}
            onModeToggle={handleModeToggle}
            loading={loading}
            error={error}
            onErrorClear={clearError}
          />

          {/* Guest Mode Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <GuestModeButton onGuestStart={handleGuestStart} />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage; 