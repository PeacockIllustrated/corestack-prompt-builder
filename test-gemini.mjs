import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCnr2YgiblM_hjmDq1hiTilMW2-uve_HIE";

async function run() {
    try {
        console.log("Fetching models via REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found in response:", data);
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
