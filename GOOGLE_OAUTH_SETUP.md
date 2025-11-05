# Google OAuth Setup Guide

## Problem: Error 400: redirect_uri_mismatch

This error means the redirect URI configured in Google Cloud Console doesn't match the one your app is using.

## Solution

### Step 1: Get your application URL

Identify your deployed application URL. For example:
- Vercel: `https://your-app.vercel.app`
- Custom domain: `https://mapscraperhub.com`
- Local dev: `http://localhost:3000`

### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one)

### Step 3: Add Authorized Redirect URIs

Add these **exact** URIs to "Authorized redirect URIs":

#### For Production (Vercel)
```
https://your-actual-domain.vercel.app/api/auth/callback/google
```

#### For Custom Domain
```
https://mapscraperhub.com/api/auth/callback/google
```

#### For Local Development
```
http://localhost:3000/api/auth/callback/google
```

**Important**:
- Use `https://` for production (not `http://`)
- Use `http://` for localhost only
- The path must be exactly `/api/auth/callback/google`
- No trailing slash

### Step 4: Update Environment Variables

Make sure your environment variables match:

```env
NEXTAUTH_URL=https://your-actual-domain.vercel.app
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**For Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Update `NEXTAUTH_URL` to match your deployment URL
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Step 5: Redeploy

After changing environment variables, you must redeploy:

```bash
vercel --prod
```

Or push to your main branch to trigger auto-deployment.

## Testing

1. Go to your app: `https://your-domain.com/auth/signin`
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After login, you should be redirected back to your app

## Common Mistakes

### ❌ Wrong: Using HTTP in production
```
http://your-app.vercel.app/api/auth/callback/google
```

### ✅ Correct: Using HTTPS in production
```
https://your-app.vercel.app/api/auth/callback/google
```

### ❌ Wrong: Trailing slash
```
https://your-app.vercel.app/api/auth/callback/google/
```

### ✅ Correct: No trailing slash
```
https://your-app.vercel.app/api/auth/callback/google
```

### ❌ Wrong: Wrong path
```
https://your-app.vercel.app/auth/callback/google
```

### ✅ Correct: Exact path
```
https://your-app.vercel.app/api/auth/callback/google
```

## Multiple Environments

If you want to support both local development and production:

1. Add **both** URIs to Google Cloud Console:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`

2. Use different environment variables for each:
   - Local: `.env.local` with `NEXTAUTH_URL=http://localhost:3000`
   - Vercel: Environment variables with `NEXTAUTH_URL=https://your-app.vercel.app`

## Troubleshooting

### Still getting redirect_uri_mismatch?

1. Check the error message for the **exact** URI it's trying to use
2. Make sure that **exact** URI is in Google Cloud Console
3. Wait a few minutes for Google changes to propagate
4. Clear your browser cache
5. Try in an incognito window

### OAuth consent screen not configured?

1. Go to **OAuth consent screen** in Google Cloud Console
2. Set User Type to "External"
3. Fill in required fields
4. Add test users if still in testing mode

### App not verified?

If you see a warning "This app isn't verified":
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for apps in development
- To verify your app for production, follow Google's verification process

## Alternative: Disable Google OAuth

If you want to disable Google OAuth temporarily:

1. Remove or comment out the GoogleProvider in `src/lib/auth.ts`
2. Remove Google environment variables
3. Users can still sign up with email/password

```typescript
// src/lib/auth.ts
providers: [
  // GoogleProvider({
  //   clientId: process.env.GOOGLE_CLIENT_ID || '',
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  // }),
  CredentialsProvider({
    // ... email/password auth
  }),
]
```

## Need More Help?

Check NextAuth.js documentation:
- [Google Provider](https://next-auth.js.org/providers/google)
- [Callback URLs](https://next-auth.js.org/configuration/options#callbackurl)
