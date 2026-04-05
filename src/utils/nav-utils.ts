import { ModuleContent } from "@/types/database";

export type StepType = "intro" | "concept" | "activity" | "references" | "quiz";

/**
 * Determines the next valid URL in the LMS sub-module flow.
 * Skips empty Activity and References sections to prevent 404s.
 */
function getNextPostConceptStep(baseUrl: string, courseId: string, sc: ModuleContent): string {
  // 1. Check Activity
  if (sc?.activity_block?.title && sc.activity_block.title.trim() !== "") {
    return `${baseUrl}/activity`;
  }
  // 2. Check References
  if (sc?.references && sc.references.length > 0) {
    return `${baseUrl}/references`;
  }
  // 3. Check Quiz (Must have questions)
  if (sc?.mini_quiz?.questions && Array.isArray(sc.mini_quiz.questions) && sc.mini_quiz.questions.length > 0) {
    return `${baseUrl}/quiz`;
  }
  
  // 4. Default to Course Outline
  return `/courses/${courseId}`;
}

export function getNextStepUrl(
  courseId: string, 
  moduleId: string, 
  currentStep: StepType, 
  sc: ModuleContent, 
  currentConceptIndex?: number
): string {
  if (!sc) return `/courses/${courseId}`;
  
  const baseUrl = `/courses/${courseId}/modules/${moduleId}`;

  // 1. From Intro -> Go to First Concept (if exists) or Activity or References or Quiz
  if (currentStep === "intro") {
    if (sc.drop_downs && sc.drop_downs.length > 0) {
      return `${baseUrl}/concept/1`;
    }
    return getNextPostConceptStep(baseUrl, courseId, sc);
  }

  // 2. From Concept N -> Go to Concept N+1 or next available section
  if (currentStep === "concept" && currentConceptIndex !== undefined) {
    if (currentConceptIndex < sc.drop_downs.length - 1) {
      return `${baseUrl}/concept/${currentConceptIndex + 2}`;
    }
    return getNextPostConceptStep(baseUrl, courseId, sc);
  }

  // 3. From Activity -> Go to References (if exists) or Quiz
  if (currentStep === "activity") {
    if (sc.references && sc.references.length > 0) {
      return `${baseUrl}/references`;
    }
    if (sc.mini_quiz && sc.mini_quiz.questions && sc.mini_quiz.questions.length > 0) {
      return `${baseUrl}/quiz`;
    }
    return `/courses/${courseId}`;
  }

  // 4. From References -> Go to Quiz (if exists) or Course Outline
  if (currentStep === "references") {
    if (sc.mini_quiz && sc.mini_quiz.questions && sc.mini_quiz.questions.length > 0) {
      return `${baseUrl}/quiz`;
    }
    return `/courses/${courseId}`;
  }

  return `/courses/${courseId}`;
}
