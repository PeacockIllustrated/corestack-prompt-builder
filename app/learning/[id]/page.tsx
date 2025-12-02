"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TerminalCard } from "@/components/learning/TerminalCard";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { TerminalBadge } from "@/components/learning/TerminalBadge";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Topic {
    id: string;
    title: string;
    description: string;
    context_area: string;
    difficulty: string;
    priority: string;
    status: string;
}

interface Course {
    id: string;
    title: string;
    status: string;
    estimated_total_minutes: number;
}

export default function TopicDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [topic, setTopic] = useState<Topic | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Topic
        const { data: topicData, error: topicError } = await supabase
            .from("learning_topics")
            .select("*")
            .eq("id", id)
            .single();

        if (topicError) {
            console.error("Error fetching topic:", topicError);
            setLoading(false);
            return;
        }
        setTopic(topicData);

        // Fetch Course
        const { data: courseData } = await supabase
            .from("courses")
            .select("*")
            .eq("learning_topic_id", id)
            .single();

        if (courseData) {
            setCourse(courseData);
        }
        setLoading(false);
    };

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, `> ${msg}`]);
    };

    const handleGenerateCourse = async () => {
        setGenerating(true);
        setLogs([]);
        addLog("INITIALIZING_GENERATION_SEQUENCE...");
        addLog(`TARGET_TOPIC: ${topic?.title}`);
        addLog("CONNECTING_TO_NEURAL_NET (Gemini 2.0)...");

        try {
            // Simulate some "processing" time for the vibe
            await new Promise((r) => setTimeout(r, 800));
            addLog("ANALYZING_CONTEXT_VECTORS...");

            const res = await fetch("/api/generate-course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId: id }),
            });

            if (!res.ok) {
                throw new Error("Generation failed");
            }

            const data = await res.json();
            addLog("STRUCTURE_GENERATED_SUCCESSFULLY");
            addLog(`COURSE_ID: ${data.courseId}`);
            addLog("SAVING_TO_DATABASE...");

            // Refresh data to show the new course
            await fetchData();
            addLog("PROCESS_COMPLETE");

        } catch (error) {
            console.error(error);
            addLog("ERROR: GENERATION_FAILED");
            addLog("ABORTING_SEQUENCE...");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center font-mono text-green-500">
                <div className="animate-pulse">[ LOADING_SYSTEM_INFO... ]</div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="flex min-h-screen items-center justify-center font-mono text-green-500">
                <div className="text-red-500">[ ERROR: TOPIC_NOT_FOUND ]</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 font-mono text-green-500">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link href="/learning" className="text-sm text-green-700 hover:text-green-500">
                        {"< BACK_TO_ROOT"}
                    </Link>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Column: Topic Info */}
                    <div className="space-y-6">
                        <TerminalCard title="SYSTEM_INFO">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-green-700">IDENTIFIER</label>
                                    <div className="text-xl font-bold text-green-400">{topic.title}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-green-700">DESCRIPTION</label>
                                    <div className="text-sm text-green-600">
                                        {topic.description || "NO_DESCRIPTION_PROVIDED"}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-green-700">DIFFICULTY</label>
                                        <div><TerminalBadge>{topic.difficulty}</TerminalBadge></div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-green-700">PRIORITY</label>
                                        <div className="uppercase text-amber-500">{topic.priority}</div>
                                    </div>
                                </div>
                            </div>
                        </TerminalCard>

                        {course && (
                            <TerminalCard title="LINKED_COURSE_MODULE">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">{course.title}</span>
                                        <TerminalBadge variant="success">ACTIVE</TerminalBadge>
                                    </div>
                                    <div className="text-sm text-green-700">
                                        EST_TIME: {course.estimated_total_minutes} MIN
                                    </div>
                                    <Link href={`/learning/course/${course.id}`} className="block">
                                        <TerminalButton className="w-full">
                                            ACCESS_COURSE_CONTENT
                                        </TerminalButton>
                                    </Link>
                                </div>
                            </TerminalCard>
                        )}
                    </div>

                    {/* Right Column: Actions / Terminal */}
                    <div>
                        {!course ? (
                            <TerminalCard title="EXECUTION_TERMINAL" className="h-full min-h-[400px]">
                                <div className="flex h-full flex-col justify-between">
                                    <div className="mb-4 flex-1 overflow-y-auto font-mono text-sm">
                                        <div className="mb-2 text-green-700">
                                            # READY_TO_GENERATE_COURSE_STRUCTURE
                                            <br />
                                            # WAITING_FOR_USER_INPUT...
                                        </div>
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-green-400">
                                                {log}
                                            </div>
                                        ))}
                                        {generating && (
                                            <div className="animate-pulse text-green-500">_</div>
                                        )}
                                    </div>

                                    <div className="border-t border-green-900 pt-4">
                                        <TerminalButton
                                            onClick={handleGenerateCourse}
                                            isLoading={generating}
                                            className="w-full"
                                        >
                                            EXECUTE: GENERATE_COURSE
                                        </TerminalButton>
                                    </div>
                                </div>
                            </TerminalCard>
                        ) : (
                            <TerminalCard title="STATUS_LOG" className="h-full">
                                <div className="font-mono text-sm text-green-700">
                                    <div>{">"} COURSE_GENERATION_COMPLETE</div>
                                    <div>{">"} MODULES_LINKED: OK</div>
                                    <div>{">"} ASSETS_VERIFIED: OK</div>
                                    <div>{">"} SYSTEM_READY</div>
                                </div>
                            </TerminalCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
