import React, { useState, KeyboardEvent } from "react";
import { Label } from "./Label";

interface TagInputProps {
    label: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Type and press Enter...",
}) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
                setInputValue("");
            }
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-2 p-2 bg-black border border-green-700 min-h-[42px]">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 text-sm bg-green-900/30 text-green-400 border border-green-600 font-mono"
                    >
                        [ {tag} ]
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-green-600 hover:text-green-300 font-bold"
                        >
                            x
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent text-green-500 placeholder:text-green-900 focus:outline-none min-w-[120px] font-mono text-sm"
                />
            </div>
            <p className="text-[10px] text-green-800 uppercase tracking-wider">
                {"//"} Press ENTER or COMMA to add tag
            </p>
        </div>
    );
};
