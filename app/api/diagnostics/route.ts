import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    const googleKey = process.env.GOOGLE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const activeKey = googleKey || geminiKey;

    const status: Record<string, unknown> = {
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

        // Test multiple models to find a working one
        const modelsToTry = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"];
        const results: Record<string, string> = {};
        let success = false;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                const text = response.text();
                results[modelName] = text ? "success" : "empty_response";
                if (text) success = true;
            } catch (e: unknown) {
                results[modelName] = `failed: ${e instanceof Error ? e.message : String(e)}`;
            }
        }

        status["modelResults"] = results;

        if (success) {
            status.modelCheck = "success";
        } else {
            status.modelCheck = "failed";
            status.error = "All models failed. Check API key permissions and quota.";
        }

    } catch (error: unknown) {
        status.modelCheck = "failed";
        status.error = error instanceof Error ? error.message : "Unknown error during model generation";
        console.error("Diagnostics Error:", error);
    }

    return NextResponse.json(status, { status: status.modelCheck === "success" ? 200 : 500 });
}
