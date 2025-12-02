import React from "react";

interface TerminalCardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function TerminalCard({ title, children, className = "" }: TerminalCardProps) {
    return (
        <div className={`relative border border-green-900 bg-black p-4 font-mono text-green-500 ${className}`}>
            {/* Corner Accents */}
            <div className="absolute -left-[1px] -top-[1px] h-2 w-2 border-l border-t border-green-500" />
            <div className="absolute -right-[1px] -top-[1px] h-2 w-2 border-r border-t border-green-500" />
            <div className="absolute -bottom-[1px] -left-[1px] h-2 w-2 border-b border-l border-green-500" />
            <div className="absolute -bottom-[1px] -right-[1px] h-2 w-2 border-b border-r border-green-500" />

            {title && (
                <div className="absolute -top-3 left-4 bg-black px-2 text-sm font-bold uppercase tracking-widest text-green-500">
                    [{title}]
                </div>
            )}

            {children}
        </div>
    );
}
