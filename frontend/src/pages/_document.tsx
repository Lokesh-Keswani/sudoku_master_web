import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Meta tags for SEO */}
        <meta name="description" content="Master Sudoku with AI-powered training, interactive techniques, and comprehensive analytics. Perfect for beginners and experts alike." />
        <meta name="keywords" content="sudoku, puzzle, brain training, logic, techniques, AI coach, practice, analytics" />
        <meta name="author" content="Sudoku Master" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Sudoku Master - AI-Powered Training Platform" />
        <meta property="og:description" content="Master Sudoku with AI-powered training, interactive techniques, and comprehensive analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL || 'https://sudoku-master.vercel.app'} />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sudoku Master - AI-Powered Training Platform" />
        <meta name="twitter:description" content="Master Sudoku with AI-powered training, interactive techniques, and comprehensive analytics." />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#3B82F6" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 