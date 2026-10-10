// Mock de GeminiAnalyzerService a nivel de módulo antes de cualquier importación de la app
jest.mock("../src/services/ai/geminiAnalyzer.service", () => ({
  analizar: jest.fn()
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/database");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");
const geminiAnalyzerService = require("../src/services/ai/geminiAnalyzer.service");

describe("HU 4.2 / CU-10: Pruebas Automatizadas con Mocks - Módulo de Tickets", () => {
  let userToken;
  let soporteToken;
  let adminToken;
  let usuarioRegular;
  let usuarioSoporte;
  let usuarioAdmin;

  // IDs de tickets creados en los tests para limpieza posterior
  const ticketsCreados = [];

  const mockAiResult = {
    categoria: "CONECTIVIDAD",
    prioridad: "ALTA",
    resumen: "Falla generalizada de conexión a la red interna.",
    etiquetas: ["red", "internet", "conexion", "soporte"]
  };

  beforeAll(async () => {
    // 1. Configurar respuesta por defecto del mock
    geminiAnalyzerService.analizar.mockResolvedValue(mockAiResult);

    // 2. Obtener o asegurar usuarios con los roles requeridos en la base de datos
    usuarioRegular = await prisma.usuario.findFirst({ where: { rol: "USUARIO" } });
    if (!usuarioRegular) {
      usuarioRegular = await prisma.usuario.create({
        data: {
          nombre: "Test Usuario Regular",
          correo: `test.usuario.${Date.now()}@tickets.com`,
          password: "HashedPassword123",
          rol: "USUARIO"
        }
      });
    }

    usuarioSoporte = await prisma.usuario.findFirst({ where: { rol: "SOPORTE" } });
    if (!usuarioSoporte) {
      usuarioSoporte = await prisma.usuario.create({
        data: {
          nombre: "Test Técnico Soporte",
          correo: `test.soporte.${Date.now()}@tickets.com`,
          password: "HashedPassword123",
          rol: "SOPORTE"
        }
      });
    }

    usuarioAdmin = await prisma.usuario.findFirst({ where: { rol: "ADMIN" } });
    if (!usuarioAdmin) {
      usuarioAdmin = await prisma.usuario.create({
        data: {
          nombre: "Test Administrador",
          correo: `test.admin.${Date.now()}@tickets.com`,
          password: "HashedPassword123",
          rol: "ADMIN"
        }
      });
    }

    // 3. Generar tokens JWT para autenticar las peticiones en los tests
    userToken = jwt.sign(
      { id: usuarioRegular.id, correo: usuarioRegular.correo, rol: usuarioRegular.rol },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    soporteToken = jwt.sign(
      { id: usuarioSoporte.id, correo: usuarioSoporte.correo, rol: usuarioSoporte.rol },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: usuarioAdmin.id, correo: usuarioAdmin.correo, rol: usuarioAdmin.rol },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // 1. Limpieza de tickets creados durante la suite de pruebas
    if (ticketsCreados.length > 0) {
      await prisma.ticket.deleteMany({
        where: { id: { in: ticketsCreados } }
      });
    }

    // 2. Desconectar cliente de Prisma
    await prisma.$disconnect();
  });

  beforeEach(() => {
    // Restaurar el comportamiento resuelto por defecto y limpiar historial de llamadas
    geminiAnalyzerService.analizar.mockClear();
    geminiAnalyzerService.analizar.mockResolvedValue(mockAiResult);
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA 1: Creación exitosa de ticket (POST /api/tickets)
  // --------------------------------------------------------------------------
  describe("1. Creación exitosa de ticket", () => {
    it("debe crear un ticket correctamente con código HTTP 201 y retornar su id y estructura", async () => {
      const payload = {
        titulo: "TEST_MOCK: Falla de red en piso 3",
        descripcion: "No es posible conectarse a ningún servidor ni navegar en internet desde las estaciones.",
        usuarioId: usuarioRegular.id
      };

      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("message", "Ticket creado exitosamente");
      expect(response.body.data).toHaveProperty("id");
      expect(typeof response.body.data.id).toBe("number");
      expect(response.body.data.titulo).toBe(payload.titulo);
      expect(response.body.data.descripcion).toBe(payload.descripcion);
      expect(response.body.data.estado).toBe("ABIERTO");

      ticketsCreados.push(response.body.data.id);
    });

    it("debe rechazar la creación si no se provee token de autenticación (401)", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .send({
          titulo: "Ticket sin autorización",
          descripcion: "Descripción válida para el intento sin cabecera de autenticación."
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "UNAUTHORIZED");
    });
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA 2: Clasificación con IA (Verificación de valores simulados)
  // --------------------------------------------------------------------------
  describe("2. Clasificación con IA mediante Mocks", () => {
    it("debe aplicar correctamente los datos simulados por el mock de IA (categoria, prioridad, resumenIA, etiquetasIA)", async () => {
      const customMock = {
        categoria: "HARDWARE",
        prioridad: "CRITICA",
        resumen: "Fallo crítico de hardware en servidor de producción.",
        etiquetas: ["servidor", "hardware", "critico"]
      };

      geminiAnalyzerService.analizar.mockResolvedValueOnce(customMock);

      const payload = {
        titulo: "TEST_MOCK: Servidor se apaga de forma inesperada",
        descripcion: "El servidor principal se reinicia cada 5 minutos debido a un fallo en la fuente de poder.",
        usuarioId: usuarioRegular.id
      };

      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send(payload);

      expect(response.status).toBe(201);

      // Verificar que el mock de IA fue invocado exactamente 1 vez con los parámetros esperados
      expect(geminiAnalyzerService.analizar).toHaveBeenCalledTimes(1);
      expect(geminiAnalyzerService.analizar).toHaveBeenCalledWith(payload.titulo, payload.descripcion);

      // Verificar que los valores en la respuesta corresponden exactamente a los datos simulados
      const ticket = response.body.data;
      expect(ticket.categoria).toBe(customMock.categoria);
      expect(ticket.prioridad).toBe(customMock.prioridad);
      expect(ticket.resumenIA).toBe(customMock.resumen);
      expect(ticket.etiquetasIA).toEqual(customMock.etiquetas);

      ticketsCreados.push(ticket.id);
    });
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA 3: Consulta de ticket inexistente o eliminado (404)
  // --------------------------------------------------------------------------
  describe("3. Consulta de ticket inexistente o eliminado lógicamente", () => {
    it("debe retornar HTTP 404 con formato centralizado cuando el ID no existe en la base de datos", async () => {
      const nonExistentId = 99999999;

      const response = await request(app)
        .get(`/api/tickets/${nonExistentId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("status", 404);
      expect(response.body).toHaveProperty("error", "NOT_FOUND");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain(`No se encontró el ticket con id ${nonExistentId}`);
      expect(response.body).toHaveProperty("path", `/api/tickets/${nonExistentId}`);
    });

    it("debe retornar HTTP 404 cuando un ticket ha sido eliminado lógicamente (soft delete)", async () => {
      // 1. Crear un ticket
      const createRes = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          titulo: "TEST_MOCK: Ticket a eliminar lógicamente",
          descripcion: "Este ticket será eliminado de manera suave para validar el retorno 404.",
          usuarioId: usuarioRegular.id
        });

      const ticketId = createRes.body.data.id;
      ticketsCreados.push(ticketId);

      // 2. Eliminar lógicamente el ticket
      const deleteRes = await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty("status", "success");

      // 3. Consultar el ticket eliminado: debe retornar 404 Not Found
      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(getRes.status).toBe(404);
      expect(getRes.body).toHaveProperty("status", 404);
      expect(getRes.body).toHaveProperty("error", "NOT_FOUND");
    });
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA 4: Asignación de técnico inválido
  // --------------------------------------------------------------------------
  describe("4. Asignación de técnico a un ticket", () => {
    let testTicketId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          titulo: "TEST_MOCK: Ticket para pruebas de asignación",
          descripcion: "Ticket auxiliar creado para evaluar las validaciones de asignación de técnico.",
          usuarioId: usuarioRegular.id
        });

      testTicketId = createRes.body.data.id;
      ticketsCreados.push(testTicketId);
    });

    it("debe rechazar la asignación con HTTP 400 si el usuario asignado no tiene rol SOPORTE (rol USUARIO)", async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/asignar`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ tecnicoId: usuarioRegular.id });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("status", 400);
      expect(response.body).toHaveProperty("error", "BAD_REQUEST");
      expect(response.body.message).toContain("Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos");
    });

    it("debe rechazar la asignación con HTTP 400 si el usuario asignado tiene rol ADMIN", async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/asignar`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ tecnicoId: usuarioAdmin.id });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("status", 400);
      expect(response.body).toHaveProperty("error", "BAD_REQUEST");
      expect(response.body.message).toContain("Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos");
    });

    it("debe retornar HTTP 404 si el tecnicoId especificado no existe", async () => {
      const nonExistentTechId = 99999999;

      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/asignar`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ tecnicoId: nonExistentTechId });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("status", 404);
      expect(response.body).toHaveProperty("error", "NOT_FOUND");
      expect(response.body.message).toContain(`No se encontró el técnico con id ${nonExistentTechId}`);
    });

    it("debe asignar correctamente con HTTP 200 cuando el usuario tiene rol SOPORTE", async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/asignar`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ tecnicoId: usuarioSoporte.id });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("tecnicoAsignado");
      expect(response.body.tecnicoAsignado).toHaveProperty("id", usuarioSoporte.id);
      expect(response.body.tecnicoAsignado).toHaveProperty("nombre", usuarioSoporte.nombre);
    });
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA 5: Actualización de estado
  // --------------------------------------------------------------------------
  describe("5. Actualización de estado del ticket", () => {
    let testTicketId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          titulo: "TEST_MOCK: Ticket para pruebas de cambio de estado",
          descripcion: "Ticket auxiliar creado para verificar transiciones de estado válidas e inválidas.",
          usuarioId: usuarioRegular.id
        });

      testTicketId = createRes.body.data.id;
      ticketsCreados.push(testTicketId);
    });

    it("debe permitir la actualización a un estado válido (EN_PROCESO) retornando HTTP 200", async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/estado`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ estado: "EN_PROCESO" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("estado", "EN_PROCESO");
    });

    it("debe permitir la actualización a estado RESUELTO y CERRADO", async () => {
      const resResuelto = await request(app)
        .patch(`/api/tickets/${testTicketId}/estado`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ estado: "RESUELTO" });

      expect(resResuelto.status).toBe(200);
      expect(resResuelto.body.estado).toBe("RESUELTO");

      const resCerrado = await request(app)
        .patch(`/api/tickets/${testTicketId}/estado`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ estado: "CERRADO" });

      expect(resCerrado.status).toBe(200);
      expect(resCerrado.body.estado).toBe("CERRADO");
    });

    it("debe rechazar con HTTP 400 un estado no definido en el sistema", async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicketId}/estado`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ estado: "ESTADO_INEXISTENTE" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("status", 400);
      expect(response.body).toHaveProperty("error", "VALIDATION_ERROR");
      expect(response.body.message).toContain("El estado debe ser ABIERTO, EN_PROCESO, RESUELTO o CERRADO");
    });
  });
});
