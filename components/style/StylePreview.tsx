import React from "react";
import { StyleSystem } from "@/lib/style/types";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

interface StylePreviewProps {
    system: StyleSystem;
}

export function StylePreview({ system }: StylePreviewProps) {
    const { colors, typography, radius, spacingScale } = system;

    // Helper to get a spacing value safely
    const getSpacing = (index: number) => `${spacingScale[index] || 8}px`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. Color Palette */}
            <section>
                <Label className="mb-4 block text-green-400">COLOR PALETTE</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(colors).map(([key, value]) => (
                        value && (
                            <div key={key} className="space-y-2">
                                <div
                                    className="h-16 w-full rounded-md border border-white/10 shadow-sm"
                                    style={{ backgroundColor: value }}
                                />
                                <div className="text-xs font-mono">
                                    <div className="text-green-300 font-bold uppercase">{key}</div>
                                    <div className="text-green-600/80">{value}</div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </section>

            {/* 2. Typography Preview */}
            <section>
                <Label className="mb-4 block text-green-400">TYPOGRAPHY</Label>
                <Card className="p-6 space-y-4 bg-black/40 border-green-900/50">
                    <div style={{ fontFamily: typography.fontFamilyHeading || typography.fontFamilyBase }}>
                        <h1 style={{
                            fontSize: typography.scale.h1?.size || "2.5rem",
                            fontWeight: typography.scale.h1?.weight || 700,
                            color: colors.text
                        }}>
                            Heading Level 1
                        </h1>
                        <h2 style={{
                            fontSize: typography.scale.h2?.size || "2rem",
                            fontWeight: typography.scale.h2?.weight || 600,
                            color: colors.text,
                            opacity: 0.9
                        }}>
                            Heading Level 2
                        </h2>
                    </div>
                    <p style={{
                        fontFamily: typography.fontFamilyBase,
                        fontSize: typography.scale.body.size,
                        lineHeight: typography.scale.body.lineHeight,
                        color: colors.text,
                        opacity: 0.8
                    }}>
                        This is body text using the extracted base font family. It demonstrates readability and contrast against the background.
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </Card>
            </section>

            {/* 3. Component Simulation */}
            <section>
                <Label className="mb-4 block text-green-400">COMPONENT SIMULATION</Label>
                <div
                    className="p-8 rounded-lg border border-dashed border-green-900/50"
                    style={{ backgroundColor: colors.background }}
                >
                    <div
                        className="max-w-sm mx-auto p-6 shadow-lg"
                        style={{
                            backgroundColor: colors.surface || "#1a1a1a",
                            borderRadius: radius?.card || "8px",
                            border: `1px solid ${colors.border || "transparent"}`
                        }}
                    >
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 style={{
                                    color: colors.text,
                                    fontFamily: typography.fontFamilyHeading || typography.fontFamilyBase,
                                    fontWeight: 600,
                                    fontSize: "1.25rem"
                                }}>
                                    Card Title
                                </h3>
                                <p style={{ color: colors.mutedText || colors.text, opacity: 0.7, fontSize: "0.875rem" }}>
                                    This card simulates how your extracted styles apply to a real UI component.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    style={{
                                        backgroundColor: colors.primary,
                                        color: colors.background, // Assuming contrast
                                        padding: `${getSpacing(1)} ${getSpacing(3)}`,
                                        borderRadius: radius?.button || "4px",
                                        fontWeight: 600,
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Primary Action
                                </button>
                                <button
                                    style={{
                                        backgroundColor: "transparent",
                                        color: colors.primary,
                                        padding: `${getSpacing(1)} ${getSpacing(3)}`,
                                        borderRadius: radius?.button || "4px",
                                        border: `1px solid ${colors.primary}`,
                                        cursor: "pointer"
                                    }}
                                >
                                    Secondary
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
