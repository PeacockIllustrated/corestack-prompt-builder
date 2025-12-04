import React from "react";
import { TerminalCard } from "@/components/learning/TerminalCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
    title: string;
    description: string;
    href: string;
    icon?: React.ReactNode;
    stats?: { label: string; value: string | number }[];
    children?: React.ReactNode;
}

export function ModuleCard({ title, description, href, icon, stats, children }: ModuleCardProps) {
    return (
        <Link href={href} className="block h-full group">
            <TerminalCard title={title} className="h-full transition-all hover:border-green-400 hover:bg-green-900/10">
                <div className="flex flex-col h-full justify-between space-y-4">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-green-600 font-mono min-h-[40px]">{description}</p>
                            {icon && <div className="text-green-500 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>}
                        </div>

                        {stats && (
                            <div className="grid grid-cols-2 gap-2 my-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="bg-green-900/20 p-2 border border-green-900/50">
                                        <div className="text-[10px] text-green-700 uppercase tracking-wider">{stat.label}</div>
                                        <div className="text-lg font-bold text-green-400 font-mono">{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {children}
                    </div>

                    <div className="flex items-center justify-end text-xs text-green-500 font-bold uppercase tracking-widest group-hover:text-green-300">
                        [ ACCESS_MODULE ] <ArrowRight className="ml-2 h-3 w-3" />
                    </div>
                </div>
            </TerminalCard>
        </Link>
    );
}
