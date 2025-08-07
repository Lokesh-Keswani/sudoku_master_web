import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const SignupPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page with signup mode
    router.replace('/login?mode=signup');
  }, [router]);

  return (
    <>
      <Head>
        <title>Sign Up - Sudoku Master</title>
        <meta name="description" content="Create your Sudoku Master account" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to signup...</p>
        </div>
      </div>
    </>
  );
};

export default SignupPage; 