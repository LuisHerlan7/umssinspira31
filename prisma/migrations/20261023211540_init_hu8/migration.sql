-- CreateTable
CREATE TABLE "usuario" (
    "usuario_id" TEXT NOT NULL,
    "nombre" VARCHAR(45) NOT NULL,
    "rol" VARCHAR(20) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "razon_social" VARCHAR(100) NOT NULL,
    "nit" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "correo" VARCHAR(255) NOT NULL,
    "sitio_web" VARCHAR(45) NOT NULL,
    "fecha_registro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacante" (
    "id" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "salario" DECIMAL(10,2),
    "modalidad" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacante_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "empresa" ADD CONSTRAINT "empresa_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacante" ADD CONSTRAINT "vacante_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
