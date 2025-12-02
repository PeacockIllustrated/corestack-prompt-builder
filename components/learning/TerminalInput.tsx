import React from "react";

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function TerminalInput({ label, className = "", ...props }: TerminalInputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-green-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-green-500">{">"}</span>
                <input
                    className={`w-full border border-green-900 bg-black py-2 pl-8 pr-4 font-mono text-green-500 placeholder-green-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${className}`}
                    spellCheck={false}
                    {...props}
                />
                <div className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-green-900" />
            </div>
        </div>
    );
}
