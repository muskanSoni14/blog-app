const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateTitles(text) {
    try {
        const prompt = `
            You are an expert copywriter and SEO specialist.
            Analyze the following blog post text and generate 3 compelling, catchy, and 
            SEO-friendly titles.

            Your response MUST be ONLY a valid JSON array of strings.
            Do not include any other text, markdown, or explanations.
            
            Example response:
            [
              "My First Title Suggestion",
              "A Second, More Catchy Title",
              "A Third, SEO-Optimized Option"
            ]

            Blog Post Text:
            """
            ${text}
            """
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // We're expecting JSON, so we can ask the model to
            // output it directly for easier parsing.
            responseMimeType: "application/json",
        });

        const responseText = response.text;
        const titles = JSON.parse(responseText);
        
        if (Array.isArray(titles) && titles.length > 0 && typeof titles[0] === 'string') {
             return titles.slice(0, 3); // Return the first 3
        } else {
            throw new Error("AI did not return a valid title array.");
        }

    } catch (error) {
        console.error("Error in AI title generation:", error);
        // Return a fallback array in case of error
        return ["Error generating titles. Please try again."];
     }

}

module.exports = { generateTitles };