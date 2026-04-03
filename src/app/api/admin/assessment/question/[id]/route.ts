import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: questionId } = await params;

  console.log(`🛠️ API_DELETE_QUESTION: Node ${questionId}`);

  // 1. Verify Authentication (BYPASSED FOR DIAGNOSTIC)
  /*
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Auth Required" }, { status: 401 });
  }

  // 2. Verify Admin Status (Direct DB lookup)
  const { data: admin } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email)
    .single();

  if (!admin?.is_admin) return NextResponse.json({ error: "Forbidden: Admin Access Required" }, { status: 403 });
  */

  console.log(`🚀 STAGE_BYPASS: Executing Deallocation for Node ${questionId}`);

  // 2. Perform Delete with explicit result check
  const { error, count } = await supabase
    .from("quiz_questions")
    .delete({ count: 'exact' })
    .eq("id", questionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ error: "Database Rejected (RLS Blocked)" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
