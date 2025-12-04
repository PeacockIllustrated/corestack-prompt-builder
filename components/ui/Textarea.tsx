import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`
          w-full bg-black text-green-500 border border-green-700 
          px-3 py-2 text-sm font-mono
          placeholder:text-green-900
          focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
          disabled:cursor-not-allowed disabled:opacity-50
          min-h-[80px]
          ${className}
        `}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
