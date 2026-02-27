import { GoogleGenAI } from "@google/genai";

export const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export async function getGroupInsights(groups: any[]) {
  const ai = getAI();
  const prompt = `Analyze these student groups for a project. 
  Groups: ${JSON.stringify(groups.map(g => ({
    name: g.name,
    members: g.members.map((m: any) => ({ name: m.name, cgpa: m.cgpa, skills: m.skills }))
  })))}
  
  Provide a brief summary of the overall balance (CGPA and skills) and suggest if any specific group might need adjustment. 
  Keep it professional and concise.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}
