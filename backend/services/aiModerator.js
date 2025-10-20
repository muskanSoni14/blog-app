// services/aiModerator.js

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function moderateContent(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // --- CHANGE #1: Make safety settings stricter ---
        // We now block content that is MEDIUM or HIGH severity.
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        // --- CHANGE #2: Add a new, explicit rule for threats ---
        const prompt = `
            You are an advanced content moderation API for a technology blog.
            Analyze the following blog post text. Your response MUST be in a valid JSON format.

            Check for the following violations:
            1. THREATS_OR_VIOLENCE: Any direct or indirect threats of violence, harm, or death towards any individual or group.
            2. PROFANITY_OR_HATE_SPEECH: Any swear words, hateful, or discriminatory language.
            3. PII_LEAK: Any potential personal information like emails or phone numbers.
            4. SPAM_OR_SCAM: Commercial spam, phishing links, or scam-like language.
            5. OFF_TOPIC: The content is not related to technology, software development, or programming.

            The blog post text is:
            """
            ${text}
            """

            Based on your analysis, provide a JSON response with the following structure:
            {
              "is_safe_to_post": boolean,
              "violations_found": [
                {
                  "type": "THREATS_OR_VIOLENCE" | "PROFANITY_OR_HATE_SPEECH" | "PII_LEAK" | "SPAM_OR_SCAM" | "OFF_TOPIC" | "NONE",
                  "details": "A brief explanation of the violation found."
                }
              ]
            }
        `;

        const chat = model.startChat({
            safetySettings,
            history: [],
        });

        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        const cleanedJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const verdict = JSON.parse(cleanedJsonString);
        
        return verdict;

    } catch (error) {
        console.error("Error in AI moderation:", error);
        // Check if the error is due to a safety block from the API itself
        if (error.message && error.message.includes('SCS_PROMPT_SAFETY_BLOCK')) {
            return {
                is_safe_to_post: false,
                violations_found: [{
                    type: "VIOLENCE_OR_THREAT",
                    details: "Content was blocked by the safety filter due to severe violations."
                }]
            };
        }
        return {
            is_safe_to_post: false,
            violations_found: [{
                type: "MODERATION_ERROR",
                details: "Could not analyze content due to an internal error."
            }]
        };
    }
}

module.exports = { moderateContent };