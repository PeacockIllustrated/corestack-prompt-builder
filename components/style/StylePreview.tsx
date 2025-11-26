import React, { useState } from "react";
import { StyleSystem, StyleComponent } from "@/lib/style/types";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface StylePreviewProps {
    system: StyleSystem;
    originalImage?: string | null;
}

type Tab = "colors" | "typography" | "components" | "image";

const COMMON_COMPONENTS = [
    "Button",
    "Card",
    "Input",
    "Navbar",
    "Modal",
    "Alert"
] as const;

export function StylePreview({ system, originalImage }: StylePreviewProps) {
    const { colors, typography, radius, spacingScale } = system;
    const [activeTab, setActiveTab] = useState<Tab>("components");
    const [autoGenState, setAutoGenState] = useState<Record<string, boolean>>({});

    // Helper to get a spacing value safely
    const getSpacing = (index: number) => `${spacingScale[index] || 8}px`;

    const toggleAutoGen = (compName: string) => {
        setAutoGenState(prev => ({ ...prev, [compName]: !prev[compName] }));
    };

    const renderComponentPreview = (compName: string, detected: StyleComponent | undefined) => {
        const isAuto = !detected || autoGenState[compName];

        // Base styles for auto-generation
        const baseStyle = {
            fontFamily: typography.fontFamilyBase,
            borderRadius: radius?.button || "4px",
        };

        if (compName === "Button") {
            return (
                <div className="flex gap-2 items-center justify-center p-4">
                    <button style={{
                        ...baseStyle,
                        backgroundColor: colors.primary,
                        color: colors.background,
                        padding: "8px 16px",
                        border: "none",
                        fontWeight: 600
                    }}>
                        Primary
                    </button>
                    <button style={{
                        ...baseStyle,
                        backgroundColor: "transparent",
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`,
                        padding: "8px 16px",
                        fontWeight: 600
                    }}>
                        Secondary
                    </button>
                </div>
            );
        }

        if (compName === "Card") {
            return (
                <div style={{
                    backgroundColor: colors.surface || "#1a1a1a",
                    borderRadius: radius?.card || "8px",
                    border: `1px solid ${colors.border || "transparent"}`,
                    padding: "16px",
                    maxWidth: "300px",
                    width: "100%"
                }}>
                    <h3 style={{ color: colors.text, fontWeight: 600, marginBottom: "8px" }}>Card Title</h3>
                    <p style={{ color: colors.mutedText || colors.text, opacity: 0.7, fontSize: "0.875rem" }}>
                        This is a card component content area.
                    </p>
                </div>
            );
        }

        if (compName === "Input") {
            return (
                <div className="w-full max-w-xs space-y-2">
                    <label style={{ color: colors.text, fontSize: "0.875rem" }}>Email Address</label>
                    <input
                        type="text"
                        placeholder="name@example.com"
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            backgroundColor: "transparent",
                            border: `1px solid ${colors.border || "#333"}`,
                            borderRadius: radius?.input || "4px",
                            color: colors.text,
                            outline: "none"
                        }}
                    />
                </div>
            );
        }

        if (compName === "Navbar") {
            return (
                <div style={{
                    width: "100%",
                    padding: "12px 24px",
                    backgroundColor: colors.surface || "#000",
                    borderBottom: `1px solid ${colors.border || "#333"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ fontWeight: 700, color: colors.primary }}>LOGO</div>
                    <div className="flex gap-4 text-sm" style={{ color: colors.text }}>
                        <span>Home</span>
                        <span>About</span>
                        <span>Contact</span>
                    </div>
                </div>
            );
        }

        if (compName === "Alert") {
            return (
                <div style={{
                    padding: "12px 16px",
                    backgroundColor: colors.primary + "20", // 20% opacity approximation
                    borderLeft: `4px solid ${colors.primary}`,
                    color: colors.text,
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <span style={{ color: colors.primary }}>ℹ️</span>
                    <span>This is an important system alert message.</span>
                </div>
            );
        }

        if (compName === "Modal") {
            return (
                <div style={{
                    backgroundColor: colors.surface || "#1a1a1a",
                    borderRadius: radius?.card || "8px",
                    border: `1px solid ${colors.border || "transparent"}`,
                    padding: "24px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    maxWidth: "320px",
                    textAlign: "center"
                }}>
                    <h3 style={{ color: colors.text, fontWeight: 600, marginBottom: "8px" }}>Confirm Action</h3>
                    <p style={{ color: colors.mutedText, fontSize: "0.875rem", marginBottom: "16px" }}>
                        Are you sure you want to proceed with this action?
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button style={{
                            ...baseStyle,
                            backgroundColor: colors.border || "#333",
                            color: colors.text,
                            padding: "6px 12px",
                            border: "none",
                            fontSize: "0.875rem"
                        }}>Cancel</button>
                        <button style={{
                            ...baseStyle,
                            backgroundColor: colors.primary,
                            color: colors.background,
                            padding: "6px 12px",
                            border: "none",
                            fontSize: "0.875rem"
                        }}>Confirm</button>
                    </div>
                </div>
            );
        }

        return <div className="text-gray-500 italic">Preview not available</div>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Tabs */}
            <div className="flex gap-2 border-b border-green-900/50 pb-1 overflow-x-auto">
                {(["components", "colors", "typography", "image"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === tab
                                ? "text-green-400 border-b-2 border-green-500 bg-green-900/10"
                                : "text-green-700 hover:text-green-500 hover:bg-green-900/5"
                            }`}
                    >
                        {tab === "image" ? "Original Image" : tab}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px]">
                {/* 1. COMPONENT ANALYSIS */}
                {activeTab === "components" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {COMMON_COMPONENTS.map(compName => {
                            const detected = system.components.find(c => c.name.toLowerCase() === compName.toLowerCase());
                            const isAuto = !detected || autoGenState[compName];

                            return (
                                <Card key={compName} className="p-0 overflow-hidden border-green-900/30 bg-black/20">
                                    <div className="p-3 border-b border-green-900/30 flex justify-between items-center bg-green-900/10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400 font-bold text-sm">{compName}</span>
                                            {detected ? (
                                                <span className="text-[10px] bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded border border-green-700/50">DETECTED</span>
                                            ) : (
                                                <span className="text-[10px] bg-yellow-900/20 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-900/30">MISSING</span>
                                            )}
                                        </div>
                                        {!detected && (
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-green-600 cursor-pointer">AUTO-GEN</Label>
                                                <input
                                                    type="checkbox"
                                                    checked={!!autoGenState[compName]}
                                                    onChange={() => toggleAutoGen(compName)}
                                                    className="accent-green-500 h-3 w-3"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex items-center justify-center min-h-[120px] bg-[url('/grid.svg')] bg-center">
                                        {(!detected && !autoGenState[compName]) ? (
                                            <div className="text-center space-y-2 opacity-50">
                                                <div className="text-2xl">∅</div>
                                                <div className="text-xs text-green-700">Not detected in source</div>
                                                <Button
                                                    variant="secondary"
                                                    className="h-6 text-[10px]"
                                                    onClick={() => toggleAutoGen(compName)}
                                                >
                                                    [ GENERATE_GUESS ]
                                                </Button>
                                            </div>
                                        ) : (
                                            renderComponentPreview(compName, detected)
                                        )}
                                    </div>

                                    {detected && (
                                        <div className="p-3 border-t border-green-900/30 bg-black/40 text-[10px] text-green-600/80 font-mono">
                                            {detected.description}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* 2. COLOR PALETTE */}
                {activeTab === "colors" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
                        {Object.entries(colors).map(([key, value]) => (
                            value && (
                                <div key={key} className="space-y-2 group">
                                    <div
                                        className="h-24 w-full rounded-md border border-white/10 shadow-sm transition-transform group-hover:scale-105"
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

                {/* 3. TYPOGRAPHY */}
                {activeTab === "typography" && (
                    <Card className="p-8 space-y-8 bg-black/40 border-green-900/50 animate-in slide-in-from-bottom-2 duration-300">
                        <div style={{ fontFamily: typography.fontFamilyHeading || typography.fontFamilyBase }}>
                            <div className="space-y-4 border-b border-green-900/30 pb-8">
                                <span className="text-xs text-green-600 font-mono block mb-2">// HEADINGS ({typography.fontFamilyHeading || "Inherit"})</span>
                                <h1 style={{
                                    fontSize: typography.scale.h1?.size || "2.5rem",
                                    fontWeight: typography.scale.h1?.weight || 700,
                                    color: colors.text
                                }}>
                                    The Quick Brown Fox
                                </h1>
                                <h2 style={{
                                    fontSize: typography.scale.h2?.size || "2rem",
                                    fontWeight: typography.scale.h2?.weight || 600,
                                    color: colors.text,
                                    opacity: 0.9
                                }}>
                                    Jumps Over The Lazy Dog
                                </h2>
                                <h3 style={{
                                    fontSize: typography.scale.h3?.size || "1.5rem",
                                    fontWeight: typography.scale.h3?.weight || 600,
                                    color: colors.text,
                                    opacity: 0.8
                                }}>
                                    Heading Level 3
                                </h3>
                            </div>
                        </div>

                        <div style={{ fontFamily: typography.fontFamilyBase }}>
                            <span className="text-xs text-green-600 font-mono block mb-2">// BODY ({typography.fontFamilyBase})</span>
                            <p style={{
                                fontSize: typography.scale.body.size,
                                lineHeight: typography.scale.body.lineHeight,
                                color: colors.text,
                                opacity: 0.8,
                                maxWidth: "65ch"
                            }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </Card>
                )}

                {/* 4. ORIGINAL IMAGE */}
                {activeTab === "image" && (
                    <div className="flex justify-center animate-in fade-in duration-500">
                        {originalImage ? (
                            <div className="relative rounded-lg overflow-hidden border border-green-900/50 shadow-2xl max-w-full">
                                <img src={originalImage} alt="Original Analysis Source" className="max-h-[600px] object-contain" />
                            </div>
                        ) : (
                            <div className="text-green-700 italic py-12">
                                [ NO_IMAGE_SOURCE_AVAILABLE ]
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
