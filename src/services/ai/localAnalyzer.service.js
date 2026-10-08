class LocalAnalyzerService {
  constructor() {
    this.categoryKeywords = {
      CONECTIVIDAD: [
        "internet", "wifi", "red", "conexion", "conexión", "conectividad",
        "vpn", "enlace", "router", "dns", "lan", "fibra", "ip", "desconectado"
      ],
      ACCESOS: [
        "contraseña", "contrasena", "password", "clave", "login", "permiso",
        "acceso", "cuenta", "bloqueado", "bloqueada", "autenticacion", "autenticación",
        "credencial", "credenciales", "desbloqueo"
      ],
      HARDWARE: [
        "pantalla", "teclado", "computador", "mouse", "monitor", "disco",
        "impresora", "cargador", "servidor", "cable", "laptop", "pc", "auriculares"
      ],
      SOFTWARE: [
        "programa", "aplicacion", "aplicación", "app", "error", "bug",
        "sistema", "excel", "crash", "instalacion", "instalación", "actualizacion", "actualización"
      ]
    };

    this.priorityKeywords = {
      CRITICA: [
        "produccion detenida", "producción detenida", "caida total", "caída total",
        "bloqueo general", "todos los usuarios", "emergencia", "critico", "crítico", "servidor caido"
      ],
      ALTA: [
        "urgente", "reunion", "reunión", "inmediato", "no puedo trabajar",
        "prioritario", "grave", "bloqueante", "pronto"
      ],
      MEDIA: [
        "lento", "intermitente", "problema", "falla", "ayuda", "error", "inconveniente"
      ]
    };
  }

  async analizar(titulo, descripcion) {
    const textoCompleto = `${titulo} ${descripcion}`.toLowerCase();

    // 1. Determinar Categoría
    let categoriaDetectada = "OTRO";
    const etiquetasEncontradas = new Set();

    for (const [categoria, keywords] of Object.entries(this.categoryKeywords)) {
      for (const kw of keywords) {
        if (textoCompleto.includes(kw)) {
          if (categoriaDetectada === "OTRO") {
            categoriaDetectada = categoria;
          }
          etiquetasEncontradas.add(kw);
        }
      }
    }

    // 2. Determinar Prioridad
    let prioridadDetectada = "BAJA";
    prioridadLoop:
    for (const [prioridad, keywords] of Object.entries(this.priorityKeywords)) {
      for (const kw of keywords) {
        if (textoCompleto.includes(kw)) {
          prioridadDetectada = prioridad;
          break prioridadLoop;
        }
      }
    }

    // 3. Generar Resumen (máx 30 palabras)
    const textoLimpio = descripcion.replace(/\s+/g, " ").trim();
    const palabrasDescripcion = textoLimpio.split(" ");
    const palabrasResumen = palabrasDescripcion.slice(0, 25).join(" ");
    const resumen = `Reporte sobre ${titulo.trim()}: ${palabrasResumen}${palabrasDescripcion.length > 25 ? "..." : ""}`;

    // Asegurar que el resumen tenga máximo 30 palabras
    const resumenFinal = resumen.split(/\s+/).slice(0, 30).join(" ");

    // 4. Generar Etiquetas (entre 1 y 5)
    etiquetasEncontradas.add(categoriaDetectada.toLowerCase());
    
    // Si aún tenemos menos de 2, agregamos una genérica
    if (etiquetasEncontradas.size === 0) {
      etiquetasEncontradas.add("soporte");
    }

    const etiquetasFinales = Array.from(etiquetasEncontradas).slice(0, 5);

    return {
      categoria: categoriaDetectada,
      prioridad: prioridadDetectada,
      resumen: resumenFinal,
      etiquetas: etiquetasFinales
    };
  }
}

module.exports = new LocalAnalyzerService();
