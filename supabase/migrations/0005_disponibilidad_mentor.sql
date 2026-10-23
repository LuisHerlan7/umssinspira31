
ALTER TABLE egresado
    ADD COLUMN IF NOT EXISTS estado_aprobacion VARCHAR(20)
    NOT NULL DEFAULT 'PENDIENTE';

ALTER TABLE mentor
    ADD COLUMN IF NOT EXISTS id_egresado UUID
    REFERENCES egresado(id) ON DELETE CASCADE;

ALTER TABLE mentor
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

ALTER TABLE mentor
    ALTER COLUMN esta_activo SET DEFAULT TRUE;

-- Un egresado no puede tener más de un registro de mentor.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mentor_egresado
    ON mentor(id_egresado)
    WHERE id_egresado IS NOT NULL;

-- Evita registrar la misma especialidad dos veces.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mentor_area
    ON mentor_area(id_mentor, id_area);

-- Integridad y valores predeterminados.
ALTER TABLE mentor_area
    ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_DATE;

ALTER TABLE mentor
    ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_DATE;

-- Solo permite áreas activas como especialidades.
-- La validación también se realiza desde el servicio NestJS.
CREATE INDEX IF NOT EXISTS idx_mentor_area_mentor
    ON mentor_area(id_mentor);

CREATE INDEX IF NOT EXISTS idx_mentor_area_area
    ON mentor_area(id_area);

CREATE INDEX IF NOT EXISTS idx_egresado_estado_aprobacion
    ON egresado(estado_aprobacion);
