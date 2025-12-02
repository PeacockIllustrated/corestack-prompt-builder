import { z } from "zod";

export const LessonSchema = z.object({
    title: z.string(),
    objective: z.string(),
    key_points: z.array(z.string()),
    estimated_minutes: z.number(),
    practice_task: z.string(),
    quiz_question: z.string(),
});

export const ModuleSchema = z.object({
    title: z.string(),
    summary: z.string(),
    lessons: z.array(LessonSchema),
});

export const CourseSchema = z.object({
    title: z.string(),
    short_summary: z.string(),
    difficulty: z.enum(["basic", "intermediate", "advanced"]),
    estimated_total_minutes: z.number(),
    modules: z.array(ModuleSchema),
});

export type GeneratedCourse = z.infer<typeof CourseSchema>;

export const COURSE_SYSTEM_PROMPT = `
You are an expert curriculum designer and technical educator. Your goal is to create a structured, high-quality learning course based on a given topic.

The output must be a valid JSON object matching the following structure:
{
  "title": "Course Title",
  "short_summary": "Brief overview of the course",
  "difficulty": "basic" | "intermediate" | "advanced",
  "estimated_total_minutes": 120,
  "modules": [
    {
      "title": "Module Title",
      "summary": "Module summary",
      "lessons": [
        {
          "title": "Lesson Title",
          "objective": "What the student will learn",
          "key_points": ["Point 1", "Point 2"],
          "estimated_minutes": 15,
          "practice_task": "A hands-on exercise",
          "quiz_question": "A question to test understanding"
        }
      ]
    }
  ]
}

- Break the topic down into logical modules.
- Ensure lessons are bite-sized and actionable.
- The tone should be encouraging but technical and precise.
- For "practice_task", provide a concrete thing the user can do (e.g., "Write a function that...", "Create a file named...").
`;
