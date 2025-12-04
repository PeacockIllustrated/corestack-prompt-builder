import React, { useState } from "react";
import { Label } from "./Label";
import { Input } from "./Input";
import { Button } from "./Button";

export interface EnvVar {
    id: string;
    key: string;
    value: string;
}

interface EnvVarInputProps {
    label: string;
    value: EnvVar[];
    onChange: (envVars: EnvVar[]) => void;
}

export const EnvVarInput: React.FC<EnvVarInputProps> = ({
    label,
    value,
    onChange,
}) => {
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    const handleAdd = () => {
        if (!newKey.trim()) return;

        onChange([
            ...value,
            {
                id: Math.random().toString(36).substr(2, 9),
                key: newKey.trim(),
                value: newValue.trim(),
            },
        ]);
        setNewKey("");
        setNewValue("");
    };

    const handleRemove = (id: string) => {
        onChange(value.filter((item) => item.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            <div className="border border-green-800 bg-black p-2 min-h-[100px] max-h-[200px] overflow-y-auto custom-scrollbar">
                {value.length === 0 ? (
                    <div className="text-green-900 text-sm italic p-2">
                        {"//"} No environment variables yet. Add one below.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_2fr_auto] gap-2 pb-1 border-b border-green-800 text-xs text-green-600 font-mono">
                            <div>KEY</div>
                            <div>VALUE</div>
                            <div className="w-12"></div>
                        </div>

                        {/* Rows */}
                        {value.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center group"
                            >
                                <div className="font-mono text-xs text-green-400 truncate">
                                    {item.key}
                                </div>
                                <div className="font-mono text-xs text-green-500 truncate">
                                    {item.value}
                                </div>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="text-xs text-green-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                                >
                                    [DEL]
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <Input
                    placeholder="KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-xs font-mono uppercase"
                />
                <Input
                    placeholder="value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-xs font-mono"
                />
                <Button type="button" onClick={handleAdd} variant="secondary">
                    [ + ADD ]
                </Button>
            </div>

            <p className="text-[10px] text-yellow-600 mt-1 px-1">
                ⚠️ Only add NON-SECRET values (public keys, URLs). Secrets will be added to .env.local later.
            </p>
        </div>
    );
};
