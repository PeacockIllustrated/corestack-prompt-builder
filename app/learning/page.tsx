"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TerminalCard } from "@/components/learning/TerminalCard";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { TerminalInput } from "@/components/learning/TerminalInput";
import { TerminalBadge } from "@/components/learning/TerminalBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Topic {
    id: string;
    title: string;
    priority: "low" | "medium" | "high";
    status: "idea" | "planned" | "in_progress" | "completed";
    created_at: string;
}

export default function LearningPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const fetchTopics = async () => {
        const { data, error } = await supabase
            .from("learning_topics")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching topics:", error);
        } else {
            setTopics(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTopics();
    }, []);

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        setCreating(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Handle auth error or redirect
            console.error("No user found");
            setCreating(false);
            return;
        }

        const { error } = await supabase.from("learning_topics").insert({
            title: newTopicTitle,
            user_id: user.id,
            status: "idea",
            priority: "medium",
        });

        if (error) {
            console.error("Error creating topic:", error);
        } else {
            setNewTopicTitle("");
            setShowNewTopic(false);
            fetchTopics();
        }
        setCreating(false);
    };

    return (
        <div className="min-h-screen p-8 font-mono text-green-500">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 flex items-center justify-between border-b border-green-900 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider text-green-400">
                            CORESTACK // LEARNING_MODULE
                        </h1>
                        <p className="text-xs text-green-700">SYS.VER.2.0.4 // CONNECTED</p>
                    </div>
                    <TerminalButton onClick={() => setShowNewTopic(!showNewTopic)}>
                        {showNewTopic ? "CANCEL" : "NEW_TOPIC"}
                    </TerminalButton>
                </header>

                {showNewTopic && (
                    <TerminalCard title="INIT_NEW_PROCESS" className="mb-8">
                        <form onSubmit={handleCreateTopic} className="space-y-4">
                            <TerminalInput
                                label="TOPIC_IDENTIFIER"
                                placeholder="e.g. Advanced_React_Patterns"
                                value={newTopicTitle}
                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end">
                                <TerminalButton type="submit" isLoading={creating}>
                                    INITIALIZE
                                </TerminalButton>
                            </div>
                        </form>
                    </TerminalCard>
                )}

                <TerminalCard title="ACTIVE_PROCESSES">
                    {loading ? (
                        <div className="animate-pulse py-8 text-center text-green-700">
                            [ SCANNING MEMORY BANKS... ]
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="py-8 text-center text-green-700">
                            [ NO ACTIVE LEARNING PROCESSES FOUND ]
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-green-900 text-green-700">
                                    <tr>
                                        <th className="px-4 py-2">PID</th>
                                        <th className="px-4 py-2">PRIORITY</th>
                                        <th className="px-4 py-2">STATUS</th>
                                        <th className="px-4 py-2">COMMAND/TOPIC</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-900/30">
                                    {topics.map((topic) => (
                                        <tr
                                            key={topic.id}
                                            className="group cursor-pointer transition-colors hover:bg-green-900/20"
                                            onClick={() => router.push(`/learning/${topic.id}`)}
                                        >
                                            <td className="px-4 py-3 font-mono text-green-700">
                                                {topic.id.slice(0, 8)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`uppercase ${topic.priority === "high"
                                                        ? "text-red-500"
                                                        : topic.priority === "medium"
                                                            ? "text-amber-500"
                                                            : "text-green-700"
                                                        }`}
                                                >
                                                    {topic.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <TerminalBadge
                                                    variant={
                                                        topic.status === "completed"
                                                            ? "success"
                                                            : topic.status === "in_progress"
                                                                ? "warning"
                                                                : "info"
                                                    }
                                                >
                                                    {topic.status}
                                                </TerminalBadge>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-green-400 group-hover:text-green-300">
                                                {topic.title}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="opacity-0 group-hover:opacity-100">
                                                    [ACCESS]
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TerminalCard>
            </div>
        </div>
    );
}
