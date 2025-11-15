import { supabase } from '@/lib/supabaseClient'

// Personal tasks from CSV - ALL set to 'todo' status as requested
interface PersonalTask {
  title: string;
  status: string;
  priority: string;
  is_urgent: boolean;
  is_important: boolean;
  description?: string;
  links?: string[];
  due_date?: string;
  tags?: string[];
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  id?: string;
  project_id?: string;
}
const personalTasks = [
  { title: 'PnL sheet', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true },
  { title: 'Legal notice to builder indiabulls', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true },
  { title: 'Company clouser', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false },
  { title: 'Increase card limit sbi', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false },
  { title: 'Workout routine', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true },
  { title: 'Learn SEO and pSEO', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true },
  { title: 'Hard disk repair', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false },
  { title: 'BMI', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true },
  { title: 'VC Valuation Method Excel Template', description: 'https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template'] },
  { title: 'Propretiorship account', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true },
  { title: 'ICICI card limit increase', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false },
  { title: 'SEO Video Tutorial', description: 'https://www.youtube.com/watch?v=lOPIutlDFpA', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.youtube.com/watch?v=lOPIutlDFpA'] },
  { title: 'SEO Writing AI Tool', description: 'https://seowriting.ai/', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://seowriting.ai/'] },
  { title: 'Sell laptop', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false },
  { title: 'Stripe Payment', description: 'Payment checkout link', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://checkout.stripe.com/c/pay/cs_live_b15wM7oanEh0g9ELAjNVODnh3HiZcUKuuMj2qeGS437PzsxqhDEkPPK1aV'] },
  { title: 'Dickie Bush Twitter thread', description: 'https://x.com/dickiebush/status/1885047573028716889', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/dickiebush/status/1885047573028716889'] },
  { title: 'SEO Twitter Thread - Natia', description: 'https://x.com/seonatia/status/1940803656762208515', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/seonatia/status/1940803656762208515'] },
  { title: 'Alex Finn Twitter Thread', description: 'https://x.com/AlexFinnX/status/1940559551138615539', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/AlexFinnX/status/1940559551138615539'] },
  { title: 'Penal charges and bounce charges CBI loan', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true },
  { title: 'CBI loan analysis', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true },
  { title: 'Indusind card', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false }
];

// Function to migrate existing mock data to Supabase
export async function migrateMockDataToDatabase() {
  try {
    console.log('Starting data migration...')
    
    // First, get all projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
    
    if (projectError) {
      console.error('Error fetching projects:', projectError)
      return { success: false, error: projectError.message }
    }
    
    console.log(`Found ${projects.length} projects`)
    
    // Create a mapping of project slugs to IDs
    const projectMap = projects.reduce((acc, project) => {
      acc[project.slug] = project.id
      return acc
    }, {} as Record<string, string>)
    
    console.log('Project mapping:', projectMap)
    
    // Migrate personal tasks
    let successCount = 0
    let errorCount = 0
    
    for (const task of personalTasks) {
      try {
        const projectId = projectMap['personal']
        if (!projectId) {
          console.error('Personal project not found')
          errorCount++
          continue
        }
        
        const { error } = await supabase
          .from('tasks')
          .insert([{
            project_id: projectId,
            title: task.title,
            description: task.description || null,
            status: task.status,
            priority: task.priority,
            is_urgent: task.is_urgent,
            is_important: task.is_important,
            due_date: (task as PersonalTask).due_date || null,
            links: (task as PersonalTask).links || [],
            tags: (task as PersonalTask).tags || [],
            remarks: (task as PersonalTask).remarks || null,
            created_at: (task as PersonalTask).created_at || new Date().toISOString(),
            updated_at: (task as PersonalTask).updated_at || new Date().toISOString()
          }])
        
        if (error) {
          console.error(`Error migrating task "${task.title}":`, error)
          errorCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`Unexpected error migrating task "${task.title}":`, error)
        errorCount++
      }
    }
    
    console.log(`Migration completed: ${successCount} successful, ${errorCount} errors`)
    
    return {
      success: true,
      data: {
        projectsFound: projects.length,
        tasksMigrated: successCount,
        errors: errorCount
      }
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to check if migration is needed
export async function checkMigrationStatus() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('Error checking migration status:', error)
      return { needsMigration: true, error: error.message }
    }
    
    const taskCount = data?.length || 0
    console.log(`Found ${taskCount} tasks in database`)
    
    return {
      needsMigration: taskCount === 0,
      currentTaskCount: taskCount
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return { needsMigration: true, error: 'Failed to check database' }
  }
}

// Function to clear all tasks (for testing/reset)
export async function clearAllTasks() {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all real tasks
    
    if (error) {
      console.error('Error clearing tasks:', error)
      return { success: false, error: error.message }
    }
    
    console.log('All tasks cleared successfully')
    return { success: true }
  } catch (error) {
    console.error('Error clearing tasks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}