import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`
          bg-black border border-green-800 p-6
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";
