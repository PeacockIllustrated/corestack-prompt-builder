import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", children, ...props }, ref) => {
        const baseStyles = "font-mono font-bold text-sm px-4 py-2 uppercase transition-all duration-75 active:translate-y-0.5";

        const variants = {
            primary: "bg-black text-green-500 border border-green-500 hover:bg-green-900 hover:text-green-400",
            secondary: "bg-black text-green-700 border border-green-800 hover:border-green-600 hover:text-green-600",
        };

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variants[variant]}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
