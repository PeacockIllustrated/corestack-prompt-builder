import React from "react";
import { Loader2 } from "lucide-react";

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "danger" | "ghost";
    isLoading?: boolean;
}

export function TerminalButton({
    children,
    variant = "primary",
    isLoading,
    className = "",
    disabled,
    ...props
}: TerminalButtonProps) {
    const baseStyles = "group relative inline-flex items-center justify-center px-6 py-2 font-mono text-sm uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border border-green-500 text-green-500 hover:bg-green-500 hover:text-black",
        danger: "border border-red-500 text-red-500 hover:bg-red-500 hover:text-black",
        ghost: "text-green-500 hover:bg-green-900/20",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    PROCESSING...
                </span>
            ) : (
                <>
                    <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">[</span>
                    {children}
                    <span className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">]</span>
                </>
            )}
        </button>
    );
}
