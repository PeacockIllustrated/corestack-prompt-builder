import React, { useState } from "react";
import { Label } from "./Label";
import { Button } from "./Button";
import { Input } from "./Input";

interface ListInputProps {
    label: string;
    value: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}

export const ListInput: React.FC<ListInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Add item...",
}) => {
    const [newItem, setNewItem] = useState("");

    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...value, newItem.trim()]);
            setNewItem("");
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                        <div className="flex-1 px-3 py-2 text-sm font-mono bg-green-900/10 border border-green-800 text-green-400">
                            {item}
                        </div>
                        <button
                            onClick={() => handleRemove(index)}
                            className="text-green-700 hover:text-red-500 font-mono px-2 opacity-50 group-hover:opacity-100 transition-opacity"
                        >
                            [DEL]
                        </button>
                    </div>
                ))}

                <div className="flex gap-2">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleAdd} variant="secondary" className="px-3">
                        [ + ]
                    </Button>
                </div>
            </div>
        </div>
    );
};
