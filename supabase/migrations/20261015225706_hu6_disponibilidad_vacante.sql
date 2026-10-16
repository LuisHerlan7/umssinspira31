-- PROPUESTA TÉCNICA HU6:
-- La disponibilidad para publicación es independiente del catálogo `estado`
-- administrado por Equipo 4.

ALTER TABLE public.vacante
    ADD COLUMN IF NOT EXISTS disponible BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS disponibilidad_actualizada_at TIMESTAMPTZ;

COMMENT ON COLUMN public.vacante.disponible IS
    'HU6: controla visibilidad activa sin modificar el catálogo de estado.';

COMMENT ON COLUMN public.vacante.disponibilidad_actualizada_at IS
    'HU6: instante de la última activación o desactivación.';
