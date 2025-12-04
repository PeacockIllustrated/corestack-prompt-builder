import React, { useState } from "react";
import { Label } from "./Label";
import { Button } from "./Button";
import { Input } from "./Input";

export interface DesignSystem {
    colorPalette: string;
    borderRadius: "square" | "rounded" | "pill";
    spacing: "tight" | "comfy" | "airy";
    shadows: "flat" | "soft" | "hard";
    buttonStyle: "solid" | "outline" | "ghost";
    cardStyle: "border" | "elevated" | "flat";
    navigationStyle: "sticky" | "floating" | "sidebar";
    mobileFirst: boolean;
}

interface DesignSystemBuilderProps {
    value: DesignSystem;
    onChange: (value: DesignSystem) => void;
}

const PALETTES = [
    { id: "monochrome", name: "MONOCHROME", colors: ["#000000", "#ffffff", "#333333"] },
    { id: "cyberpunk", name: "CYBERPUNK", colors: ["#000000", "#00ff00", "#ff00ff"] },
    { id: "pastel", name: "PASTEL", colors: ["#ffb7b2", "#dac4f7", "#b5ead7"] },
    { id: "corporate", name: "CORPORATE", colors: ["#0f172a", "#3b82f6", "#64748b"] },
    { id: "forest", name: "FOREST", colors: ["#1a2e1a", "#4ade80", "#166534"] },
];

