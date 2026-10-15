-- HU5-S1-05: actualización atómica de una vacante y sus requisitos.

CREATE OR REPLACE FUNCTION actualizar_vacante_con_requisitos(
    p_id_vacante UUID,
    p_titulo VARCHAR,
    p_modalidad VARCHAR,
    p_descripcion TEXT,
    p_ubicacion VARCHAR,
    p_area VARCHAR,
    p_condiciones TEXT,
    p_requisitos TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_empresa UUID;
    v_id_requerimiento UUID;
    v_ids_retirados UUID[];
    v_requisito TEXT;
BEGIN
    SELECT id_empresa
    INTO v_id_empresa
    FROM vacante
    WHERE id = p_id_vacante
    FOR UPDATE;

    IF v_id_empresa IS NULL THEN
        RAISE EXCEPTION 'VACANTE_NO_EXISTE' USING ERRCODE = 'P0002';
    END IF;

    IF cardinality(COALESCE(p_requisitos, ARRAY[]::TEXT[])) = 0 THEN
        RAISE EXCEPTION 'REQUISITOS_VACIOS' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM unnest(p_requisitos) AS requisito(nombre)
        WHERE NULLIF(BTRIM(requisito.nombre), '') IS NULL
    ) THEN
        RAISE EXCEPTION 'REQUISITO_INVALIDO' USING ERRCODE = '22023';
    END IF;

    IF (
        SELECT COUNT(*) <> COUNT(DISTINCT LOWER(BTRIM(requisito.nombre)))
        FROM unnest(p_requisitos) AS requisito(nombre)
    ) THEN
        RAISE EXCEPTION 'REQUISITO_DUPLICADO' USING ERRCODE = '22023';
    END IF;

    UPDATE vacante
    SET titulo = BTRIM(p_titulo),
        modalidad = BTRIM(p_modalidad),
        descripcion = BTRIM(p_descripcion),
        ubicacion = BTRIM(p_ubicacion),
        area = BTRIM(p_area),
        condiciones = NULLIF(BTRIM(p_condiciones), '')
    WHERE id = p_id_vacante;

    SELECT ARRAY_AGG(vrl.id_requerimiento_laboral)
    INTO v_ids_retirados
    FROM vacante_requerimiento_laboral vrl
    INNER JOIN requerimiento_laboral rl
        ON rl.id = vrl.id_requerimiento_laboral
    WHERE vrl.id_vacante = p_id_vacante
      AND NOT EXISTS (
          SELECT 1
          FROM unnest(p_requisitos) AS requisito(nombre)
          WHERE LOWER(BTRIM(requisito.nombre)) = LOWER(BTRIM(rl.titulo))
      );

    DELETE FROM vacante_requerimiento_laboral
    WHERE id_vacante = p_id_vacante
      AND id_requerimiento_laboral = ANY(
          COALESCE(v_ids_retirados, ARRAY[]::UUID[])
      );

    FOREACH v_requisito IN ARRAY p_requisitos LOOP
        SELECT rl.id
        INTO v_id_requerimiento
        FROM vacante_requerimiento_laboral vrl
        INNER JOIN requerimiento_laboral rl
            ON rl.id = vrl.id_requerimiento_laboral
        WHERE vrl.id_vacante = p_id_vacante
          AND LOWER(BTRIM(rl.titulo)) = LOWER(BTRIM(v_requisito));

        IF v_id_requerimiento IS NULL THEN
            INSERT INTO requerimiento_laboral (
                id_empresa,
                titulo,
                fecha_publicacion
            )
            VALUES (
                v_id_empresa,
                BTRIM(v_requisito),
                NOW()
            )
            RETURNING id INTO v_id_requerimiento;

            INSERT INTO vacante_requerimiento_laboral (
                id_vacante,
                id_requerimiento_laboral
            )
            VALUES (p_id_vacante, v_id_requerimiento);
        ELSE
            UPDATE requerimiento_laboral
            SET titulo = BTRIM(v_requisito)
            WHERE id = v_id_requerimiento;
        END IF;

        v_id_requerimiento := NULL;
    END LOOP;

    RETURN p_id_vacante;
END;
$$;
