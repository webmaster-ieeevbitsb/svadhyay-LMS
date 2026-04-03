export type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  metadata: {
    overview?: string;
    goals_list?: string; // string representing bullet points, could be newlines
    duration_text?: string;
  } | null;
  created_at: string;
};

export type ModuleContent = {
  module_objective: string | null;
  intro_text: string | null;
  duration_minutes: string | null;
  video_title: string | null;
  video_description: string | null;
  drop_downs: Array<{
    title: string;
    what_it_is: string;
    why_it_matters: string;
    example: string;
    common_mistake: string;
    try_it: string;
    custom_sections?: Array<{
      heading: string;
      content: string;
    }>;
  }>;
  activity_block: {
    title: string;
    instructions: string;
    outcome_expected: string;
  } | null;
  mini_quiz: {
    title: string;
    questions: Array<{
      question_text: string;
      correct_answer: boolean;
    }>;
  } | null;
  references: Array<{
    title: string;
    url: string;
  }>;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  content_text: string | null;
  structured_content: ModuleContent | null; // NEW JSONB Field
  image_url: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
};

export type Resource = {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  link_url: string;
  resource_type: string;
  created_at: string;
};

// --- NEW PHASE 3 TYPES ---

export type Quiz = {
  id: string;
  course_id: string;
  title: string;
  passing_score_percentage: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[]; // Typed as string array for JSONB convenience
  correct_answer: string;
  order_index: number;
};

export type StudentProgress = {
  id: string;
  email: string;
  course_id: string;
  completed_modules: string[]; // UUID array
  quiz_score_percentage: number | null;
  is_completed: boolean;
  completed_at: string | null;
};
