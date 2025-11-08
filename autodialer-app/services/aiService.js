// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Instantiate the AI client only if the API key is present
class AIService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Get the generative model by the correct model name—"gemini-pro"
    //   this.geminiModel = this.gemini.getGenerativeModel({ model: "gemini-pro" });
      this.geminiModel = this.gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    } else {
      this.gemini = null;
      this.geminiModel = null;
    }
  }

  async generateText(prompt) {
    if (!this.geminiModel) throw new Error("Gemini API not configured");
    // Main Gemini text completion call
    const result = await this.geminiModel.generateContent(prompt);
    // Ensure a valid response
    const response = await result.response;
    // For latest package, use this:
    return typeof response.text === "function" ? response.text() : response.text;
  }

  async generateOutline(title, details) {
    return await this.generateText(`Create outline for ${title}. ${details}`);
  }

  async expandOutline(title, outline) {
    return await this.generateText(
      `Write a 1500-word article titled "${title}" using this outline: ${outline}. Include code examples and tips.`
    );
  }
}

module.exports = new AIService();
