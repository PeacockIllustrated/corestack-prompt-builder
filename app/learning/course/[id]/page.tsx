"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TerminalCard } from "@/components/learning/TerminalCard";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { TerminalBadge } from "@/components/learning/TerminalBadge";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Lesson {
    id: string;
    title: string;
    objective: string;
    key_points: string[];
    estimated_minutes: number;
    practice_task: string;
    quiz_question: string;
    order_index: number;
}

interface Module {
    id: string;
    title: string;
    order_index: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    learning_topic_id: string;
}

export default function CourseViewPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const fetchCourseData = async () => {
        setLoading(true);

        // Fetch Course
        const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single();

        if (courseError) {
            console.error("Error fetching course:", courseError);
            setLoading(false);
            return;
        }
        setCourse(courseData);

        // Fetch Modules and Lessons
        const { data: modulesData, error: modulesError } = await supabase
            .from("course_modules")
            .select(`
        *,
        lessons:course_lessons(*)
      `)
            .eq("course_id", id)
            .order("order_index", { ascending: true });

        if (modulesError) {
            console.error("Error fetching modules:", modulesError);
        } else {
            // Sort lessons within modules
            const sortedModules = modulesData?.map((m) => ({
                ...m,
                lessons: m.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
            })) || [];

            setModules(sortedModules);

            // Select first lesson by default
            if (sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
                setSelectedLesson(sortedModules[0].lessons[0]);
                setExpandedModules(new Set([sortedModules[0].id]));
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCourseData();
    }, [id]);

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center font-mono text-green-500">
                <div className="animate-pulse">[ LOADING_COURSE_CONTENT... ]</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex min-h-screen items-center justify-center font-mono text-green-500">
                <div className="text-red-500">[ ERROR: COURSE_NOT_FOUND ]</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden font-mono text-green-500">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-green-900 bg-black p-4">
                <div className="flex items-center gap-4">
                    <Link href={`/learning/${course.learning_topic_id}`} className="text-green-700 hover:text-green-500">
                        {"< EXIT"}
                    </Link>
                    <h1 className="font-bold tracking-wider text-green-400">
                        {course.title}
                    </h1>
                </div>
                <div className="text-xs text-green-700">
                    MODE: READ_ONLY // SECURE_CONNECTION
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 overflow-y-auto border-r border-green-900 bg-black/50 p-4">
                    <div className="mb-4 text-xs font-bold uppercase tracking-widest text-green-700">
                        COURSE_STRUCTURE
                    </div>
                    <div className="space-y-2">
                        {modules.map((module) => (
                            <div key={module.id}>
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="flex w-full items-center gap-2 py-1 text-left text-sm font-bold hover:text-green-300"
                                >
                                    {expandedModules.has(module.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                    {module.title}
                                </button>

                                {expandedModules.has(module.id) && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-green-900 pl-2">
                                        {module.lessons.map((lesson) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setSelectedLesson(lesson)}
                                                className={`flex w-full items-center gap-2 py-1 text-left text-xs transition-colors ${selectedLesson?.id === lesson.id
                                                    ? "bg-green-900/30 text-green-300"
                                                    : "text-green-600 hover:text-green-400"
                                                    }`}
                                            >
                                                {selectedLesson?.id === lesson.id ? (
                                                    <span className="block h-1.5 w-1.5 bg-green-500" />
                                                ) : (
                                                    <span className="block h-1.5 w-1.5 border border-green-700" />
                                                )}
                                                {lesson.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-black p-8">
                    {selectedLesson ? (
                        <div className="mx-auto max-w-3xl space-y-8">
                            <div className="border-b border-green-900 pb-4">
                                <div className="mb-2 text-xs uppercase tracking-widest text-green-700">
                                    LESSON_MODULE_{selectedLesson.order_index + 1}
                                </div>
                                <h2 className="text-3xl font-bold text-green-400">
                                    {selectedLesson.title}
                                </h2>
                            </div>

                            <TerminalCard title="OBJECTIVE">
                                <p className="text-green-300">{selectedLesson.objective}</p>
                            </TerminalCard>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-green-600">
                                    {">"} KEY_CONCEPTS
                                </h3>
                                <ul className="space-y-2 pl-4">
                                    {selectedLesson.key_points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 text-green-400">
                                            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-green-600" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <TerminalCard title="PRACTICE_TASK" className="border-amber-900/50 bg-amber-950/10">
                                <div className="font-mono text-amber-500">
                                    {selectedLesson.practice_task}
                                </div>
                            </TerminalCard>

                            <TerminalCard title="KNOWLEDGE_CHECK">
                                <div className="space-y-4">
                                    <p className="font-bold text-green-400">
                                        Q: {selectedLesson.quiz_question}
                                    </p>
                                    <div className="text-xs text-green-700">
                                        [ THINK_ABOUT_THE_ANSWER_BEFORE_PROCEEDING ]
                                    </div>
                                </div>
                            </TerminalCard>

                            <div className="flex justify-between border-t border-green-900 pt-8">
                                <div className="text-xs text-green-700">
                                    EST_TIME: {selectedLesson.estimated_minutes} MIN
                                </div>
                                <TerminalButton>MARK_COMPLETE</TerminalButton>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-green-700">
                            [ SELECT_A_MODULE_TO_BEGIN ]
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
