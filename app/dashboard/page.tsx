"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage, ProjectMetadata, ProjectType } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { TerminalCard } from "@/components/learning/TerminalCard";
import { TerminalBadge } from "@/components/learning/TerminalBadge";
import { Code, Brain, LogOut, Plus, Trash2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            // Check Auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/");
                return;
            }
            setUser(user);

            // Load Local Projects
            const loadedProjects = storage.getAllProjects();
            setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
            setIsLoading(false);
        };
        init();
    }, [router]);

    const handleCreateProject = (type: ProjectType) => {
        const id = storage.createProject(type);
        router.push(`/editor/${id}`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            storage.deleteProject(id);
            setProjects(storage.getAllProjects());
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">
                <div className="animate-pulse">[ LOADING_DASHBOARD_MODULES... ]</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 bg-black text-green-500 font-mono">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="border-b border-green-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-glow">
                            CORESTACK // HUB
                        </h1>
                        <p className="text-green-700 mt-2 text-sm">
                            USER: {user?.email} {"//"} ACCESS_LEVEL: ADMIN
                        </p>
                    </div>
                    <TerminalButton variant="ghost" onClick={handleSignOut} className="text-xs">
                        <LogOut className="w-4 h-4 mr-2" /> DISCONNECT
                    </TerminalButton>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Projects (Prompt Builder) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                <Code className="w-5 h-5" /> ACTIVE_PROJECTS
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCreateProject("WEB_APP")}
                                    className="text-xs border border-green-700 px-2 py-1 hover:bg-green-900/30 transition-colors"
                                >
                                    [+ WEB]
                                </button>
                                <button
                                    onClick={() => handleCreateProject("AGENT")}
                                    className="text-xs border border-green-700 px-2 py-1 hover:bg-green-900/30 transition-colors"
                                >
                                    [+ BOT]
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.length === 0 ? (
                                <div className="col-span-full border border-dashed border-green-900 p-8 text-center text-green-800">
                                    NO_ACTIVE_PROJECTS
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => router.push(`/editor/${project.id}`)}
                                        className="group relative border border-green-900 bg-black p-4 cursor-pointer hover:border-green-500 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-green-300 truncate pr-4">{project.name}</div>
                                            <TerminalBadge variant={project.type === "WEB_APP" ? "info" : "warning"}>
                                                {project.type === "WEB_APP" ? "WEB" : "BOT"}
                                            </TerminalBadge>
                                        </div>
                                        <div className="text-xs text-green-700 mb-4">
                                            LAST_MOD: {formatDate(project.lastModified)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">[ OPEN ]</span>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Column 2: Modules & Learning */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                            <Brain className="w-5 h-5" /> MODULES
                        </h2>

                        <div className="grid gap-4">
                            <ModuleCard
                                title="TOM'S_BRAIN"
                                description="AI-powered learning curriculum generator."
                                href="/learning"
                                icon={<Brain className="w-6 h-6" />}
                                stats={[
                                    { label: "STATUS", value: "ONLINE" },
                                    { label: "VERSION", value: "2.0.4" }
                                ]}
                            />

                            <ModuleCard
                                title="STYLE_EXTRACTOR"
                                description="Analyze and extract design tokens from images."
                                href="/style-extractor"
                                icon={<Code className="w-6 h-6" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
