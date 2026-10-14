-- HU-08: Definir habilidades requeridas para una vacante.

CREATE TABLE IF NOT EXISTS habilidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('Tecnica', 'Profesional')),
    descripcion VARCHAR(250),
    esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Evita duplicados en el catálogo, incluso si cambia
-- la combinación de mayúsculas y minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS uq_habilidad_tipo_nombre
    ON habilidad (tipo, LOWER(nombre));

CREATE TABLE IF NOT EXISTS vacante_habilidad (
    id_vacante UUID NOT NULL
        REFERENCES vacante(id) ON DELETE CASCADE,
    id_habilidad UUID NOT NULL
        REFERENCES habilidad(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_vacante, id_habilidad)
);

CREATE INDEX IF NOT EXISTS idx_vacante_habilidad_habilidad
    ON vacante_habilidad(id_habilidad);

-- Permite reemplazar la lista completa de habilidades
-- dentro de una única transacción de PostgreSQL.
CREATE OR REPLACE FUNCTION reemplazar_habilidades_vacante(
    p_id_vacante UUID,
    p_habilidades UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM vacante WHERE id = p_id_vacante
    ) THEN
        RAISE EXCEPTION 'VACANTE_NO_EXISTE';
    END IF;

    IF cardinality(COALESCE(p_habilidades, ARRAY[]::UUID[])) > 0
       AND (
           SELECT COUNT(DISTINCT h.id)
           FROM habilidad h
           WHERE h.id = ANY(p_habilidades)
             AND h.esta_activo = TRUE
       ) <> cardinality(p_habilidades)
    THEN
        RAISE EXCEPTION 'HABILIDAD_INVALIDA';
    END IF;

    DELETE FROM vacante_habilidad
    WHERE id_vacante = p_id_vacante;

    INSERT INTO vacante_habilidad (id_vacante, id_habilidad)
    SELECT p_id_vacante, h.id
    FROM unnest(COALESCE(p_habilidades, ARRAY[]::UUID[])) AS h(id);
END;
$$;

-- Catálogo inicial de ejemplo. Puedes ampliarlo después.
INSERT INTO habilidad (nombre, tipo, descripcion)
VALUES
    ('JavaScript', 'Tecnica', 'Programación con JavaScript'),
    ('TypeScript', 'Tecnica', 'Programación con TypeScript'),
    ('SQL', 'Tecnica', 'Consultas y gestión de bases de datos'),
    ('Git', 'Tecnica', 'Control de versiones'),
    ('Comunicación efectiva', 'Profesional', 'Comunicación oral y escrita'),
    ('Trabajo en equipo', 'Profesional', 'Colaboración con otras personas'),
    ('Liderazgo', 'Profesional', 'Coordinación y orientación de equipos'),
    ('Resolución de problemas', 'Profesional', 'Análisis y solución de problemas')
ON CONFLICT DO NOTHING;