import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StyleSystem } from "@/lib/style/types";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body = await req.json();
        const { styleSystem, componentName, componentContext } = body as {
            styleSystem: StyleSystem;
            componentName: string;
            componentContext?: any; // StyleComponent
        };

        if (!styleSystem || !componentName) {
            return NextResponse.json({ error: "StyleSystem and ComponentName are required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: { responseMimeType: "application/json" }
        });

        let contextPrompt = "";
        if (componentContext) {
            contextPrompt = `
            CONTEXT FROM IMAGE ANALYSIS (CRITICAL - FOLLOW THIS):
            - Description: ${componentContext.description}
            - Variants Observed: ${componentContext.variants?.join(", ") || "None"}
            - Usage Notes: ${componentContext.usage || "None"}
            
            You MUST prioritize the visual description above over generic conventions.
            `;
        }

        const prompt = `
            You are an expert UI engineer using Tailwind CSS.
            Your task is to generate a production-ready HTML component for a "${componentName}".
            
            STRICT DESIGN SYSTEM TO FOLLOW:
            - Colors: ${JSON.stringify(styleSystem.colors)}
            - Radius: ${JSON.stringify(styleSystem.radius)}
            - Typography: ${JSON.stringify(styleSystem.typography)}
            - Spacing Scale: ${JSON.stringify(styleSystem.spacingScale)}
            
            ${contextPrompt}
            
            INSTRUCTIONS:
            1. Return a single JSON object with a "code" field containing the HTML string.
            2. Use ONLY Tailwind CSS classes.
            3. **CRITICAL**: If the "CONTEXT FROM IMAGE ANALYSIS" description mentions gradients, specific colors, or effects (e.g. "purple gradient", "glassmorphism") that are not perfectly represented in the "STRICT DESIGN SYSTEM", you **MUST** use Tailwind utility classes (like `bg-gradient - to - r`, `from - purple - 600`, `backdrop - blur`) to achieve the described look. **Visual fidelity to the Description takes precedence over strict adherence to the simple color palette.**
            4. The component should be fully functional and accessible (e.g. correct aria attributes).
            5. Do not include <html>, <body>, or markdown fences. Just the component HTML.
            6. Ensure high contrast and visual fidelity.
            
            Output Format:
            {
                "code": "<button class='...'>...</button>"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);

        return NextResponse.json({ code: data.code });

    } catch (error: any) {
        console.error("Component generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate component" },
            { status: 500 }
        );
    }
}
