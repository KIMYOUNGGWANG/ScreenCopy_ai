# Fix: Localhost Redirecting to Production

If your local development (`localhost:3000`) redirects to your deployed site after login, it's because Supabase's security settings are blocking the `localhost` redirect URL.

## 🚀 The Solution

You need to tell Supabase that `localhost` is a safe URL to redirect to.

### Step 1: Go to Supabase Dashboard
1. Open your project at [app.supabase.com](https://app.supabase.com)
2. Go to **Authentication** (left sidebar)
3. Click on **URL Configuration**

### Step 2: Add Redirect URLs
You will see a **Site URL** field (likely set to your production URL).
Below that, find **Redirect URLs**.

1. Click **"Add URL"**
2. Add: `http://localhost:3000/**`
3. Click **"Save"**

> **Why?** When you log in, your code asks Supabase to redirect back to `http://localhost:3000/auth/callback`. If this URL isn't in the allowlist, Supabase ignores it and defaults to your production Site URL for security.

### Step 3: Verify Code (Already Correct)
Your code is already set up correctly to handle this dynamically:

- **Login Page**: Uses `location.origin` (which is `localhost:3000` on your machine).
  ```typescript
  redirectTo: `${location.origin}/auth/callback`
  ```
- **Callback Route**: Uses `requestUrl.origin`.
  ```typescript
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
  ```

### Step 4: Restart Server
Restart your local server just to be safe:
```bash
npm run dev
```

---

## 💡 Best Practice: Separate Projects (Optional)

For a professional setup, create two separate Supabase projects:

1.  **ScreenCopy - Dev**:
    *   Site URL: `http://localhost:3000`
    *   Use these credentials in `.env.local`

2.  **ScreenCopy - Prod**:
    *   Site URL: `https://your-domain.com`
    *   Use these credentials in Vercel Environment Variables

This prevents test data from mixing with real user data.
