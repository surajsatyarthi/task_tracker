const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const links = [
  'https://www.youtube.com/watch?v=-Ou4NTYcj6g&t=4s',
  'https://www.youtube.com/watch?v=IhEy5s-Z_Jg',
  'https://linkmate.io/',
  'https://henrythe9th.substack.com/p/supercoms-operating-blueprint',
  'https://x.com/natiakourdadze',
  'https://x.com/JulianGoldieSEO/status/1932180908087324844',
  'https://www.youtube.com/watch?v=EDJMrlk4xIw',
  'https://x.com/boringmarketer/status/1930327867990462495'
];

async function addLinksToTask() {
  // First, search for csuite-related tasks
  const { data: tasks, error: searchError } = await supabase
    .from('tasks')
    .select('*')
    .or('title.ilike.%csuite%,title.ilike.%c-suite%,title.ilike.%magazine%,tags.cs.{csuite,c-suite,magazine}');

  if (searchError) {
    console.error('Error searching for tasks:', searchError);
    return;
  }

  console.log(`\nFound ${tasks?.length || 0} csuite-related tasks:`);
  if (tasks && tasks.length > 0) {
    tasks.forEach((task, idx) => {
      console.log(`${idx + 1}. ${task.title} (ID: ${task.id})`);
      console.log(`   Current links: ${task.links?.length || 0}`);
    });

    // Add links to the first csuite task found
    const targetTask = tasks[0];
    const existingLinks = targetTask.links || [];
    const updatedLinks = [...existingLinks, ...links];

    const { data: updated, error: updateError } = await supabase
      .from('tasks')
      .update({ links: updatedLinks })
      .eq('id', targetTask.id)
      .select();

    if (updateError) {
      console.error('Error updating task:', updateError);
    } else {
      console.log(`\n✅ Added ${links.length} links to task: "${targetTask.title}"`);
      console.log(`Total links now: ${updatedLinks.length}`);
    }
  } else {
    // Create a new csuite task
    console.log('\nNo csuite tasks found. Creating new task...');
    
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert({
        title: 'C-Suite Magazine Resources',
        description: 'Collection of resources and links for C-Suite/Magazine project',
        links: links,
        tags: ['csuite', 'magazine', 'resources'],
        status: 'todo',
        priority: 'not_urgent_important',
        is_urgent: false,
        is_important: true
      })
      .select();

    if (createError) {
      console.error('Error creating task:', createError);
    } else {
      console.log(`\n✅ Created new task: "${newTask[0].title}"`);
      console.log(`Links added: ${links.length}`);
    }
  }
}

addLinksToTask();
