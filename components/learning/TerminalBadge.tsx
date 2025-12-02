import React from "react";

interface TerminalBadgeProps {
    children: React.ReactNode;
    variant?: "success" | "warning" | "error" | "info";
}

export function TerminalBadge({ children, variant = "info" }: TerminalBadgeProps) {
    const variants = {
        success: "text-green-500 border-green-500",
        warning: "text-amber-500 border-amber-500",
        error: "text-red-500 border-red-500",
        info: "text-cyan-500 border-cyan-500",
    };

    return (
        <span className={`inline-block border px-2 py-0.5 font-mono text-xs uppercase ${variants[variant]}`}>
            {children}
        </span>
    );
}
