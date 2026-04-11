import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/utils/supabase/auth-utils";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: Request
) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "Missing coarse architectural identifier" }, { status: 400 });
  }

  // 1. Verify Authentication & Admin Status
  const auth = await verifyAdmin();
  if (auth.error !== null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }
  const { supabase } = auth;


  // 2. Identify Target Quiz(zes)
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId);

  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map(q => q.id);
    // 3. Force-clear child questions first (FK safety)
    await supabase.from("quiz_questions").delete().in("quiz_id", quizIds);
  }

  // 4. Delete the quiz header(s)
  const { error, count } = await supabase
    .from("quizzes")
    .delete({ count: 'exact' })
    .eq("course_id", courseId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (count === 0) return NextResponse.json({ error: "RLS Access Violation: Termination Blocked" }, { status: 403 });

  revalidatePath(`/admin/courses/${courseId}`);
  return NextResponse.json({ success: true });
}
