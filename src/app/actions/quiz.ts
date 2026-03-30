"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitQuizAttempt(courseId: string, quizId: string, answers: Record<string, string>) {
  const supabase = await createClient();

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required for evaluation." };

  // 2. Fetch correct answers for this quiz
  const { data: questions, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer")
    .eq("quiz_id", quizId);

  if (fetchError || !questions) {
    console.error("Fetch Questions Error:", fetchError);
    return { error: "Failed to retrieve assessment criteria." };
  }

  // 3. Grade the attempt
  let correctCount = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  // 4. Fetch quiz passing criteria
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("passing_score_percentage")
    .eq("id", quizId)
    .single();

  const isPassed = scorePercentage >= (quiz?.passing_score_percentage ?? 70);

  // 5. Update student progress
  if (!user.email) return { error: "No email bound to user." };
  const email = user.email.toLowerCase();
  
  const { data: existingProgress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .single();

  if (existingProgress) {
    const updatePayload: any = {};

    if (isPassed) {
      updatePayload.is_completed = true;
    }

    const { error: updateError } = await supabase
      .from("student_progress")
      .update(updatePayload)
      .eq("id", existingProgress.id);

    if (updateError) {
      console.error("Progress Sync Error:", updateError);
    }
  } else {
    // If no progress record exists, create one
    const { error: insertError } = await supabase
      .from("student_progress")
      .insert([{
        email: email,
        course_id: courseId,
        is_completed: isPassed,
        completed_modules: [] 
      }]);

    if (insertError) {
      console.error("Progress Initialization Error:", insertError);
    }
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/dashboard`);

  return { 
    success: true, 
    score: scorePercentage, 
    isPassed,
    correctCount,
    totalCount: questions.length
  };
}
