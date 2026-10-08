const env = require("../../config/env");
const localAnalyzerService = require("./localAnalyzer.service");
const { aiResponseSchema } = require("./aiResponse.validator");

class GeminiAnalyzerService {
  constructor() {
    this.timeoutMs = 7000; // 7 segundos de tolerancia acordados
  }

  get apiKey() {
    return env.AI_API_KEY;
  }

  get model() {
    return env.AI_MODEL || "gemini-1.5-flash";
  }

  _construirPrompt(titulo, descripcion) {
    return `Analiza el siguiente ticket de soporte técnico:
Título: "${titulo}"
Descripción: "${descripcion}"

Devuelve estrictamente un objeto JSON válido con la siguiente estructura:
{
  "categoria": "HARDWARE" | "SOFTWARE" | "CONECTIVIDAD" | "ACCESOS" | "OTRO",
  "prioridad": "BAJA" | "MEDIA" | "ALTA" | "CRITICA",
  "resumen": "Resumen explicativo del incidente de máximo 30 palabras",
  "etiquetas": ["etiqueta1", "etiqueta2"]
}

Instrucciones estrictas:
1. "categoria" DEBE ser una de las siguientes opciones exactas: HARDWARE, SOFTWARE, CONECTIVIDAD, ACCESOS, OTRO.
2. "prioridad" DEBE ser una de las siguientes opciones exactas: BAJA, MEDIA, ALTA, CRITICA.
3. "resumen" debe ser una síntesis clara y profesional de máximo 30 palabras.
4. "etiquetas" debe contener entre 1 y 5 palabras clave breves en minúsculas.
5. Retorna únicamente el objeto JSON sin bloques de código markdown (\`\`\`json), sin saludos ni explicaciones.`;
  }

  _extraerJson(texto) {
    if (!texto || typeof texto !== "string") {
      throw new Error("Respuesta vacía o formato inválido recibido de la IA");
    }

    let limpio = texto.trim();
    // Remover bloque de código markdown si estuviese presente
    if (limpio.startsWith("```json")) {
      limpio = limpio.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (limpio.startsWith("```")) {
      limpio = limpio.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(limpio);
  }

  async analizar(titulo, descripcion) {
    // Si no hay API key configurada, ir directo a fallback local
    if (!this.apiKey || this.apiKey.trim() === "" || this.apiKey === "tu_api_key_aqui") {
      console.warn("[GeminiAnalyzerService] AI_API_KEY no configurada. Activando fallback local.");
      return await localAnalyzerService.analizar(titulo, descripcion);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const prompt = this._construirPrompt(titulo, descripcion);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Error HTTP ${response.status} de Gemini API: ${errorBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedJson = this._extraerJson(rawText);

      // Validar estructura estricta con Zod antes de entregar
      const resultadoValidado = aiResponseSchema.parse(parsedJson);

      return resultadoValidado;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(`[GeminiAnalyzerService] Timeout tras ${this.timeoutMs}ms con Gemini API. Activando fallback local.`);
      } else {
        console.warn(`[GeminiAnalyzerService] Error consultando o validando Gemini (${error.message}). Activando fallback local.`);
      }

      // Mecanismo de resiliencia: Fallback a clasificador por reglas locales
      return await localAnalyzerService.analizar(titulo, descripcion);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

module.exports = new GeminiAnalyzerService();
