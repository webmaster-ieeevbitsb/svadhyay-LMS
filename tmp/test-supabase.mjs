import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`📡 CONNECTING TO: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostic() {
  console.log("🔍 PHASE 1: Fetching Evaluation Nodes...");
  const { data: questions, error: fetchError } = await supabase
    .from('quiz_questions')
    .select('*')
    .limit(3);

  if (fetchError) {
    console.error("❌ FETCH_FAILED:", fetchError.message);
    return;
  }

  console.log(`✅ SUCCESS: Found ${questions.length} nodes.`);
  if (questions.length > 0) {
    console.log("🔍 PHASE 2: Testing Deallocation (ANON_LEVEL)...");
    const testId = questions[0].id;
    const { error: deleteError, count } = await supabase
      .from('quiz_questions')
      .delete({ count: 'exact' })
      .eq('id', testId);

    if (deleteError) {
      console.error("❌ DELETE_REJECTED:", deleteError.message);
      console.log("💡 HINT: This is expected if RLS is enabled and you're not logged in.");
    } else {
      console.log(`✅ DELETE_EXECUTED: Affected rows: ${count}`);
    }
  }
  
  console.log("\n🧪 CONCLUSION: If FETCH worked but DELETE didn't, the database is responding fine, and the issue is specifically between your Admin Session and the RLS Policies.");
}

runDiagnostic();
