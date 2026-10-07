const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/user.repository");
const UnauthorizedError = require("../exceptions/UnauthorizedError");
const ConflictError = require("../exceptions/ConflictError");

class AuthService {
  async register({ nombre, correo, password, rol }) {
    const existingUser = await userRepository.findByEmail(correo);
    if (existingUser) {
      throw new ConflictError("El correo electrónico ya se encuentra registrado");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userRepository.create({
      nombre,
      correo,
      password: hashedPassword,
      rol
    });

    return newUser;
  }

  async login({ correo, password }) {
    const user = await userRepository.findByEmail(correo);
    if (!user) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const payload = {
      id: user.id,
      correo: user.correo,
      rol: user.rol
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "24h"
    });

    return {
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    };
  }
}

module.exports = new AuthService();
