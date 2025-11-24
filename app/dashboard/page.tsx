"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage, ProjectMetadata, ProjectType } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setProjects(storage.getAllProjects());
        setIsLoading(false);
    }, []);

    const handleCreateProject = (type: ProjectType) => {
        const id = storage.createId();
        // Initialize empty project
        storage.saveProject(id, {} as any, type, "Untitled Project");
        router.push(`/editor/${id}`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            storage.deleteProject(id);
            setProjects(storage.getAllProjects());
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-8">
                {/* Header */}
                <header className="border-b border-green-800 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-glow">
                            &gt; SYSTEM DASHBOARD_
                        </h1>
                        <p className="text-green-700 mt-2 text-sm md:text-base font-mono">
              // Select a project to load or initialize new sequence
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-green-800">SYSTEM STATUS</div>
                        <div className="text-green-500 font-bold">ONLINE</div>
                    </div>
                </header>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={() => handleCreateProject("WEB_APP")} className="flex-1 md:flex-none">
                        [ + NEW_WEB_APP ]
                    </Button>
                    <Button onClick={() => handleCreateProject("AGENT")} className="flex-1 md:flex-none" variant="secondary">
                        [ + NEW_AGENT ]
                    </Button>
                </div>

                {/* Project List */}
                <Card className="min-h-[400px] p-0 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-green-800 bg-green-900/20 text-xs font-bold text-green-400 uppercase tracking-wider">
                        <div className="col-span-5 md:col-span-4">Project Name</div>
                        <div className="col-span-3 md:col-span-2">Type</div>
                        <div className="col-span-4 md:col-span-3">Last Modified</div>
                        <div className="col-span-12 md:col-span-3 text-right">ID</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {projects.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-green-800 space-y-4 opacity-50">
                                <div className="text-4xl">[-_-]</div>
                                <div>NO_PROJECTS_FOUND</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-green-900/30">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => router.push(`/editor/${project.id}`)}
                                        className="grid grid-cols-12 gap-4 p-4 hover:bg-green-900/10 cursor-pointer group transition-colors items-center"
                                    >
                                        <div className="col-span-5 md:col-span-4 font-bold text-green-300 truncate">
                                            {project.name}
                                        </div>
                                        <div className="col-span-3 md:col-span-2 text-xs">
                                            <span className={`inline-block px-2 py-0.5 border ${project.type === "WEB_APP" ? "border-green-600 text-green-400" : "border-blue-600 text-blue-400"
                                                }`}>
                                                {project.type}
                                            </span>
                                        </div>
                                        <div className="col-span-4 md:col-span-3 text-xs text-green-600 font-mono">
                                            {formatDate(project.lastModified)}
                                        </div>
                                        <div className="col-span-12 md:col-span-3 flex justify-between md:justify-end items-center gap-4">
                                            <span className="text-xs text-green-900 font-mono hidden md:inline">
                                                {project.id.slice(0, 8)}...
                                            </span>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="text-red-900 hover:text-red-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 border border-transparent hover:border-red-900"
                                            >
                                                [ DELETE ]
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </main>
    );
}
