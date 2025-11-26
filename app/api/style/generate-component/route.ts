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
        const { styleSystem, componentName } = body as {
            styleSystem: StyleSystem;
            componentName: string;
        };

        if (!styleSystem || !componentName) {
            return NextResponse.json({ error: "StyleSystem and ComponentName are required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            You are an expert UI engineer using Tailwind CSS.
            Your task is to generate a production-ready HTML component for a "${componentName}".
            
            STRICT DESIGN SYSTEM TO FOLLOW:
            - Colors: ${JSON.stringify(styleSystem.colors)}
            - Radius: ${JSON.stringify(styleSystem.radius)}
            - Typography: ${JSON.stringify(styleSystem.typography)}
            - Spacing Scale: ${JSON.stringify(styleSystem.spacingScale)}
            
            INSTRUCTIONS:
            1. Return a single JSON object with a "code" field containing the HTML string.
            2. Use ONLY Tailwind CSS classes. Do not use arbitrary values (e.g. w-[123px]) unless absolutely necessary; stick to the design system.
            3. The component should be fully functional and accessible (e.g. correct aria attributes).
            4. Do not include <html>, <body>, or markdown fences. Just the component HTML.
            5. Ensure high contrast and visual fidelity.
            
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