const ASCIISlider = ({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (val: string) => void;
}) => {
    const currentIndex = options.findIndex((o) => o.value === value);

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-end">
                <span className="text-xs font-mono text-green-600 uppercase">{label}</span>
                <span className="text-xs font-mono text-green-400">[{options[currentIndex]?.label}]</span>
            </div>
            <div className="flex items-center gap-1 select-none">
                {options.map((opt, idx) => (
                    <React.Fragment key={opt.value}>
                        <button
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`
                h-6 px-2 text-[10px] font-mono border transition-all
                ${value === opt.value
                                    ? "bg-green-900 border-green-500 text-green-100"
                                    : "bg-black border-green-900 text-green-700 hover:border-green-700 hover:text-green-500"}
              `}
                        >
                            {opt.label}
                        </button>
                        {idx < options.length - 1 && (
                            <span className="text-green-900 text-[10px]">--</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export const DesignSystemBuilder: React.FC<DesignSystemBuilderProps> = ({
    value,
    onChange,
}) => {
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);

        try {
            // In a real implementation, this would call the API
            // For now, we'll simulate a response based on keywords
            await new Promise(resolve => setTimeout(resolve, 1500));

            const lowerPrompt = aiPrompt.toLowerCase();
            const newSystem = { ...value };

            if (lowerPrompt.includes("dark") || lowerPrompt.includes("hacker")) {
                newSystem.colorPalette = "monochrome";
                newSystem.shadows = "flat";
                newSystem.borderRadius = "square";
            } else if (lowerPrompt.includes("soft") || lowerPrompt.includes("friendly")) {
                newSystem.colorPalette = "pastel";
                newSystem.borderRadius = "pill";
                newSystem.shadows = "soft";
            } else if (lowerPrompt.includes("business") || lowerPrompt.includes("clean")) {
                newSystem.colorPalette = "corporate";
                newSystem.borderRadius = "rounded";
                newSystem.spacing = "comfy";
            }

            onChange(newSystem);
        } catch (error) {
            console.error("Style Magic Error:", error);
        } finally {
            setIsGenerating(false);
            setAiPrompt("");
        }
    };

    const updateField = (key: keyof DesignSystem, val: string | boolean) => {
        onChange({ ...value, [key]: val });
    };

    return (
        <div className="space-y-6">
            {/* Style Magic AI */}
            <div className="border border-green-800 bg-green-900/5 p-3 rounded-sm">
                <Label className="text-green-400 mb-2 block text-xs">🎨 Style Magic AI</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="Describe the vibe (e.g. 'Cyberpunk dashboard', 'Clean corporate SaaS')..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                        className="flex-1 text-xs h-8"
                    />
                    <Button
                        onClick={handleAiGenerate}
                        disabled={isGenerating}
                        variant="secondary"
                        className="h-8 text-xs"
                    >
                        {isGenerating ? "[ ... ]" : "[ GEN ]"}
                    </Button>
                </div>
            </div>

            {/* Color Palette */}
            <div>
                <Label className="mb-2 block">Color Palette</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PALETTES.map((palette) => (
                        <button
                            key={palette.id}
                            type="button"
                            onClick={() => updateField("colorPalette", palette.id)}
                            className={`
                flex items-center gap-2 p-2 border text-left transition-all
                ${value.colorPalette === palette.id
                                    ? "border-green-500 bg-green-900/20"
                                    : "border-green-900 hover:border-green-700 bg-black"}
              `}
                        >
                            <div className="flex gap-0.5">
                                {palette.colors.map((c) => (
                                    <div key={c} className="w-2 h-4" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                            <span className={`text-xs font-mono ${value.colorPalette === palette.id ? "text-green-300" : "text-green-700"}`}>
                                {value.colorPalette === palette.id ? "[X]" : "[ ]"} {palette.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Vibe Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <ASCIISlider
                    label="Border Radius"
                    value={value.borderRadius}
                    onChange={(v) => updateField("borderRadius", v)}
                    options={[
                        { value: "square", label: "SQUARE" },
                        { value: "rounded", label: "ROUNDED" },
                        { value: "pill", label: "PILL" },
                    ]}
                />

                <ASCIISlider
                    label="Spacing"
                    value={value.spacing}
                    onChange={(v) => updateField("spacing", v)}
                    options={[
                        { value: "tight", label: "TIGHT" },
                        { value: "comfy", label: "COMFY" },
                        { value: "airy", label: "AIRY" },
                    ]}
                />

                <ASCIISlider
                    label="Shadows"
                    value={value.shadows}
                    onChange={(v) => updateField("shadows", v)}
                    options={[
                        { value: "flat", label: "FLAT" },
                        { value: "soft", label: "SOFT" },
                        { value: "hard", label: "HARD" },
                    ]}
                />

                <ASCIISlider
                    label="Button Style"
                    value={value.buttonStyle}
                    onChange={(v) => updateField("buttonStyle", v)}
                    options={[
                        { value: "solid", label: "SOLID" },
                        { value: "outline", label: "OUTLINE" },
                        { value: "ghost", label: "GHOST" },
                    ]}
                />

                <ASCIISlider
                    label="Card Style"
                    value={value.cardStyle}
                    onChange={(v) => updateField("cardStyle", v)}
                    options={[
                        { value: "border", label: "BORDER" },
                        { value: "elevated", label: "ELEVATED" },
                        { value: "flat", label: "FLAT" },
                    ]}
                />

                <ASCIISlider
                    label="Navigation"
                    value={value.navigationStyle}
                    onChange={(v) => updateField("navigationStyle", v)}
                    options={[
                        { value: "sticky", label: "STICKY" },
                        { value: "floating", label: "FLOATING" },
                        { value: "sidebar", label: "SIDEBAR" },
                    ]}
                />
            </div>

            {/* Mobile Strategy */}
            <div>
                <Label className="mb-2 block">Mobile Strategy</Label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => updateField("mobileFirst", true)}
                        className={`text-xs font-mono transition-colors ${value.mobileFirst ? "text-green-400" : "text-green-800 hover:text-green-600"}`}
                    >
                        {value.mobileFirst ? "[ X ]" : "[   ]"} MOBILE_FIRST
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("mobileFirst", false)}
                        className={`text-xs font-mono transition-colors ${!value.mobileFirst ? "text-green-400" : "text-green-800 hover:text-green-600"}`}
                    >
                        {!value.mobileFirst ? "[ X ]" : "[   ]"} DESKTOP_FIRST
                    </button>
                </div>
            </div>
        </div>
    );
};
