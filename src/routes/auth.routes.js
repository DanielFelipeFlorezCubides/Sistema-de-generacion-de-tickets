const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validation.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);
router.get("/test-role", authMiddleware, roleMiddleware("ADMIN"), (req, res) => {
  res.status(200).json({ status: "success", message: "Acceso concedido a ADMIN", user: req.user });
});

module.exports = router;
