"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addModuleToCourse(courseId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  
  if (!title) {
    return { error: "Module title is required" };
  }

  // Determine next order_index
  const { data: existingModules, error: fetchError } = await supabase
    .from("modules")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1);

  let nextIndex = 1;
  if (!fetchError && existingModules?.length > 0) {
    nextIndex = existingModules[0].order_index + 1;
  }

  const { error } = await supabase
    .from("modules")
    .insert([
      {
        course_id: courseId,
        title,
        order_index: nextIndex,
      }
    ]);

  if (error) {
    console.error("Module creation error:", error);
    return { error: `Failed to allocate module architecture: ${error.message} (Hint: Check DB RLS policies)` };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

interface UpdateData {
  title: string;
  content_text: string;
  video_url: string;
  structured_content?: any;
}

export async function updateModuleContent(courseId: string, moduleId: string, data: UpdateData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("modules")
    .update({
      title: data.title,
      content_text: data.content_text,
      video_url: data.video_url,
      // Pass the structure if provided
      structured_content: data.structured_content || null
    })
    .eq("id", moduleId)
    .eq("course_id", courseId);

  if (error) {
    console.error("Content Commit Error:", error);
    return { error: "Invalid Permission or Failed Content Sync" };
  }

  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
  return { success: true };
}

export async function createQuiz(courseId: string) {
  const supabase = await createClient();

  // Basic check: Does a quiz already exist?
  const { data: existingQuizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .limit(1);

  if (existingQuizzes && existingQuizzes.length > 0) {
    return { error: "A quiz already exists for this course." };
  }

  // Create the quiz header
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert([
      {
        course_id: courseId,
        title: "Final Assessment",
        passing_score_percentage: 70,
      }
    ])
    .select()
    .single();

  if (quizError) {
    console.error("Quiz creation error:", quizError);
    return { error: "Failed to initialize quiz architecture" };
  }

  // Add 3 sample questions automatically
  const sampleQuestions = [
    {
      quiz_id: quiz.id,
      question_text: "What is the primary objective of this course?",
      options: ["Learning basics", "Mastery of tools", "Certification only", "Practical application"],
      correct_answer: "Practical application",
      order_index: 1,
    },
    {
      quiz_id: quiz.id,
      question_text: "Which of the following is most important for success in this module?",
      options: ["Consistency", "Speed", "Luck", "Isolation"],
      correct_answer: "Consistency",
      order_index: 2,
    },
    {
      quiz_id: quiz.id,
      question_text: "Is this course designed for beginners or advanced students?",
      options: ["Beginners", "Advanced", "Intermediate", "All levels"],
      correct_answer: "All levels",
      order_index: 3,
    }
  ];

  const { error: questionsError } = await supabase
    .from("quiz_questions")
    .insert(sampleQuestions);

  if (questionsError) {
    console.error("Quiz questions error:", questionsError);
  }
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateQuizQuestion(questionId: string, data: any) {
  const supabase = await createClient();
  const { quiz_id, id, ...updateData } = data; // quiz_id is needed for revalidation, id is questionId

  const { error } = await supabase
    .from("quiz_questions")
    .update(updateData)
    .eq("id", questionId);

  if (error) {
    console.error("Quiz question update error:", error);
    return { error: `Update failed: ${error.message}` };
  }

  // Use revalidatePath to ensure server-side data is fresh
  // We can't easily get the courseId here, but we can revalidate the parent or specific path if we had it.
  // For now, returning success and letting client handle local state.
  return { success: true };
}

export async function addQuizQuestion(quizId: string) {
  const supabase = await createClient();

  // Find max order_index
  const { data: lastQuestion } = await supabase
    .from("quiz_questions")
    .select("order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: false })
    .limit(1);
  
  const nextIndex = (lastQuestion?.[0]?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert([{
      quiz_id: quizId,
      question_text: "New Question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option A",
      order_index: nextIndex
    }])
    .select()
    .single();

  if (error) {
    console.error("Add question error:", error);
    return { error: `Failed to add question: ${error.message}` };
  }

  return { success: true, data };
}

export async function deleteQuizQuestion(questionId: string) {
  console.log(`🛠️ DELETE_ACTION: Attempting to deallocate node ${questionId}`);
  const supabase = await createClient();

  // 1. Verify Admin Status Manually (Bypass RLS dependency for logic check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Authorization Protocol Failure" };

  const { data: adminCheck } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .single();

  if (!adminCheck?.is_admin) {
    console.warn(`🛑 Permission Denied: ${user.email} is not a verified admin.`);
    return { error: "Security Access Violation: Admin Clearance Required" };
  }

  // 2. Attempt Delete with detailed feedback
  const { error, count } = await supabase
    .from("quiz_questions")
    .delete({ count: 'exact' })
    .eq("id", questionId);

  if (error) {
    console.error("❌ DELETE_QUESTION_ERROR:", error);
    return { error: `Database Rejection: ${error.message}` };
  }

  if (count === 0) {
    console.warn("⚠️ DELETE_NOP: No rows affected. This points to an RLS policy block.");
    return { error: "RLS Access Restriction: The database rejected the delete command despite admin status." };
  }

  console.log(`✅ DELETE_SUCCESS: Node ${questionId} removed.`);
  return { success: true };
}

export async function deleteQuiz(courseId: string) {
  console.log(`🛠️ DELETE_QUIZ: Deallocating entire assessment for course ${courseId}`);
  const supabase = await createClient();

  // 1. Verify Admin Status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Authorization Protocol Failure" };
  const { data: adminCheck } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .single();

  if (!adminCheck?.is_admin) return { error: "Security Access Violation" };

  // 2. Get the quiz ID safely
  const { data: quiz, error: fetchError } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError) return { error: `Database Lookup Failure: ${fetchError.message}` };

  if (quiz) {
    console.log(`🛠️ Force-clearing questions for quiz ${quiz.id}`);
    await supabase.from("quiz_questions").delete().eq("quiz_id", quiz.id);
  }

  // 3. Delete the quiz header with count verification
  const { error: deleteError, count } = await supabase
    .from("quizzes")
    .delete({ count: 'exact' })
    .eq("course_id", courseId);

  if (deleteError) return { error: `Termination Protocol Rejected: ${deleteError.message}` };
  
  if (count === 0) {
    return { error: "RLS Access Restriction: Database rejected the assessment termination." };
  }

  console.log(`✅ DELETE_QUIZ_SUCCESS: Course ${courseId} is now assessment-free.`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}
