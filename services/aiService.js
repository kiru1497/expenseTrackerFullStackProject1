const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const generateInsights = async (expenses) => {

  try {

    const prompt = `
Analyze the following user expenses and provide short financial insights.

${JSON.stringify(expenses)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return response.text;

  } catch (error) {
    console.log(error);
    return "AI insights are currently unavailable. Try again later!";
  }

};

module.exports = { generateInsights };