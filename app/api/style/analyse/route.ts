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
    // Use gemini-2.0-flash-exp with JSON mode enforcement
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
      You are an expert design system engineer.
      Your task is to analyze the following input and extract a strict design system.
      
      CRITICAL INSTRUCTION:
      - You must extract the **EXACT** colors found in the image.
      - Do NOT default to a "hacker" (green/black) or "corporate" (blue/white) theme unless the image actually looks like that.
      - If the image has gradients, pick the dominant stops as primary/accent colors.
      - Be precise with hex codes.
      
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
        principles: string[];
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
    try {
      // Try with gemini-2.0-flash-exp first
      if (mode === "image") {
        if (!source.includes(",")) throw new Error("Invalid image data format");
        const base64Data = source.split(",")[1];
        const mimeType = source.split(";")[0].split(":")[1] || "image/jpeg";

        result = await model.generateContent([
          systemPrompt,
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);
      } else {
        result = await model.generateContent(systemPrompt);
      }
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-2.0-flash-exp) failed, attempting fallback to gemini-1.5-pro. Error:", primaryError.message);

      // Fallback to gemini-1.5-pro
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: { responseMimeType: "application/json" }
      });

      if (mode === "image") {
        const base64Data = source.split(",")[1];
        const mimeType = source.split(";")[0].split(":")[1] || "image/jpeg";
        result = await fallbackModel.generateContent([
          systemPrompt,
          { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);
      } else {
        result = await fallbackModel.generateContent(systemPrompt);
      }
    }

    const responseText = result.response.text();

    // Clean up potential markdown code blocks
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let styleSystem: StyleSystem;
    try {
      styleSystem = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Error. Raw response:", responseText);
      return NextResponse.json({
        error: "Failed to parse AI response. See console for details.",
        details: responseText.slice(0, 500) // Return start of response for debugging
      }, { status: 500 });
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

    // Return detailed diagnostic info for the user
    return NextResponse.json(
      {
        error: "Analysis Failed",
        debug: {
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          env: {
            GOOGLE_KEY_SET: !!process.env.GOOGLE_API_KEY,
            GEMINI_KEY_SET: !!process.env.GEMINI_API_KEY,
          },
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
