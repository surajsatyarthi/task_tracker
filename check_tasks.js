require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTasks() {
  // Check total tasks
  const { data: allTasks, error: tasksError } = await supabase.from('tasks').select('*');
  console.log('📊 Total tasks in database:', allTasks?.length || 0);
  
  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
    return;
  }
  
  // Check tasks with project_id
  const tasksWithProject = allTasks.filter(t => t.project_id);
  console.log('✅ Tasks with project_id:', tasksWithProject.length);
  console.log('❌ Tasks without project_id:', allTasks.length - tasksWithProject.length);
  
  // Check tasks with user_id
  const tasksWithUser = allTasks.filter(t => t.user_id);
  console.log('✅ Tasks with user_id:', tasksWithUser.length);
  console.log('❌ Tasks without user_id:', allTasks.length - tasksWithUser.length);
  
  // Check projects
  const { data: projects } = await supabase.from('projects').select('*');
  console.log('\n📁 Projects:', projects?.map(p => p.slug).join(', '));
  
  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'kriger.5490@gmail.com');
  console.log('\n👤 User ID:', user?.id);
  
  // Test the API query (same as the app uses)
  const { data: apiTasks, error: apiError } = await supabase
    .from('tasks')
    .select('*, projects!inner(*)')
    .eq('projects.slug', 'personal');
  
  console.log('\n🔍 API query result (personal project):', apiTasks?.length || 0, 'tasks');
  if (apiError) console.error('API error:', apiError);
  
  // Show sample task
  if (allTasks.length > 0) {
    console.log('\n📝 Sample task:', {
      title: allTasks[0].title,
      project_id: allTasks[0].project_id,
      user_id: allTasks[0].user_id
    });
  }
}

checkTasks().catch(console.error);
