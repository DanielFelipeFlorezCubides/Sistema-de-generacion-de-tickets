const prisma = require("../config/database");

class UserRepository {
  async findByEmail(correo) {
    return prisma.usuario.findUnique({
      where: { correo }
    });
  }

  async findById(id) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        fechaCreacion: true
      }
    });
  }

  async create(userData) {
    return prisma.usuario.create({
      data: userData,
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        fechaCreacion: true
      }
    });
  }
}

module.exports = new UserRepository();
