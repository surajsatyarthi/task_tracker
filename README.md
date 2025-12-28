# Task Tracker Pro - Personal Edition

A powerful, mobile-first task tracking application built with Next.js 15, designed for managing personal tasks using the Eisenhower Matrix methodology.

## 🎯 Features

### Core Capabilities
- **Eisenhower Matrix View** - Visual 4-quadrant task prioritization (Do First, Delegate, Schedule, Eliminate)
- **Table View** - Spreadsheet-style detailed task list with sorting
- **Calendar View** - Date-based task visualization
- **Drag & Drop** - Intuitive task reorganization between priorities
- **4 Project Categories** - Personal, CSuite, Health, Journaling
- **Specialized Dashboards** - Custom dashboards for Health and Journaling projects

### Task Management
- **5 Status Types** - To Do, Doing, On Hold, Help Me, Done
- **Priority Flags** - Urgent/Important automatic classification
- **Rich Task Data** - Titles, descriptions, due dates, links, tags, remarks
- **Overdue Highlighting** - Visual alerts for past-due tasks
- **Search & Filter** - Quick task discovery across projects

### Technical Features
- **Mobile-First Design** - Fully responsive for iOS/Android
- **PWA Ready** - Install as a native-like app
- **Supabase Backend** - PostgreSQL database with real-time capabilities
- **Authentication** - Secure email/password login
- **CSV Import** - Bulk task import from CSV files

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git for version control

### Installation

1. **Clone the repository**
```bash
cd task-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id
```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/20241115_initial_schema.sql`
   - Click "Run" to create tables and seed projects

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create an account or sign in
   - Start tracking your tasks!

## 📱 Project Structure

```
task-tracker/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main entry point
│   │   ├── real-data-page.tsx # Main application component
│   │   ├── login/             # Authentication pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── EisenhowerMatrix.tsx  # Matrix view
│   │   ├── TaskTable.tsx         # Table view
│   │   ├── CalendarView.tsx      # Calendar view
│   │   ├── TaskCard.tsx          # Individual task card
│   │   ├── TaskDetailModal.tsx   # Task detail/edit modal
│   │   └── AddTaskModal.tsx      # New task form
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── types/                 # TypeScript types
│   │   └── task.ts            # Task-related types
│   └── lib/                   # Utilities
│       └── supabaseClient.ts  # Supabase client
├── supabase/
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## 🎨 The 4 Projects

### 1. Personal
- Color: Indigo (#6366f1)
- For: Personal tasks, errands, finance, learning

### 2. CSuite
- Color: Red (#dc2626)  
- For: Professional work, business tasks

### 3. Health
- Color: Amber (#f59e0b)
- For: Fitness, nutrition, wellness
- Includes: Specialized health dashboard with workout tracking

### 4. Journaling
- Color: Purple (#8b5cf6)
- For: Daily reflection, gratitude, journaling
- Includes: Specialized journaling dashboard

## 🔧 Technology Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Deployment**: Vercel

## 📊 Usage Tips

### Eisenhower Matrix Quadrants

1. **Do First (Red)** - Urgent & Important
   - Do these tasks immediately
   - Highest priority items

2. **Schedule (Green)** - Not Urgent & Important
   - Plan when you'll do these
   - Long-term goals and planning

3. **Delegate (Orange)** - Urgent & Not Important
   - Can these be delegated?
   - Minimize time spent here

4. **Eliminate (Blue)** - Not Urgent & Not Important
   - Consider removing these
   - Time wasters

### Keyboard Shortcuts
- Click any task to view details
- Drag tasks between quadrants to change priority
- Use search to quickly find tasks

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

Vercel will automatically deploy on every push to main.

## 📝 License

This is a personal project. Feel free to fork and customize for your own use.

## 🙏 Acknowledgments

Built for personal productivity starting January 1, 2026.

