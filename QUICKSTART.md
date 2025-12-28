# 🚀 Quick Start Guide - Task Tracker Pro

## Ready for January 1, 2026!

This guide will get your task tracker up and running in ~10 minutes.

---

## ✅ Pre-Launch Checklist

### Step 1: Install Dependencies
```bash
cd /Users/surajsatyarthi/Desktop/task-tracker
npm install
```

### Step 2: Set Up Supabase

1. **Go to Supabase**: https://app.supabase.com
2. **Create a new project** (or use existing)
3. **Copy your credentials**:
   - Project URL
   - Anon/Public key
   - Project ID

### Step 3: Configure Environment

1. **Copy the environment template**:
```bash
cp .env.example .env.local
```

2. **Edit `.env.local`** with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_PROJECT_ID=your-project-id
```

### Step 4: Set Up Database

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire migration file**:
   - File: `supabase/migrations/20241115_initial_schema.sql`
3. **Paste and Run** in SQL Editor
4. **Verify**: You should see 4 projects created:
   - Personal (Indigo)
   - CSuite (Red)
   - Health (Amber)
   - Journaling (Purple)

### Step 5: Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### Step 6: Create Your Account

1. Click "Sign Up"
2. Enter your email and password
3. **Check your email** for verification link
4. Click the verification link
5. Return to app and sign in

---

## 🎯 Using Your Task Tracker

### Adding Tasks

1. Click "**Add Task**" button
2. Fill in:
   - Title (required)
   - Description
   - Priority (Urgent/Important flags)
   - Due date (optional)
   - Links, tags, remarks
3. Click "**Add Task**"

### Organizing with Eisenhower Matrix

**4 Quadrants:**

| Quadrant | Urgent | Important | Action |
|----------|--------|-----------|--------|
| **Do First** (Red) | ✅ Yes | ✅ Yes | Do immediately |
| **Schedule** (Green) | ❌ No | ✅ Yes | Plan when to do |
| **Delegate** (Orange) | ✅ Yes | ❌ No | Minimize time |
| **Eliminate** (Blue) | ❌ No | ❌ No | Consider removing |

**Drag & drop** tasks between quadrants to change priority!

### View Modes

- **Matrix View**: Visual Eisenhower Matrix
- **Table View**: Detailed spreadsheet
- **Calendar View**: Date-based view

Toggle between views using the buttons below the project tabs.

### Project Categories

Switch between your 4 projects:

1. **Personal** 🏠
   - Personal errands
   - Finance tasks
   - Learning goals
   - Life admin

2. **CSuite** 💼
   - Professional work
   - Business tasks
   - Career development

3. **Health** 💪
   - Fitness tracking
   - Nutrition
   - Wellness goals
   - Use specialized dashboard!

4. **Journaling** 📝
   - Daily reflection
   - Gratitude practice
   - Personal growth
   - Use specialized dashboard!

### Task Statuses

Move tasks through your workflow:

- 🆕 **To Do** - New task, not started
- ⚡ **Doing** - Currently working on it
- ⏸️ **On Hold** - Paused/waiting
- 🆘 **Help Me** - Blocked, need assistance
- ✅ **Done** - Completed!

### Search & Filter

- Use the **search bar** to find tasks quickly
- Searches: title, description, tags, remarks
- Results update as you type

---

## 🚀 Deploy to Vercel (Optional)

### For Production Access

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Task Tracker Pro"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Go to Vercel**: https://vercel.com
3. **Import your repository**
4. **Add environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_PROJECT_ID`
5. **Deploy!**

Your app will be live at: `https://your-app.vercel.app`

### Access from Mobile

1. Open Vercel URL on your phone
2. **Add to Home Screen**:
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen
3. Use like a native app!

---

## 📱 Mobile Tips

- **Swipe** project tabs left/right
- **Tap** any task to view details
- **Long press** for quick actions
- **Pinch to zoom** disabled (no accidental zoom!)
- **44px touch targets** for easy tapping

---

## 💾 Import Your Existing Tasks

If you have CSV files with tasks:

1. **Format your CSV** with columns:
   - title
   - description (optional)
   - status
   - priority (or urgent/important flags)
   - due_date (optional)

2. **Use the import API** (requires coding) or:
3. **Add tasks manually** through the UI

---

## 🆘 Troubleshooting

### Can't sign in?
- Check you verified your email
- Try password reset
- Check Supabase auth settings

### No tasks showing?
- Make sure you're on the right project tab
- Check database has the 4 projects
- Try adding a new task manually

### Build errors?
- Run `npm install` again
- Delete `node_modules` and `.next` folder
- Run `npm install` fresh

### Database errors?
- Verify SQL migration ran successfully
- Check Supabase project is active
- Verify environment variables are correct

---

## 📊 Pro Tips

### Daily Routine

**Morning** (9:00 AM):
1. Check **Do First** quadrant
2. Review **Health** dashboard
3. Add any new urgent tasks

**Midday** (1:00 PM):
1. Update task statuses
2. Move completed tasks to Done
3. Check **CSuite** project

**Evening** (9:00 PM):
1. **Journaling** dashboard - daily reflection
2. Review tomorrow's Schedule quadrant
3. Plan your Do First tasks

### Weekly Review

**Every Sunday**:
1. Mark all Done tasks from last week
2. Review **Eliminate** quadrant - delete low-value tasks
3. Move Schedule tasks to Do First for the week
4. Check overdue tasks
5. Set priorities for the week ahead

---

## 🎉 You're All Set!

Your personal task tracker is ready for January 1, 2026!

Questions or issues? Check:
- README.md for detailed docs
- PROJECT_SUMMARY.md for feature list
- database-schema.md for database structure

**Happy tracking! 🚀**
