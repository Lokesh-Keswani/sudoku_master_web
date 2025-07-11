# Authentication System Documentation

## Overview

This document provides comprehensive guidance for the authentication system implemented in the Sudoku Master webapp. The system uses **Firebase Authentication** for user management and **MongoDB** for storing user data, with seamless integration across all components.

## Architecture

### Authentication Flow
1. **User Registration/Login**: Firebase Authentication handles email/password and Google OAuth
2. **User Data Sync**: MongoDB stores user profiles, stats, and training progress
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Auto-login**: Persistent sessions with Firebase token refresh

### Technology Stack
- **Frontend**: Next.js + React + TypeScript + TailwindCSS
- **Authentication**: Firebase Authentication (Email/Password + Google OAuth)
- **State Management**: Zustand with persistence
- **Database**: MongoDB for user data, Firestore for real-time features
- **UI Components**: Framer Motion for animations, Lucide React for icons

## Setup Instructions

### 1. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (configure OAuth consent screen)
4. Get configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Add web app if not exists
   - Copy configuration object

#### Configure Authentication Methods
```javascript
// In Firebase Console > Authentication > Sign-in method
// Enable Email/Password
// Enable Google (with proper OAuth configuration)
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Database Configuration
ENABLE_MONGO=true
ENABLE_FIRESTORE=true

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sudoku_master

# Firestore Configuration (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CONFIG_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJva...
```

### 3. Install Dependencies

```bash
npm install firebase
```

## File Structure

```
frontend/src/
├── utils/
│   ├── firebase.ts              # Firebase client configuration
│   └── mongoClient.ts           # MongoDB client for user data
├── hooks/
│   └── useAuth.ts               # Authentication hook
├── store/
│   └── authStore.ts             # Zustand auth state
├── components/
│   ├── AuthForm.tsx             # Reusable auth form
│   └── ProtectedRoute.tsx       # Route protection component
└── pages/
    ├── login.tsx                # Login/signup page
    ├── signup.tsx               # Signup redirect
    └── dashboard.tsx            # User dashboard
```

## Core Components

### 1. Firebase Configuration (`/utils/firebase.ts`)

Handles all Firebase Authentication operations:

```typescript
// Key functions
export const signUpWithEmail = async (email: string, password: string): Promise<User>
export const signInWithEmail = async (email: string, password: string): Promise<User>
export const signInWithGoogle = async (): Promise<User>
export const signOutUser = async (): Promise<void>
export const resetPassword = async (email: string): Promise<void>
export const onAuthStateChange = (callback: (user: User | null) => void)
```

### 2. Authentication Hook (`/hooks/useAuth.ts`)

Provides authentication state and actions:

```typescript
const { 
  user,           // Current Firebase user
  loading,        // Loading state
  error,          // Error messages
  signUp,         // Email signup
  signIn,         // Email signin
  signInWithGoogle, // Google signin
  signOut,        // Sign out
  resetPassword,  // Password reset
  clearError      // Clear error state
} = useAuth();
```

### 3. Auth Store (`/store/authStore.ts`)

Zustand store for authentication state:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}
```

### 4. Protected Route Component (`/components/ProtectedRoute.tsx`)

Protects routes from unauthenticated access:

```typescript
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>

// Or use HOC
const ProtectedComponent = withAuth(YourComponent);
```

### 5. Auth Form Component (`/components/AuthForm.tsx`)

Reusable authentication form with:
- Email/password validation
- Password visibility toggle
- Google sign-in button
- Error handling
- Loading states
- Responsive design

## Usage Examples

### 1. Protecting a Page

```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

const MyPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
};
```

### 2. Using Authentication in Components

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // User will be redirected to login
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};
```

### 3. Accessing User Data

```typescript
import { useAuthStore } from '../store/authStore';

const MyComponent: React.FC = () => {
  const { user } = useAuthStore();
  
  return (
    <div>
      <p>User ID: {user?.uid}</p>
      <p>Email: {user?.email}</p>
      <p>Display Name: {user?.displayName}</p>
    </div>
  );
};
```

## User Data Management

### MongoDB Collections

The system creates and manages the following collections:

