const localAnalyzerService = require("../src/services/ai/localAnalyzer.service");
const { aiResponseSchema } = require("../src/services/ai/aiResponse.validator");

describe("Pruebas Unitarias: Analizador Local y Validador de IA", () => {
  describe("LocalAnalyzerService (Fallback por reglas locales)", () => {
    it("debe clasificar correctamente problemas de conectividad con prioridad ALTA ante palabras como 'urgente' o 'reunión'", async () => {
      const resultado = await localAnalyzerService.analizar(
        "Problema con internet en sala de juntas",
        "No hay conexión wifi y es urgente porque tengo una reunión importante en 15 minutos."
      );

      expect(resultado.categoria).toBe("CONECTIVIDAD");
      expect(resultado.prioridad).toBe("ALTA");
      expect(resultado.resumen).toContain("Problema con internet");
      expect(resultado.etiquetas.length).toBeGreaterThanOrEqual(1);
      expect(resultado.etiquetas.length).toBeLessThanOrEqual(5);
    });

    it("debe clasificar problemas de hardware correctamente", async () => {
      const resultado = await localAnalyzerService.analizar(
        "Fallo en pantalla de computador",
        "El monitor parpadea y la pantalla se queda en negro constantemente."
      );

      expect(resultado.categoria).toBe("HARDWARE");
      expect(resultado.etiquetas).toContain("hardware");
    });

    it("debe clasificar problemas de software y accesos", async () => {
      const resSoftware = await localAnalyzerService.analizar(
        "Error en la aplicación de nómina",
        "El programa se cierra inesperadamente al generar el reporte mensual en excel."
      );
      expect(resSoftware.categoria).toBe("SOFTWARE");

      const resAccesos = await localAnalyzerService.analizar(
        "Bloqueo de usuario y contraseña",
        "No puedo ingresar al sistema, olvidé mi clave y mi usuario está bloqueado."
      );
      expect(resAccesos.categoria).toBe("ACCESOS");
    });

    it("debe asignar prioridad CRITICA ante incidentes que detengan producción", async () => {
      const resultado = await localAnalyzerService.analizar(
        "Caída total del sistema de facturación",
        "Emergencia: producción detenida y todos los usuarios se encuentran bloqueados."
      );

      expect(resultado.prioridad).toBe("CRITICA");
    });
  });

  describe("aiResponseSchema (Validación de estructura devuelta por IA)", () => {
    it("debe validar con éxito un objeto con estructura y tipos válidos", () => {
      const validPayload = {
        categoria: "CONECTIVIDAD",
        prioridad: "ALTA",
        resumen: "Pérdida de conectividad antes de reunión clave.",
        etiquetas: ["internet", "wifi"]
      };

      const parsed = aiResponseSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it("debe rechazar una categoría o prioridad no válida", () => {
      const invalidPayload = {
        categoria: "CATEGORIA_INVENTADA",
        prioridad: "SUPER_URGENTE",
        resumen: "Resumen de prueba.",
        etiquetas: ["test"]
      };

      const parsed = aiResponseSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });

    it("debe rechazar si la lista de etiquetas está vacía o tiene más de 5 elementos", () => {
      const zeroTags = {
        categoria: "HARDWARE",
        prioridad: "BAJA",
        resumen: "Problema con mouse.",
        etiquetas: []
      };
      expect(aiResponseSchema.safeParse(zeroTags).success).toBe(false);

      const sixTags = {
        categoria: "HARDWARE",
        prioridad: "BAJA",
        resumen: "Problema con mouse.",
        etiquetas: ["t1", "t2", "t3", "t4", "t5", "t6"]
      };
      expect(aiResponseSchema.safeParse(sixTags).success).toBe(false);
    });
  });
});
