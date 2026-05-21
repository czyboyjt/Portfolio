
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are "UX Mind", an elite AI UX Strategy Assistant embedded in the portfolio of a world-class UX Designer.
Your goal is to help visitors understand the Designer's value and brainstorm UX solutions.

Guidelines:
- Keep responses concise, professional, and insightful.
- Use UX terminology correctly (e.g., heuristics, cognitive load, information architecture).
- Focus on user-centric solutions.
- If asked about the designer, emphasize their focus on minimalism, user research, and data-driven design.
- If a user provides a business problem, offer 2-3 high-level UX strategy suggestions.
- Be encouraging and visionary.
`;

export const getUXConsultation = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // Fixed: Always use direct process.env.API_KEY for initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct prompt history
    const history = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Previous Conversation:\n${history}\n\nNew Request: Based on the system goals, please respond to the latest user message.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    // Fixed: Accessing text property directly (not as a method)
    return response.text || "I'm having trouble thinking of a response right now. Let's try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but my connection to the UX collective is currently interrupted. Please try again soon.";
  }
};
