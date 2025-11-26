import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key missing in generate route");
            return NextResponse.json(
                { error: "Server configuration error: API Key missing" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Use gemini-1.5-pro for best reasoning capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const systemPrompt = `
      You are a system architect. 
      I will give you a project idea. 
      You must return a valid JSON object with this exact structure:
      {
        "projectName": "string",
        "projectSummary": "string",
        "entities": [
          { "id": "string", "name": "string", "children": [] }
        ],
        "relationships": ["string"],
        "flows": ["string"]
      }

      Rules:
      1. 'entities' should be a hierarchical tree if possible (e.g. User -> Profile).
      2. 'flows' should be simple steps separated by ' -> ' (e.g. "Login -> Dashboard").
      3. Return ONLY the JSON. No markdown formatting.
    `;

        const result = await model.generateContent([systemPrompt, `Project Idea: ${prompt}`]);
        const response = result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if Gemini adds them
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(cleanText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate content" },
            { status: 500 }
        );
    }
}
