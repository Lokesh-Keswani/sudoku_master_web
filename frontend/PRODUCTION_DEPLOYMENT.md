# 🚀 Production Deployment Guide

This guide will help you deploy the Sudoku Master Web App to production on Vercel with full optimization and security.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Vercel CLI](https://vercel.com/cli) (optional)
- Firebase project with Authentication and Firestore enabled
- MongoDB Atlas cluster

## 🔧 Environment Setup

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password and Google)
4. Enable Firestore Database
5. Go to Project Settings > General
6. Copy the Firebase configuration values

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to the IP Access List

### 3. Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB Configuration
NEXT_PUBLIC_MONGODB_URI=your_mongodb_atlas_uri
ENABLE_MONGO=true
ENABLE_FIRESTORE=true
MONGO_URI=your_mongodb_atlas_uri

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CONFIG_JSON=your_service_account_json
```

## 🏗️ Local Build Testing

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Vercel Deployment

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

### Option 3: Using Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment script
./scripts/deploy.sh
```

## ⚙️ Vercel Configuration

### Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add all environment variables from your `.env.local` file
4. Set them for Production, Preview, and Development environments

### Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` in environment variables

## 🔒 Security Configuration

### Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public leaderboard data
    match /leaderboard/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### MongoDB Atlas Security

1. Enable Network Access for Vercel IP ranges
2. Use Database User with minimal required permissions
3. Enable MongoDB Atlas App Services for additional security

## 📊 Performance Optimization

### Bundle Analysis

After deployment, analyze your bundle:

```bash
npm run build
npx @next/bundle-analyzer .next/static/chunks
```

### Performance Monitoring

1. Set up [Vercel Analytics](https://vercel.com/analytics)
2. Configure [Core Web Vitals](https://web.dev/vitals/) monitoring
3. Set up error tracking with [Sentry](https://sentry.io/)

## 🧪 Post-Deployment Testing

### Essential Tests

1. **Authentication**
   - User registration
   - User login (email/password)
   - Google OAuth
   - Password reset

2. **Core Features**
   - Sudoku game functionality
   - Training modules
   - AI coach
   - Solution reports

3. **Database Operations**
   - User stats saving
   - Puzzle completion tracking
   - Leaderboard functionality

4. **Performance**
   - Page load times
   - API response times
   - Mobile responsiveness

### Monitoring Checklist

- [ ] All pages load without errors
- [ ] Authentication works correctly
- [ ] Database connections are stable
- [ ] API endpoints respond properly
- [ ] Images and assets load correctly
- [ ] Mobile experience is smooth
- [ ] SEO meta tags are present
- [ ] Security headers are set

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript compilation
   - Check for missing dependencies

2. **Runtime Errors**
   - Check browser console
   - Verify Firebase configuration
   - Check MongoDB connection

3. **Performance Issues**
   - Analyze bundle size
   - Check image optimization
   - Monitor API response times

### Debug Commands

```bash
# Check environment variables
npm run db:test

# Test database connections
npm run db:ping

# Analyze bundle
npm run build && npx @next/bundle-analyzer

# Check for TypeScript errors
npx tsc --noEmit
```

## 📈 Analytics and Monitoring

### Recommended Tools

1. **Vercel Analytics** - Built-in performance monitoring
2. **Google Analytics** - User behavior tracking
3. **Sentry** - Error tracking and monitoring
4. **MongoDB Atlas** - Database performance monitoring

### Setup Instructions

1. **Vercel Analytics**:
   ```bash
   npm install @vercel/analytics
   ```

2. **Google Analytics**:
   - Create GA4 property
   - Add tracking code to `_document.tsx`

3. **Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Check Firebase and MongoDB documentation
4. Review application logs in Vercel Dashboard

## 🎉 Success!

Your Sudoku Master Web App is now deployed and ready for production use!

Remember to:
- Monitor performance regularly
- Keep dependencies updated
- Backup your database regularly
- Test new features before deployment 