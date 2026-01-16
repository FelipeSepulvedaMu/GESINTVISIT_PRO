import { GoogleGenAI } from "@google/genai";
import { VisitRecord } from "./types";

export const generateSummary = async (records: VisitRecord[]) => {
  if (records.length === 0) return "No hay registros para resumir hoy.";

  // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const dataStr = records.map(r => 
    `- ${r.type.toUpperCase()} para Casa ${r.houseNumber} (${r.residentName}) por ${r.visitorName}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resume el siguiente tráfico de visitas de un condominio en 2-3 oraciones breves y profesionales: \n${dataStr}`,
      config: {
        systemInstruction: "Eres un asistente de administración profesional para la plataforma GESINTVISIT PRO. Proporcionas resúmenes concisos, útiles y ejecutivos sobre el tráfico de personas y paquetes.",
        temperature: 0.7,
      }
    });
    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al contactar con la IA para el resumen.";
  }
};