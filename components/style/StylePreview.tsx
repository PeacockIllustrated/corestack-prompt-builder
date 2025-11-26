import React, { useState } from "react";
import { StyleSystem } from "@/lib/style/types";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface StylePreviewProps {
    system: StyleSystem;
    originalImage?: string | null;
}

type Tab = "colors" | "typography" | "components" | "image";

export function StylePreview({ system, originalImage }: StylePreviewProps) {
    const [activeTab, setActiveTab] = useState<Tab>("colors");
    const { colors, typography, radius, spacingScale, components = [] } = system;

    // Helper to get a spacing value safely
    const getSpacing = (index: number) => `${spacingScale[index] || 8}px`;

    // Helper to check if a component exists in the system
    const getComponent = (name: string) => components.find(c => c.name.toLowerCase() === name.toLowerCase());

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-green-800 pb-2 overflow-x-auto">
                {(["colors", "typography", "components", "image"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab
                                ? "bg-green-600 text-black"
                                : "text-green-600 hover:bg-green-900/30"
                            }`}
                    >
                        [{tab.toUpperCase()}]
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">

                {/* 1. Color Palette */}
                {activeTab === "colors" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                        {Object.entries(colors).map(([key, value]) => (
                            value && (
                                <div key={key} className="space-y-2 group">
                                    <div
                                        className="h-24 w-full rounded-md border border-white/10 shadow-sm group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: value }}
                                    />
                                    <div className="text-xs font-mono">
                                        <div className="text-green-300 font-bold uppercase">{key}</div>
                                        <div className="text-green-600/80 select-all">{value}</div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* 2. Typography Preview */}
                {activeTab === "typography" && (
                    <Card className="p-8 space-y-8 bg-black/40 border-green-900/50 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                            <Label className="text-green-500 text-xs uppercase">Headings ({typography.fontFamilyHeading || "Inherit"})</Label>
                            <div style={{ fontFamily: typography.fontFamilyHeading || typography.fontFamilyBase }}>
                                <h1 style={{
                                    fontSize: typography.scale.h1?.size || "2.5rem",
                                    fontWeight: typography.scale.h1?.weight || 700,
                                    color: colors.text,
                                    lineHeight: 1.2
                                }}>
                                    The Quick Brown Fox
                                </h1>
                                <h2 style={{
                                    fontSize: typography.scale.h2?.size || "2rem",
                                    fontWeight: typography.scale.h2?.weight || 600,
                                    color: colors.text,
                                    opacity: 0.9,
                                    marginTop: "0.5rem"
                                }}>
                                    Jumps Over The Lazy Dog
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <Label className="text-green-500 text-xs uppercase">Body ({typography.fontFamilyBase})</Label>
                            <p style={{
                                fontFamily: typography.fontFamilyBase,
                                fontSize: typography.scale.body.size,
                                lineHeight: typography.scale.body.lineHeight,
                                color: colors.text,
                                opacity: 0.8,
                                maxWidth: "65ch"
                            }}>
                                This is a sample of the body text. Good typography is invisible; it allows the reader to focus on the content without distraction.
                                The extracted system uses <strong>{typography.fontFamilyBase}</strong> for optimal readability.
                            </p>
                        </div>
                    </Card>
                )}

                {/* 3. Components Analysis */}
                {activeTab === "components" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                        {["Button", "Card", "Input", "Navbar", "Modal", "Alert"].map((compName) => (
                            <ComponentCard
                                key={compName}
                                name={compName}
                                system={system}
                                detected={getComponent(compName)}
                            />
                        ))}
                    </div>
                )}

                {/* 4. Original Image */}
                {activeTab === "image" && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300 flex justify-center">
                        {originalImage ? (
                            <img
                                src={originalImage}
                                alt="Original Analysis Source"
                                className="max-w-full max-h-[500px] rounded-lg border border-green-900/50 shadow-2xl"
                            />
                        ) : (
                            <div className="text-green-700 italic py-12 text-center border border-dashed border-green-900 w-full rounded-lg">
                                [ NO_IMAGE_SOURCE_PROVIDED ]
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

// --- Sub-component for individual component cards ---

function ComponentCard({ name, system, detected }: { name: string, system: StyleSystem, detected?: any }) {
    const [showAuto, setShowAuto] = useState(!detected);
    const { colors, radius, spacingScale } = system;
    const getSpacing = (index: number) => `${spacingScale[index] || 8}px`;

    return (
        <div className="border border-green-900/50 rounded-lg overflow-hidden bg-black/20 flex flex-col">
            <div className="bg-green-900/10 p-3 border-b border-green-900/30 flex justify-between items-center">
                <span className="font-bold text-sm text-green-400">{name}</span>
                <div className="flex items-center gap-2">
                    {detected ? (
                        <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-700">DETECTED</span>
                    ) : (
                        <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-0.5 rounded-full border border-red-900/30">MISSING</span>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[140px] relative bg-[url('/grid.svg')] bg-center">
                {/* Background for contrast */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: colors.background }}
                />

                <div className="relative z-10 w-full flex justify-center">
                    {/* RENDER LOGIC */}
                    {name === "Button" && (
                        <button style={{
                            backgroundColor: colors.primary,
                            color: colors.background, // simplistic contrast assumption
                            padding: `${getSpacing(2)} ${getSpacing(4)}`,
                            borderRadius: radius?.button || "4px",
                            fontWeight: 600,
                            border: "none"
                        }}>
                            {detected ? "Detected Button" : "Auto-Generated"}
                        </button>
                    )}

                    {name === "Card" && (
                        <div style={{
                            backgroundColor: colors.surface || "#222",
                            padding: getSpacing(4),
                            borderRadius: radius?.card || "8px",
                            border: `1px solid ${colors.border || "transparent"}`,
                            boxShadow: system.shadows?.card || "none",
                            width: "80%"
                        }}>
                            <div style={{ height: "10px", width: "40%", backgroundColor: colors.text, opacity: 0.2, marginBottom: "8px", borderRadius: "2px" }} />
                            <div style={{ height: "8px", width: "80%", backgroundColor: colors.text, opacity: 0.1, borderRadius: "2px" }} />
                        </div>
                    )}

                    {name === "Input" && (
                        <input
                            type="text"
                            placeholder="Type here..."
                            disabled
                            style={{
                                backgroundColor: colors.surface || "transparent",
                                border: `1px solid ${colors.border || "#444"}`,
                                borderRadius: radius?.input || "4px",
                                padding: getSpacing(2),
                                color: colors.text,
                                width: "80%"
                            }}
                        />
                    )}

                    {name === "Navbar" && (
                        <div style={{
                            width: "100%",
                            height: "40px",
                            backgroundColor: colors.surface || "#111",
                            borderBottom: `1px solid ${colors.border || "#333"}`,
                            display: "flex",
                            alignItems: "center",
                            padding: `0 ${getSpacing(2)}`,
                            gap: getSpacing(2)
                        }}>
                            <div style={{ width: "20px", height: "20px", backgroundColor: colors.primary, borderRadius: "50%" }} />
                            <div style={{ width: "60px", height: "8px", backgroundColor: colors.text, opacity: 0.3, borderRadius: "2px" }} />
                        </div>
                    )}

                    {name === "Modal" && (
                        <div style={{
                            backgroundColor: colors.surface || "#222",
                            padding: getSpacing(4),
                            borderRadius: radius?.card || "8px",
                            border: `1px solid ${colors.border || "transparent"}`,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            width: "70%",
                            textAlign: "center"
                        }}>
                            <h4 style={{ color: colors.text, marginBottom: getSpacing(2), fontSize: "0.9rem" }}>Confirm Action</h4>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <div style={{ width: "40%", height: "24px", backgroundColor: colors.primary, borderRadius: radius?.button || "4px", opacity: 0.8 }} />
                                <div style={{ width: "40%", height: "24px", backgroundColor: "transparent", border: `1px solid ${colors.border}`, borderRadius: radius?.button || "4px" }} />
                            </div>
                        </div>
                    )}

                    {name === "Alert" && (
                        <div style={{
                            backgroundColor: colors.primarySoft || colors.surface,
                            borderLeft: `4px solid ${colors.primary}`,
                            padding: getSpacing(3),
                            borderRadius: radius?.card || "4px",
                            width: "90%",
                            display: "flex",
                            alignItems: "center",
                            gap: getSpacing(2)
                        }}>
                            <div style={{ width: "16px", height: "16px", backgroundColor: colors.primary, borderRadius: "50%" }} />
                            <div style={{ height: "6px", width: "70%", backgroundColor: colors.text, opacity: 0.4, borderRadius: "2px" }} />
                        </div>
                    )}

                </div>
            </div>

            {/* Description / Toggle */}
            <div className="p-3 bg-black/40 border-t border-green-900/30 text-[10px] text-green-600/70 font-mono">
                {detected ? (
                    <div>
                        <p className="mb-1 text-green-400">"{detected.description}"</p>
                        <p>Variants: {detected.variants?.join(", ")}</p>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <span>Not found in source.</span>
                        <span className="text-green-500">Auto-Generated Preview</span>
                    </div>
                )}
            </div>
        </div>
    )
}
