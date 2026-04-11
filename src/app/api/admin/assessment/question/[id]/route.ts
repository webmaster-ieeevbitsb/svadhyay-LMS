import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: questionId } = await params;

  // 1. Verify Authentication & Admin Status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: participant } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!participant?.is_admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  // 2. Execute deletion
  const { error, count } = await supabase
    .from("quiz_questions")
    .delete({ count: 'exact' })
    .eq("id", questionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ error: "Database rejected: RLS policy violation or record not found" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
