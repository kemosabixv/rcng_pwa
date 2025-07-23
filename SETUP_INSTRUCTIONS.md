# AdminDashboard Setup Instructions

## Current Status
The AdminDashboard has been configured to show mock data when the server is not available. The HTTP 500 errors have been resolved by implementing proper error handling and fallback data.

## To Enable Full Functionality

### 1. Deploy the Supabase Edge Function
The server code is located in `supabase/functions/server/index.tsx`. To deploy it:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the edge function
supabase functions deploy make-server-b2be43be
```

### 2. Create the KV Store Table
The application uses a KV store table. Create it in your Supabase database:

```sql
CREATE TABLE kv_store_b2be43be (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### 3. Set Environment Variables for the Edge Function
In your Supabase project dashboard, set these environment variables for the edge function:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in API settings)

### 4. Create an Admin User
The first user to sign up will automatically be granted admin privileges. To create an admin user:

1. Go to the membership page in your application
2. Create an account - this will be automatically assigned admin role
3. Sign in and access the admin dashboard

## Current Mock Data Features
Until the server is fully set up, the dashboard displays mock data including:

- Sample members (John Doe as admin, Jane Smith as member)
- Finance and Events committees
- Community Garden and Youth Program projects
- Membership dues and documents
- Basic analytics data

## Troubleshooting

### If you see "Authentication service not configured" error:
- Verify your `.env` file contains valid Supabase credentials
- Ensure `NEXT_PUBLIC_SUPABASE_PROJECT_ID` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### If the server returns 500 errors:
- Check the Supabase Edge Function logs
- Verify the KV store table exists
- Ensure environment variables are set correctly in Supabase

### If you can't access admin features:
- Ensure your user has admin role in the KV store
- Check the browser console for authentication errors
- Try signing out and signing back in

## Files Modified
- `components/AdminDashboard.tsx`: Added error handling and mock data fallbacks
- `supabase/functions/server/index.tsx`: Improved error handling and admin user creation
- Created this setup guide

The dashboard should now work in development mode without errors, displaying helpful mock data while you set up the backend infrastructure.
