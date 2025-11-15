# Supabase Database Setup Instructions

## Manual Database Setup

Since I cannot directly connect to your Supabase project, please follow these steps to set up your database:

### Step 1: Access Supabase Dashboard
1. Go to https://app.supabase.com
2. Sign in with your account
3. Select your project: `hbtdufnybrlvszimfcio`

### Step 2: Run the SQL Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `/Users/surajsatyarthi/Desktop/task-tracker/supabase/migrations/20241115_initial_schema.sql`
3. Click **Run** to execute the SQL

### Step 3: Verify the Setup
After running the migration, you should have:
- ✅ 5 projects created (Personal, CSuite, Health, Journaling, LinkedIn)
- ✅ All tables with proper relationships
- ✅ Indexes for performance
- ✅ RLS policies for security

### Step 4: Test the API
Once the database is set up, you can test the API endpoints:

```bash
# Get all projects
curl http://localhost:3000/api/projects

# Get all tasks
curl http://localhost:3000/api/tasks

# Get tasks for specific project
curl "http://localhost:3000/api/tasks?project=personal"
```

### Step 5: Environment Variables
Your `.env.local` file is already configured with:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
- `SUPABASE_PROJECT_ID`: Your project ID

### Step 6: Next Steps
After database setup, I'll help you:
1. Migrate your existing mock data to the database
2. Update the frontend to use real data
3. Add authentication
4. Implement real-time features

**Let me know once you've run the SQL migration in Supabase, and I'll continue with the data migration!** 🚀