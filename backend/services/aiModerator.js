const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function moderateContent(text) {
    try {
        const safetySettings = [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_LOW_AND_ABOVE",
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_LOW_AND_ABOVE",
            },
        ];

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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                safetySettings: safetySettings,
            },
        });
        console.log(response.text);
        const responseText = response.text;

        // Clean up the JSON string from the AI response
        let cleanedJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const startIndex = cleanedJsonString.indexOf('{');
        const endIndex = cleanedJsonString.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Invalid JSON response from AI.");
        }
        
        // This is the corrected line (no typo)
        cleanedJsonString = cleanedJsonString.substring(startIndex, endIndex + 1);

        const verdict = JSON.parse(cleanedJsonString);
        
        return verdict;

    } catch (error) {
        console.error("Error in AI moderation:", error);
        
        // Handle cases where the AI *itself* blocks the content
        if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
            return {
                is_safe_to_post: false,
                violations_found: [{
                    type: "VIOLENCE_OR_THREAT",
                    details: "Content was blocked by the safety filter due to severe violations."
                }]
            };
        }
        
        // Handle all other errors (like the 404s we were seeing)
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