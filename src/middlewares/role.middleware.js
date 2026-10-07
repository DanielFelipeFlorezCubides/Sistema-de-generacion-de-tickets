const ForbiddenError = require("../exceptions/ForbiddenError");

function roleMiddleware(...roles) {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return next(new ForbiddenError("No se ha autenticado el usuario o no se encontró su rol"));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(new ForbiddenError(`Acceso denegado: se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`));
    }

    next();
  };
}

module.exports = roleMiddleware;
