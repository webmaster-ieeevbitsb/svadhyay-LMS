"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Allocates a new module to a specified course.
 */
export async function addModuleToCourse(courseId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  
  if (!title) {
    return { error: "Module title is required" };
  }

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
    return { error: `Failed to initialize module: ${error.message}` };
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

/**
 * Synchronizes refined content state to a course module.
 */
export async function updateModuleContent(courseId: string, moduleId: string, data: UpdateData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("modules")
    .update({
      title: data.title,
      content_text: data.content_text,
      video_url: data.video_url,
      structured_content: data.structured_content || null
    })
    .eq("id", moduleId)
    .eq("course_id", courseId);

  if (error) {
    return { error: "Failed to persist module state changes." };
  }

  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
  return { success: true };
}

/**
 * Initializes the final assessment architecture for a course.
 */
export async function createQuiz(courseId: string) {
  const supabase = await createClient();

  const { data: existingQuizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingQuizzes) {
    return { error: "An assessment already exists for this course." };
  }

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
    return { error: "Failed to initialize assessment framework." };
  }

  // Inject initial diagnostic questions
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

  await supabase.from("quiz_questions").insert(sampleQuestions);
  
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

/**
 * Updates a specific assessment question.
 */
export async function updateQuizQuestion(questionId: string, data: any) {
  const supabase = await createClient();
  const updateData = { ...data };
  delete updateData.quiz_id;
  delete updateData.id;

  const { error } = await supabase
    .from("quiz_questions")
    .update(updateData)
    .eq("id", questionId);

  if (error) {
    return { error: `Update failed: ${error.message}` };
  }

  return { success: true };
}

/**
 * Allocates a new question node to an existing assessment.
 */
export async function addQuizQuestion(quizId: string) {
  const supabase = await createClient();

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
    return { error: `Failed to append question: ${error.message}` };
  }

  return { success: true, data };
}

/**
 * Permanently deallocates an assessment question node.
 */
export async function deleteQuizQuestion(questionId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Auth Failure" };

  const { data: adminCheck } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!adminCheck?.is_admin) {
    return { error: "Security Access Violation: Admin clearance required." };
  }

  const { error, count } = await supabase
    .from("quiz_questions")
    .delete({ count: 'exact' })
    .eq("id", questionId);

  if (error) {
    return { error: `Database rejection: ${error.message}` };
  }

  if (count === 0) {
    return { error: "Deletion failed: record not found or access restricted." };
  }

  return { success: true };
}

/**
 * Terminates an entire assessment architecture for a course.
 */
export async function deleteQuiz(courseId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Auth Failure" };
  const { data: adminCheck } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!adminCheck?.is_admin) return { error: "Security Access Violation" };

  const { data: quiz, error: fetchError } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError) return { error: "Database lookup failure." };

  if (quiz) {
    await supabase.from("quiz_questions").delete().eq("quiz_id", quiz.id);
  }

  const { error: deleteError, count } = await supabase
    .from("quizzes")
    .delete({ count: 'exact' })
    .eq("course_id", courseId);

  if (deleteError) return { error: "Termination protocol rejected." };
  
  if (count === 0) {
    return { error: "Database rejected termination: Record not found." };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}
