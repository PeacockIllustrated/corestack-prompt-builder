"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { ASCIIRadio } from "@/components/ui/ASCIIRadio";
import { useStyleContext } from "@/lib/style/StyleContext";
import { StyleSystem } from "@/lib/style/types";
import { TargetPlatform } from "@/lib/style/buildStylePrompt";
import { StylePreview } from "@/components/style/StylePreview";

export default function StyleExtractorPage() {
    const router = useRouter();
    const { setStyle } = useStyleContext();

    const [mode, setMode] = useState<"css" | "description" | "image">("css");
    const [source, setSource] = useState("");
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>("generic");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [result, setResult] = useState<{
        styleSystem: StyleSystem;
        stylePrompt: string;
    } | null>(null);

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.8));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resized = await resizeImage(file);
                setImageFile(resized);
            } catch (err) {
                console.error("Failed to resize image", err);
                alert("Failed to process image");
            }
        }
    };

    const handleAnalyze = async () => {
        if (mode !== "image" && !source.trim()) return;
        if (mode === "image" && !imageFile) return;

        setIsAnalyzing(true);
        try {
            const payload = {
                mode,
                source: mode === "image" ? imageFile : source,
                targetPlatform
            };
            console.log("Sending payload size:", JSON.stringify(payload).length);

            const res = await fetch("/api/style/analyse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("API Error Details:", errorData);
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await res.json();
            setResult(data);
        } catch (error: any) {
            console.error("Analysis Error:", error);

            // Try to parse the error response if available
            let errorMessage = "Failed to analyze style. Please try again.";
            if (error.message) errorMessage = error.message;

            // If we have a debug object from the API (we need to catch this from the fetch response)
            // Ideally, we should handle the non-ok response better above.

            alert(`Analysis Error: ${errorMessage}\n\nCheck console for full debug details.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSetActive = () => {
        if (result) {
            setStyle(result.styleSystem, result.stylePrompt);
            alert("Style System Activated! It will be used in Prompt Builder.");
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="border-b border-green-800 pb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-glow">
                            &gt; STYLE_EXTRACTOR_
                        </h1>
                        <p className="text-green-700 mt-2 text-sm md:text-base font-mono">
              // Turn CSS/Descriptions/Images into strict design systems
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                        [ &lt; BACK_TO_DASHBOARD ]
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Inputs */}
                    <div className="space-y-8">
                        <section className="space-y-6">
                            <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
                                [1] INPUT SOURCE
                            </h2>

                            <div>
                                <Label>Input Mode</Label>
                                <div className="flex gap-4 mt-2 flex-wrap">
                                    <ASCIIRadio
                                        label="CSS / TSX"
                                        checked={mode === "css"}
                                        onClick={() => setMode("css")}
                                    />
                                    <ASCIIRadio
                                        label="Description Only"
                                        checked={mode === "description"}
                                        onClick={() => setMode("description")}
                                    />
                                    <ASCIIRadio
                                        label="Image Upload"
                                        checked={mode === "image"}
                                        onClick={() => setMode("image")}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>
                                    {mode === "css" ? "Paste CSS / Tailwind / TSX" : mode === "description" ? "Describe the Design" : "Upload Screenshot / Mockup"}
                                </Label>
                                {mode === "image" ? (
                                    <div className="border border-green-800 border-dashed bg-green-900/10 p-8 text-center rounded-sm hover:bg-green-900/20 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-2 pointer-events-none">
                                            <div className="text-green-500 font-bold text-lg">[ DROP_IMAGE_HERE ]</div>
                                            <div className="text-green-700 text-xs">or click to select file</div>
                                            {imageFile && (
                                                <div className="mt-4 text-green-400 text-xs break-all">
                                                    Selected: [IMAGE_DATA_LOADED]
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <Textarea
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        placeholder={
                                            mode === "css"
                                                ? ".btn { background: #000; } \n<div className='p-4 bg-red-500'>..."
                                                : "A dark cyberpunk theme with neon green accents, sharp corners, and monospace fonts..."
                                        }
                                        rows={12}
                                        className="font-mono text-xs"
                                    />
                                )}
                            </div>

                            <div>
                                <Label>Target Platform</Label>
                                <div className="flex gap-4 mt-2 flex-wrap">
                                    {(["lovable", "vibe", "cursor", "generic"] as const).map((p) => (
                                        <ASCIIRadio
                                            key={p}
                                            label={p.toUpperCase()}
                                            checked={targetPlatform === p}
                                            onClick={() => setTargetPlatform(p)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || (mode === "image" ? !imageFile : !source.trim())}
                                className="w-full"
                            >
                                {isAnalyzing ? "[ ANALYZING... ]" : "[ ANALYZE_STYLE ]"}
                            </Button>
                        </section>
                    </div>

                    {/* RIGHT: Outputs */}
                    <div className="space-y-8">
                        <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
                            [2] GENERATED SYSTEM
                        </h2>

                        {result ? (
                            <div className="space-y-8 animate-in fade-in duration-500">

                                {/* Visual Preview */}
                                <Card className="p-0 overflow-hidden border-green-600/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                    <div className="bg-green-900/20 p-3 border-b border-green-800 flex justify-between items-center">
                                        <span className="text-sm font-bold text-green-400 pl-2 tracking-wider">
                                            [ VISUAL_PREVIEW ]
                                        </span>
                                    </div>
                                    <div className="p-0 bg-black/50">
                                        <StylePreview
                                            system={result.styleSystem}
                                            originalImage={mode === "image" ? imageFile : null}
                                        />
                                    </div>
                                </Card>

                                <div className="grid grid-cols-1 gap-4">
                                    <Card className="p-0 overflow-hidden flex flex-col max-h-[200px]">
                                        <div className="bg-green-900/20 p-2 border-b border-green-800 flex justify-between items-center">
                                            <span className="text-xs font-mono text-green-400 pl-2">
                                                style_prompt.md
                                            </span>
                                            <Button
                                                onClick={() => navigator.clipboard.writeText(result.stylePrompt)}
                                                variant="secondary"
                                                className="text-xs h-7"
                                            >
                                                [ COPY_PROMPT ]
                                            </Button>
                                        </div>
                                        <div className="p-4 overflow-y-auto custom-scrollbar bg-black">
                                            <pre className="whitespace-pre-wrap font-mono text-xs text-green-500/90 leading-relaxed">
                                                {result.stylePrompt}
                                            </pre>
                                        </div>
                                    </Card>

                                    <Card className="p-0 overflow-hidden flex flex-col max-h-[200px]">
                                        <div className="bg-green-900/20 p-2 border-b border-green-800 flex justify-between items-center">
                                            <span className="text-xs font-mono text-green-400 pl-2">
                                                system.json
                                            </span>
                                            <Button
                                                onClick={() => navigator.clipboard.writeText(JSON.stringify(result.styleSystem, null, 2))}
                                                variant="secondary"
                                                className="text-xs h-7"
                                            >
                                                [ COPY_JSON ]
                                            </Button>
                                        </div>
                                        <div className="p-4 overflow-y-auto custom-scrollbar bg-black">
                                            <pre className="whitespace-pre-wrap font-mono text-xs text-green-600/80">
                                                {JSON.stringify(result.styleSystem, null, 2)}
                                            </pre>
                                        </div>
                                    </Card>
                                </div>

                                <div className="pt-4 border-t border-green-800">
                                    <Button onClick={handleSetActive} className="w-full">
                                        [ SET_AS_ACTIVE_SYSTEM ]
                                    </Button>
                                    <p className="text-center text-green-700 text-xs mt-2">
                                        // This will apply the style to all new prompts generated in this session
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-green-800 space-y-4 opacity-50 min-h-[400px] border border-green-900 border-dashed rounded-sm">
                                <div className="text-4xl">Waiting for Input...</div>
                                <div>[ NO_DATA_GENERATED ]</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
