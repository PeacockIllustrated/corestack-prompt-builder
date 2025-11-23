import React from "react";

interface ASCIIRadioProps {
    label: string;
    checked: boolean;
    onClick: () => void;
    className?: string;
}

export const ASCIIRadio: React.FC<ASCIIRadioProps> = ({
    label,
    checked,
    onClick,
    className = ""
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 cursor-pointer text-xs font-mono transition-colors ${checked ? "text-green-400" : "text-green-800 hover:text-green-600"
                } ${className}`}
        >
            <span className="whitespace-pre">{checked ? "[ X ]" : "[   ]"}</span>
            <span>{label}</span>
        </button>
    );
};
