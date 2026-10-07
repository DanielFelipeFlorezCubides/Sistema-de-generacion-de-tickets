-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SOPORTE', 'USUARIO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('HARDWARE', 'SOFTWARE', 'CONECTIVIDAD', 'ACCESOS', 'OTRO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "prioridad" "Prioridad" NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'ABIERTO',
    "usuarioSolicitanteId" INTEGER NOT NULL,
    "tecnicoAsignadoId" INTEGER,
    "resumenIA" TEXT,
    "etiquetasIA" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eliminadoEn" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_usuarioSolicitanteId_fkey" FOREIGN KEY ("usuarioSolicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
