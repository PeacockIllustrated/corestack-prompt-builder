import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    const googleKey = process.env.GOOGLE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const activeKey = googleKey || geminiKey;

    const status = {
        env: {
            GOOGLE_API_KEY_PRESENT: !!googleKey,
            GEMINI_API_KEY_PRESENT: !!geminiKey,
            ACTIVE_KEY_SOURCE: googleKey ? "GOOGLE_API_KEY" : geminiKey ? "GEMINI_API_KEY" : "NONE",
        },
        modelCheck: "pending",
        error: null as string | null,
    };

    if (!activeKey) {
        status.error = "No API key found in environment variables.";
        return NextResponse.json(status, { status: 500 });
    }

    try {
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Minimal generation test
        const result = await model.generateContent("Test");
        const response = await result.response;
        const text = response.text();

        if (text) {
            status.modelCheck = "success";
        } else {
            status.modelCheck = "failed (empty response)";
        }
    } catch (error: any) {
        status.modelCheck = "failed";
        status.error = error.message || "Unknown error during model generation";
        console.error("Diagnostics Error:", error);
    }

    return NextResponse.json(status, { status: status.modelCheck === "success" ? 200 : 500 });
}
