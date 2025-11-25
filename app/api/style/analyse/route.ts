import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StyleSystem, RawStyleObservation } from "@/lib/style/types";
import { buildStylePrompt, TargetPlatform } from "@/lib/style/buildStylePrompt";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, targetPlatform, source } = body as {
            mode: "css" | "description";
            targetPlatform: TargetPlatform;
            source: string;
        };

        if (!source) {
            return NextResponse.json({ error: "Source is required" }, { status: 400 });
        }

        // 1. Parse raw input (Simplified for now, relying heavily on LLM)
        let rawObservation: Partial<RawStyleObservation> | string = source;

        if (mode === "css") {
            // Basic extraction could go here (regex for hex codes, etc.)
            // For now, we'll pass the raw CSS/TSX to the LLM to parse and structure
            rawObservation = source;
        }

        // 2. Canonicalise into StyleSystem using LLM
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
      You are an expert design system engineer.
      Your task is to analyze the following input and extract a strict design system.
      
      Input Mode: ${mode}
      Input Data:
      \`\`\`
      ${source.slice(0, 10000)} // Truncate to avoid token limits if necessary
      \`\`\`

      Output must be a valid JSON object matching this TypeScript interface:
      
      interface StyleSystem {
        colors: {
          primary: string;
          primarySoft?: string; // lighter/softer version of primary
          accent?: string;
          background: string;
          surface?: string; // card/panel background
          border?: string;
          text: string;
          mutedText?: string;
          success?: string;
          error?: string;
        };
        typography: {
          fontFamilyBase: string;
          fontFamilyHeading?: string;
          scale: {
            h1?: { size: string; weight: number; lineHeight: number | string };
            h2?: { size: string; weight: number; lineHeight: number | string };
            h3?: { size: string; weight: number; lineHeight: number | string };
            body: { size: string; weight: number; lineHeight: number | string };
            small?: { size: string; weight: number; lineHeight: number | string };
          };
        };
        spacingScale: number[]; // e.g. [4, 8, 12, 16, 24]
        radius?: {
          button?: string;
          card?: string;
          input?: string;
          chip?: string;
        };
        components: {
          name: string;
          variants?: string[];
          description: string;
          usage?: string;
        }[];
        principles: string[];
      }

      RULES:
      1. Extract specific hex codes or values from the input.
      2. If values are missing, INFER reasonable defaults based on the aesthetic described or implied (e.g. if "dark mode" is mentioned, use dark backgrounds).
      3. Cluster similar colors. Pick ONE primary, ONE background, etc.
      4. Return ONLY the JSON object. No markdown formatting, no code blocks.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up potential markdown code blocks
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let styleSystem: StyleSystem;
        try {
            styleSystem = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse LLM response:", responseText);
            return NextResponse.json({ error: "Failed to generate valid JSON style system" }, { status: 500 });
        }

        // 3. Build style prompt
        const stylePrompt = buildStylePrompt(styleSystem, targetPlatform);

        return NextResponse.json({ styleSystem, stylePrompt });

    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
