require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Using ANON KEY like the frontend does
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const taskId = "92ed3016-242d-41ac-aefc-619d70614c5a";
  
  console.log("Testing UPDATE with ANON KEY (same as drag-and-drop)...\n");
  
  const updateData = {
    updated_at: new Date().toISOString(),
    priority: "not_urgent_important",
    is_urgent: false,
    is_important: true
  };
  
  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .select()
    .single();
    
  if (error) {
    console.log("❌ DRAG-AND-DROP STILL BROKEN");
    console.log("Error:", error.message);
    console.log("\nRLS policies still need manual fix in Supabase Dashboard");
    process.exit(1);
  } else {
    console.log("✅ DRAG-AND-DROP FIXED!");
    console.log("✅ Task updated successfully with ANON KEY");
    console.log("✅ Eisenhower Matrix drag-and-drop will work now");
    process.exit(0);
  }
})();
