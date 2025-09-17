# OAuth Setup Guide for Clerk + Google/Facebook Authentication

## ✅ Current Implementation Status

Your app now has Google and Facebook authentication buttons integrated with Clerk! Here's what's been added:

### 🔧 Added Files/Features:

- **Login Screen**: Google & Facebook login buttons with proper OAuth flow
- **Signup Screen**: Google & Facebook signup buttons with proper OAuth flow
- **Dependencies**: Installed `expo-auth-session` and `expo-crypto` for OAuth support

### 📋 Configuration Required in Clerk Dashboard

To enable Google and Facebook authentication, you need to configure OAuth providers in your Clerk dashboard:

#### 1. **Google OAuth Setup**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add these redirect URIs:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   exp://your-local-ip:8083
   ```
6. Copy the Client ID and Client Secret
7. In Clerk Dashboard → OAuth providers → Add Google
8. Paste your Google Client ID and Secret

#### 2. **Facebook OAuth Setup**:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   exp://your-local-ip:8083
   ```
5. Copy App ID and App Secret
6. In Clerk Dashboard → OAuth providers → Add Facebook
7. Paste your Facebook App ID and Secret

#### 3. **Clerk Configuration**:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to "OAuth providers"
4. Enable Google and Facebook
5. Add the credentials from steps 1-2

### 🎯 How It Works:

#### **Login Flow**:

1. User taps "Continue with Google/Facebook"
2. OAuth flow opens in browser/webview
3. User authenticates with Google/Facebook
4. Clerk receives OAuth token
5. User is automatically signed in
6. App navigates to dashboard

#### **Signup Flow**:

1. User taps "Sign up with Google/Facebook"
2. OAuth flow opens in browser/webview
3. User authenticates with Google/Facebook
4. Clerk creates new user account
5. User is automatically signed in
6. App navigates to dashboard

### 🔄 Automatic Supabase Integration:

The existing `ClerkAuthContext` will automatically:

- Detect OAuth signup/login
- Create user profile in Supabase database
- Sync user data between Clerk and Supabase

### 🚀 Testing:

1. **Development**: Works with Expo Go app
2. **Production**: Requires proper redirect URLs in OAuth providers

### ⚠️ Important Notes:

1. **Development Keys**: Currently using Clerk development keys
2. **Production Setup**: Update OAuth redirect URLs for production
3. **Privacy Policy**: Required for Facebook OAuth
4. **Terms of Service**: Required for Google OAuth

### 🎨 UI Features Added:

- **Divider**: "or" separator between email/password and social login
- **Google Button**: Red button with email icon
- **Facebook Button**: Blue button with Facebook icon
- **Loading States**: Buttons disabled during OAuth flow
- **Error Handling**: Alerts for OAuth failures

Your social authentication is now ready! Just configure the OAuth providers in Clerk dashboard and test.
