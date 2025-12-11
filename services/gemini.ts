import { GoogleGenAI, Type } from "@google/genai";
import { AGENTS } from '../constants';
import { AgentType, RouterOutput } from '../types';

// Initialize Gemini Client
// NOTE: In a real app, never expose keys on client side. This is for simulation purposes.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 1. Router Function
export const routeUserRequest = async (userMessage: string): Promise<RouterOutput> => {
  if (!process.env.API_KEY) {
    // Fallback for demo without key
    console.warn("No API Key found. Returning mock routing.");
    return mockRouting(userMessage);
  }

  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: AGENTS[AgentType.ROUTER].systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            route: { type: Type.STRING, enum: [AgentType.REGISTRATION, AgentType.EMR, AgentType.BILLING, AgentType.APPOINTMENT] },
            reasoning: { type: Type.STRING },
            parameters: { type: Type.OBJECT }
          },
          required: ["route", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Router");
    
    return JSON.parse(text) as RouterOutput;

  } catch (error) {
    console.error("Routing Error:", error);
    return {
      route: AgentType.REGISTRATION, // Default fallback
      reasoning: "Error in routing, falling back to Registration.",
      parameters: {}
    };
  }
};

// 2. Agent Execution Function
export const processAgentResponse = async (
  agentType: AgentType,
  userMessage: string,
  routerParams: any,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return mockResponse(agentType);
  }

  const agentConfig = AGENTS[agentType];
  
  // Construct a specialized prompt that includes the router's extracted params
  const contextEnhancement = `
    [CONTEXT DARI CENTRAL HUB]
    Parameter yang diekstrak: ${JSON.stringify(routerParams)}
    Permintaan User Asli: "${userMessage}"
    
    Silakan proses permintaan ini sesuai persona Anda.
  `;

  try {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: agentConfig.systemInstruction,
        },
        history: history.map(h => ({ role: h.role, parts: h.parts }))
    });

    const result = await chat.sendMessage({ message: contextEnhancement });
    return result.text || "Maaf, sistem sedang sibuk.";

  } catch (error) {
    console.error("Agent Processing Error:", error);
    return "Terjadi kesalahan pada sub-sistem agen. Silakan coba lagi.";
  }
};

// --- Mocks for UI testing without API Key ---
const mockRouting = (msg: string): RouterOutput => {
  const m = msg.toLowerCase();
  if (m.includes("biaya") || m.includes("bayar") || m.includes("faktur")) return { route: AgentType.BILLING, reasoning: "Keyword: Biaya", parameters: {} };
  if (m.includes("sakit") || m.includes("obat") || m.includes("diagnosa")) return { route: AgentType.EMR, reasoning: "Keyword: Medis", parameters: {} };
  if (m.includes("jadwal") || m.includes("temu") || m.includes("dokter")) return { route: AgentType.APPOINTMENT, reasoning: "Keyword: Jadwal", parameters: {} };
  return { route: AgentType.REGISTRATION, reasoning: "Default", parameters: {} };
}

const mockResponse = (type: AgentType) => {
  switch(type) {
    case AgentType.BILLING: return "Estimasi biaya rawat jalan adalah Rp 150.000. Apakah Anda menggunakan BPJS?";
    case AgentType.EMR: return "Berdasarkan catatan terakhir, tekanan darah Anda 120/80. \n\n🔒 Data dilindungi privasi.";
    case AgentType.APPOINTMENT: return "Jadwal tersedia besok jam 10 pagi dengan Dr. Santoso.";
    default: return "Mohon lengkapi data KTP Anda untuk pendaftaran.";
  }
}