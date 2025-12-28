require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedProduction() {
  console.log('🌱 Seeding production database...\n');
  
  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'kriger.5490@gmail.com');
  
  if (!user) {
    console.error('❌ User not found');
    return;
  }
  
  console.log('✅ Found user:', user.email);
  
  // Get personal project
  const { data: projects } = await supabase.from('projects').select('*').eq('slug', 'personal').single();
  
  if (!projects) {
    console.error('❌ Personal project not found');
    return;
  }
  
  console.log('✅ Found project:', projects.name, '(', projects.id, ')');
  
  // Your 26 tasks
  const tasks = [
    // Original 18 tasks
    { title: "Paytm SBI reissue", description: "Reissue Paytm SBI card" },
    { title: "SBI address change for all accounts", description: "Update address for SBI accounts" },
    { title: "Indusind Card", description: "Apply for or manage Indusind card" },
    { title: "company clouser", description: "Close company registration" },
    { title: "Kapoor FD Clouser", description: "Close Kapoor FD account" },
    { title: "Postal Bank net banking", description: "Set up net banking for Postal Bank" },
    { title: "CBI passbook", description: "Get CBI passbook" },
    { title: "hard desk repair", description: "Repair hard desk" },
    { title: "new clothes", description: "Buy new clothes" },
    { title: "files for papers", description: "Organize files for papers" },
    { title: "Exczma medicine", description: "Get eczema medicine" },
    { title: "visiting cards", description: "Print visiting cards" },
    { title: "hiring", description: "Hiring process" },
    { title: "CBI Edu loan tally", description: "Reconcile CBI education loan" },
    { title: "flat sale", description: "Sell flat" },
    { title: "Indiabulls case", description: "Handle Indiabulls legal case" },
    { title: "BMW address change", description: "Change address for BMW" },
    { title: "BMW FD clouser", description: "Close BMW FD" },
    
    // 2 selling tasks
    { title: "Sell laptop", description: "Sell old laptop" },
    { title: "Sell touchpad", description: "Sell touchpad" },
    
    // 6 video learning tasks
    { 
      title: "Watch: Easy sales framework (Dickie Bush)", 
      description: "https://x.com/dickiebush/status/1885047573028716889",
      links: ["https://x.com/dickiebush/status/1885047573028716889"],
      tags: ["learning", "sales"]
    },
    { 
      title: "Watch: SEO lead generation tactics (Natia)", 
      description: "https://x.com/seonatia/status/1940803656762208515",
      links: ["https://x.com/seonatia/status/1940803656762208515"],
      tags: ["learning", "seo"]
    },
    { 
      title: "Watch: Content systems (Matt Gray)", 
      description: "Twitter thread on content creation systems",
      tags: ["learning", "content"]
    },
    { 
      title: "Watch: NotebookLM for SEO (Julian Goldie)", 
      description: "How to use NotebookLM for SEO",
      tags: ["learning", "seo", "ai"]
    },
    { 
      title: "Watch: Startup growth hacks (Natia)", 
      description: "Growth strategies for startups",
      tags: ["learning", "growth"]
    },
    { 
      title: "Watch: Gemini 5hr course (Julian Goldie)", 
      description: "Complete Gemini course",
      tags: ["learning", "ai"]
    }
  ];
  
  console.log('\n📝 Creating', tasks.length, 'tasks...');
  
  const tasksToInsert = tasks.map(task => ({
    ...task,
    project_id: projects.id,
    // user_id: user.id, // Column doesn't exist yet in production
    status: 'todo',
    priority: 'not_urgent_important',
    is_urgent: false,
    is_important: true,
    links: task.links || [],
    tags: task.tags || []
  }));
  
  const { data: inserted, error } = await supabase
    .from('tasks')
    .insert(tasksToInsert)
    .select();
  
  if (error) {
    console.error('❌ Error creating tasks:', error);
    return;
  }
  
  console.log('✅ Created', inserted.length, 'tasks successfully!');
  
  // Verify
  const { data: allTasks } = await supabase.from('tasks').select('*');
  console.log('\n📊 Total tasks in database:', allTasks.length);
  
  // Test API query
  const { data: apiTasks } = await supabase
    .from('tasks')
    .select('*, projects!inner(*)')
    .eq('projects.slug', 'personal');
  
  console.log('🔍 Tasks visible via API:', apiTasks.length);
  console.log('\n✅ Production database seeded successfully!');
}

seedProduction().catch(console.error);
