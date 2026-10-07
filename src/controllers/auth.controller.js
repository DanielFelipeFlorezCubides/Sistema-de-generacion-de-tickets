const authService = require("../services/auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json({
        status: "success",
        message: "Usuario registrado exitosamente",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json({
        status: "success",
        message: "Inicio de sesión exitoso",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      return res.status(200).json({
        status: "success",
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