1. **user_profiles**: User profile information
2. **user_stats**: Game statistics and progress
3. **user_training**: Training module progress
4. **user_reports**: Solution reports and analysis

### Automatic Data Creation

When a user signs up:
1. Firebase creates the authentication record
2. MongoDB creates user profile with default preferences
3. Initial stats are created with zero values
4. User is redirected to dashboard

### Data Synchronization

- **Real-time**: Firebase handles authentication state
- **Persistent**: MongoDB stores user data
- **Cross-device**: Data syncs across all user sessions

## Security Features

### 1. Route Protection
- All game and training routes require authentication
- Automatic redirect to login for unauthenticated users
- Redirect back to intended page after login

### 2. Data Isolation
- User data is isolated by Firebase UID
- MongoDB queries filter by user ID
- No cross-user data access

### 3. Input Validation
- Email format validation
- Password strength requirements
- Real-time form validation
- Error handling for all auth operations

### 4. Session Management
- Automatic token refresh
- Persistent login state
- Secure logout with cleanup

## UI/UX Features

### 1. Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions

### 2. Loading States
- Spinner animations during auth operations
- Skeleton loading for protected routes
- Progress indicators for long operations

### 3. Error Handling
- User-friendly error messages
- Real-time validation feedback
- Graceful error recovery

### 4. Animations
- Smooth page transitions
- Form animations with Framer Motion
- Loading and success animations

## Integration with Existing Components

### 1. Sudoku Game
- Protected by authentication
- User stats automatically updated
- Progress saved to user account

### 2. Training Modules
- All training routes protected
- Progress tracked per user
- Personalized recommendations

### 3. Solution Reports
- Reports linked to user account
- Historical data accessible
- Cross-device synchronization

## Testing

### 1. Authentication Flow
```typescript
// Test signup flow
const { signUp } = useAuth();
await signUp('test@example.com', 'password123');

// Test login flow
const { signIn } = useAuth();
await signIn('test@example.com', 'password123');

// Test Google signin
const { signInWithGoogle } = useAuth();
await signInWithGoogle();
```

### 2. Protected Routes
```typescript
// Test route protection
<ProtectedRoute>
  <TestComponent />
</ProtectedRoute>
```

### 3. User Data
```typescript
// Test MongoDB operations
await mongoClient.createUserProfile(userData);
const profile = await mongoClient.getUserProfile(uid);
```

## Deployment Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different Firebase projects for dev/staging/prod
- Secure MongoDB connection strings

### 2. Firebase Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. MongoDB Security
- Use connection strings with authentication
- Enable network access controls
- Implement proper user roles

## Troubleshooting

### Common Issues

#### 1. Firebase Configuration Errors
```bash
# Check environment variables
echo $NEXT_PUBLIC_FIREBASE_API_KEY

# Verify Firebase project settings
# Ensure Authentication is enabled
```

#### 2. MongoDB Connection Issues
```bash
# Test MongoDB connection
npm run db:ping

# Check environment variables
echo $MONGO_URI
```

#### 3. Authentication State Issues
```typescript
// Debug auth state
const { user, loading, error } = useAuth();
console.log('Auth state:', { user, loading, error });
```

#### 4. Protected Route Issues
```typescript
// Check if user is authenticated
const { isAuthenticated } = useAuthStore();
console.log('Is authenticated:', isAuthenticated);
```

### Debug Commands
```bash
# Test Firebase connection
npm run dev
# Check browser console for Firebase errors

# Test MongoDB connection
npm run db:test

# Check authentication flow
# Open browser dev tools and monitor network requests
```

## Future Enhancements

### 1. Additional Auth Methods
- Apple Sign-In
- Facebook Authentication
- Phone number authentication

### 2. Advanced Features
- Email verification
- Two-factor authentication
- Account deletion
- Data export

### 3. Performance Optimizations
- Lazy loading of auth components
- Caching strategies
- Offline support

### 4. Analytics Integration
- User behavior tracking
- Performance metrics
- Error monitoring

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Check MongoDB connection status
4. Verify environment configuration

## Contributing

When adding new authentication features:
1. Follow the existing patterns
2. Add proper error handling
3. Include loading states
4. Update this documentation
5. Add tests for new functionality 