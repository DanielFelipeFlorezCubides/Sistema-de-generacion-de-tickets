const prisma = require("../config/database");

class TicketRepository {
  async create(ticketData) {
    return prisma.ticket.create({
      data: ticketData,
      include: {
        usuarioSolicitante: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            rol: true
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: {
        usuarioSolicitante: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            rol: true
          }
        },
        tecnicoAsignado: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            rol: true
          }
        }
      }
    });
  }
}

module.exports = new TicketRepository();
