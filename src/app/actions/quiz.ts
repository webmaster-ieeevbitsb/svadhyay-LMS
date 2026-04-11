"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Evaluates a quiz attempt and synchronizes results with student progress.
 */
export async function submitQuizAttempt(courseId: string, quizId: string, answers: Record<string, string>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required for evaluation." };

  const { data: questions, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer")
    .eq("quiz_id", quizId);

  if (fetchError || !questions) {
    return { error: "Failed to retrieve assessment criteria." };
  }

  let correctCount = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("passing_score_percentage")
    .eq("id", quizId)
    .single();

  const isPassed = scorePercentage >= (quiz?.passing_score_percentage ?? 70);

  if (!user.email) return { error: "No email bound to user session." };
  const email = user.email.toLowerCase();
  
  const { data: existingProgress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingProgress) {
    // Only update completion status if they passed
    if (isPassed && !existingProgress.is_completed) {
      await supabase
        .from("student_progress")
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq("id", existingProgress.id);
    }
  } else {
    // Initialize progress record if missing
    await supabase
      .from("student_progress")
      .insert([{
        email: email,
        course_id: courseId,
        is_completed: isPassed,
        completed_modules: [],
        completed_at: isPassed ? new Date().toISOString() : null
      }]);
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
