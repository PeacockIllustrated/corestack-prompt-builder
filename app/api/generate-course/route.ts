import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { COURSE_SYSTEM_PROMPT, CourseSchema, GeneratedCourse } from "@/lib/ai/courseSystemPrompt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topicId } = await request.json();

        if (!topicId) {
            return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
        }

        // Fetch the topic
        const { data: topic, error: topicError } = await supabase
            .from("learning_topics")
            .select("*")
            .eq("id", topicId)
            .single();

        if (topicError || !topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
      Topic: ${topic.title}
      Description: ${topic.description || "No description provided"}
      Context: ${topic.context_area || "General"}
      Difficulty: ${topic.difficulty}
      
      Generate a comprehensive course for this topic.
    `;

        const result = await model.generateContent([COURSE_SYSTEM_PROMPT, prompt]);
        const response = result.response;
        const text = response.text();

        let courseData: GeneratedCourse;
        try {
            courseData = CourseSchema.parse(JSON.parse(text));
        } catch (e) {
            console.error("Failed to parse or validate AI response", e);
            return NextResponse.json({ error: "Failed to generate valid course data" }, { status: 500 });
        }

        // Insert into Database
        // 1. Create Course
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .insert({
                learning_topic_id: topic.id,
                title: courseData.title,
                short_summary: courseData.short_summary,
                difficulty: courseData.difficulty,
                estimated_total_minutes: courseData.estimated_total_minutes,
                status: "active", // Auto-activate for now
                source_prompt: prompt,
            })
            .select()
            .single();

        if (courseError) {
            throw courseError;
        }

        // 2. Create Modules and Lessons
        for (const [mIndex, module] of courseData.modules.entries()) {
            const { data: moduleData, error: moduleError } = await supabase
                .from("course_modules")
                .insert({
                    course_id: course.id,
                    order_index: mIndex,
                    title: module.title,
                    summary: module.summary,
                })
                .select()
                .single();

            if (moduleError) throw moduleError;

            const lessonsToInsert = module.lessons.map((lesson, lIndex) => ({
                module_id: moduleData.id,
                order_index: lIndex,
                title: lesson.title,
                objective: lesson.objective,
                key_points: lesson.key_points,
                estimated_minutes: lesson.estimated_minutes,
                practice_task: lesson.practice_task,
                quiz_question: lesson.quiz_question,
            }));

            const { error: lessonsError } = await supabase
                .from("course_lessons")
                .insert(lessonsToInsert);

            if (lessonsError) throw lessonsError;
        }

        return NextResponse.json({ courseId: course.id });

    } catch (error) {
        console.error("Course generation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
