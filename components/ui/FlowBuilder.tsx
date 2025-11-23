import React, { useState } from "react";
import { Label } from "./Label";
import { Button } from "./Button";
import { Input } from "./Input";

interface FlowBuilderProps {
    label: string;
    value: string[]; // Array of flow strings (e.g. "Step 1 -> Step 2")
    onChange: (flows: string[]) => void;
}

export const FlowBuilder: React.FC<FlowBuilderProps> = ({
    label,
    value,
    onChange,
}) => {
    // We'll manage editing a specific flow in a local state before "committing" it to the string array
    const [activeFlowSteps, setActiveFlowSteps] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [stepInput, setStepInput] = useState("");

    const addStep = () => {
        if (stepInput.trim()) {
            setActiveFlowSteps([...activeFlowSteps, stepInput.trim()]);
            setStepInput("");
        }
    };

    const removeStep = (index: number) => {
        setActiveFlowSteps(activeFlowSteps.filter((_, i) => i !== index));
    };

    const saveFlow = () => {
        if (activeFlowSteps.length > 0) {
            const flowString = activeFlowSteps.join(" -> ");
            onChange([...value, flowString]);
            setActiveFlowSteps([]);
            setIsEditing(false);
        }
    };

    const deleteFlow = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const cancelEdit = () => {
        setActiveFlowSteps([]);
        setStepInput("");
        setIsEditing(false);
    };

    return (
        <div className="space-y-4">
            <Label>{label}</Label>

            {/* Existing Flows List */}
            <div className="space-y-3">
                {value.map((flow, index) => (
                    <div key={index} className="relative group p-3 border border-green-800 bg-green-900/5">
                        <div className="text-sm font-mono text-green-400 break-words leading-relaxed">
                            <span className="text-green-700 mr-2">#{index + 1}</span>
                            {flow.split(" -> ").map((step, i, arr) => (
                                <span key={i}>
                                    <span className="inline-block border border-green-600 px-1.5 py-0.5 text-xs text-green-300 bg-black">
                                        {step}
                                    </span>
                                    {i < arr.length - 1 && (
                                        <span className="mx-1 text-green-600">--&gt;</span>
                                    )}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => deleteFlow(index)}
                            className="absolute top-2 right-2 text-xs text-green-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            [DELETE]
                        </button>
                    </div>
                ))}
            </div>

            {/* Editor Area */}
            {!isEditing ? (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    className="w-full border-dashed opacity-70 hover:opacity-100"
                >
                    [ + NEW_FLOW ]
                </Button>
            ) : (
                <div className="border border-green-500 p-4 bg-black relative">
                    <Label className="text-green-400 mb-2 block">Building Flow...</Label>

                    {/* Visual Chain Preview */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[40px]">
                        {activeFlowSteps.length === 0 && (
                            <span className="text-green-900 text-sm italic">// Add steps below...</span>
                        )}
                        {activeFlowSteps.map((step, i) => (
                            <React.Fragment key={i}>
                                <div className="group relative">
                                    <span className="inline-block border border-green-400 px-2 py-1 text-sm bg-green-900/20 text-green-300">
                                        {step}
                                    </span>
                                    <button
                                        onClick={() => removeStep(i)}
                                        className="absolute -top-2 -right-2 bg-black text-red-500 text-xs border border-red-900 px-1 hover:border-red-500"
                                    >
                                        x
                                    </button>
                                </div>
                                {i < activeFlowSteps.length && (
                                    <span className="text-green-500 font-bold">--&gt;</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2 mb-4">
                        <Input
                            value={stepInput}
                            onChange={(e) => setStepInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
                            placeholder="Next step (e.g. 'User logs in')"
                            autoFocus
                        />
                        <Button type="button" onClick={addStep} variant="secondary">
                            [ ADD_STEP ]
                        </Button>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-green-900 pt-3">
                        <Button type="button" variant="secondary" onClick={cancelEdit}>
                            [ CANCEL ]
                        </Button>
                        <Button type="button" onClick={saveFlow} disabled={activeFlowSteps.length === 0}>
                            [ SAVE_FLOW ]
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
