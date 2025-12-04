import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`
          w-full bg-black text-green-500 border border-green-700 
          px-3 py-2 text-sm font-mono
          placeholder:text-green-900
          focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
