const bcrypt = require("bcryptjs");
const prisma = require("../src/config/database");

async function main() {
  console.log("Iniciando la siembra de usuarios iniciales en la base de datos...\n");

  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash("Password123!", saltRounds);

  const usuariosIniciales = [
    {
      nombre: "Administrador del Sistema",
      correo: "admin@tickets.com",
      password: defaultPassword,
      rol: "ADMIN"
    },
    {
      nombre: "Carlos Soporte Técnico",
      correo: "soporte@tickets.com",
      password: defaultPassword,
      rol: "SOPORTE"
    },
    {
      nombre: "Laura Usuario Solicitante",
      correo: "usuario@tickets.com",
      password: defaultPassword,
      rol: "USUARIO"
    }
  ];

  for (const usuario of usuariosIniciales) {
    const usuarioCreado = await prisma.usuario.upsert({
      where: { correo: usuario.correo },
      update: {
        nombre: usuario.nombre,
        password: usuario.password,
        rol: usuario.rol
      },
      create: usuario
    });

    console.log(`✓ Usuario listo: [${usuarioCreado.rol}] ${usuarioCreado.nombre} <${usuarioCreado.correo}> (ID: ${usuarioCreado.id})`);
  }

  console.log("\n¡Siembra completada exitosamente! Todos los usuarios tienen la contraseña: Password123!");
}

main()
  .catch((e) => {
    console.error("Error durante la siembra de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
