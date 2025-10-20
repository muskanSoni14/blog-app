// services/aiModerator.js

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

// Initialize the Google AI model with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is the core function that will talk to the Gemini AI
async function moderateContent(text) {
    try {
        // We use the 'gemini-pro' model for this task
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // These are safety settings to block harmful content directly
        // We are being strict here.
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ];

        // This is the detailed instruction we give to the AI
        const prompt = `
            You are an advanced content moderation API for a technology blog.
            Analyze the following blog post text. Your response MUST be in a valid JSON format.

            Check for the following violations:
            1. PROFANITY_OR_HATE_SPEECH: Any swear words, hateful, or discriminatory language.
            2. PII_LEAK: Any potential personal information like emails or phone numbers.
            3. SPAM_OR_SCAM: Commercial spam, phishing links, or scam-like language.
            4. OFF_TOPIC: The content is not related to technology, software development, or programming.

            The blog post text is:
            """
            ${text}
            """

            Based on your analysis, provide a JSON response with the following structure:
            {
              "is_safe_to_post": boolean,
              "violations_found": [
                {
                  "type": "PROFANITY_OR_HATE_SPEECH" | "PII_LEAK" | "SPAM_OR_SCAM" | "OFF_TOPIC" | "NONE",
                  "details": "A brief explanation of the violation found."
                }
              ]
            }
        `;

        // Create a chat session with the model
        const chat = model.startChat({
            safetySettings,
            history: [],
        });

        // Send the prompt to the AI and wait for the response
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        // The AI response is a string, so we need to clean it and parse it as JSON
        // Sometimes the AI wraps the JSON in backticks, so we remove them.
        const cleanedJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const verdict = JSON.parse(cleanedJsonString);
        
        return verdict;

    } catch (error) {
        // If anything goes wrong (AI error, network issue), we block the post for safety
        console.error("Error in AI moderation:", error);
        return {
            is_safe_to_post: false,
            violations_found: [{
                type: "MODERATION_ERROR",
                details: "Could not analyze content due to an internal error."
            }]
        };
    }
}

// We export the function so we can use it in other parts of our app
module.exports = { moderateContent };
