import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={`
          block text-xs font-bold uppercase tracking-wider text-green-600 mb-1.5
          ${className}
        `}
                {...props}
            >
                {children}
            </label>
        );
    }
);
Label.displayName = "Label";
