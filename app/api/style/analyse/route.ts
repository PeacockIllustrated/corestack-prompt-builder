import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StyleSystem } from "@/lib/style/types";
import { buildStylePrompt, TargetPlatform } from "@/lib/style/buildStylePrompt";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key missing. Env vars:", {
        GOOGLE: !!process.env.GOOGLE_API_KEY,
        GEMINI: !!process.env.GEMINI_API_KEY
      });
      return NextResponse.json({ error: "Server configuration error: API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { mode, targetPlatform, source } = body as {
      mode: "css" | "description" | "image";
      targetPlatform: TargetPlatform;
      source: string;
    };

    if (!source) {
      return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }

    // 2. Canonicalise into StyleSystem using LLM
    // Use gemini-2.0-flash-exp as verified by diagnostics
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `
      You are an expert design system engineer.
      Your task is to analyze the following input and extract a strict design system.
      
      Input Mode: ${mode}
      ${mode === "image" ? "Analyze the uploaded image to extract colors, typography, and component styles." : "Input Data:"}
      ${mode !== "image" ? `\`\`\`\n${source.slice(0, 10000)}\n\`\`\`` : ""}

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
      }

      3. 'components' should ONLY include the following if clearly visible or described:
         - "Button"
         - "Card"
         - "Input"
         - "Navbar"
         - "Modal"
         - "Alert"
         For each found component, provide:
         - name: One of the exact names above.
         - variants: List of visible variants (e.g. "primary", "outline").
         - description: Visual description (shape, color, shadow).
         - usage: Brief usage note.

      4. Return ONLY the JSON. No markdown formatting.
    `;

    let result;
    if (mode === "image") {
      if (!source.includes(",")) {
        throw new Error("Invalid image data format");
      }
      const base64Data = source.split(",")[1];
      const mimeType = source.split(";")[0].split(":")[1] || "image/jpeg";

      result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);
    } else {
      result = await model.generateContent(systemPrompt);
    }

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

  } catch (error: any) {
    console.error("Analysis error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
