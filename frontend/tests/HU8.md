# Pruebas de HU8

Los fixtures de esta carpeta son ficticios y solo se usan en pruebas. Ninguna página ni servicio de producción los importa. La consulta normal continúa usando la API configurada y nunca sustituye fallos por datos locales.

## Error de carga del listado

El error es un estado condicional de `/vacantes`, no una ruta nueva. Conserva navegación, título, filtros, orden y pie. La tarjeta presenta la nube con alerta dentro de un círculo naranja claro, el título «No pudimos cargar las vacantes», la descripción «Ocurrió un problema al consultar las ofertas. Intenta nuevamente en unos momentos.», el botón naranja «Reintentar» y el texto «Si el problema continúa, contacta a Ayuda y soporte.».

La consulta real continúa usando `GET /vacantes/buscar?q=` y el cliente existente, sin caché. Solo las lecturas reales del listado HU8 tienen un límite de 15 segundos; al agotarse se cancela la petición y aparece la alerta. Se distinguen fallos HTTP, de conexión, de red, JSON/contrato inválido y tiempo agotado de una respuesta válida `[]`. Salir de la página cancela silenciosamente la consulta. El detalle conserva su manejo de errores, validación de ID y reintento, sin cambios de diseño.

«Reintentar» vuelve a consultar la misma fuente y muestra el skeleton. Un bloqueo inmediato de petición en curso evita solicitudes duplicadas por varios clics seguidos; también se desactiva la actualización durante la carga. Si se recupera el servicio se muestra su respuesta real, con vacantes o «Sin vacantes»; si sigue fallando se repite la alerta. «No encontramos vacantes» corresponde a vacantes recuperadas que no coinciden con los filtros, no a un error de API.

Formas de comprobarlo sin escribir datos:

- **Vista de error fija, solo desarrollo:** `http://localhost:3000/vacantes?hu8Demo=error`. Reintentar mantiene el error controlado; no consulta ni escribe al backend.
- **Recuperación demostrable, solo desarrollo:** seguir `hu8Demo=recorrido`, descrito abajo. Desde el error, «Reintentar» devuelve ocho fixtures, sin cambiar la URL ni tocar registros reales.
- **Red real:** abrir `/vacantes` sin `hu8Demo`; en DevTools → Network request blocking, bloquear la solicitud `*/vacantes/buscar*` y recargar. Quitar el bloqueo y pulsar «Reintentar». Solo habrá recuperación si el backend está disponible; un 503 real sigue siendo un error y nunca activa fixtures. No bloquear el documento del frontend.

Las verificaciones de Chrome de servidor disponible, `[]`, filtros sin coincidencias, HTTP 500, desconexión, JSON inválido, timeout y recuperación usaron respuestas HTTP controladas **solo en una sesión de prueba del navegador**. No se añadió interceptación al frontend ni se modificaron endpoints o registros. Tres clics sincrónicos en «Reintentar» produjeron un solo GET y se comprobó el skeleton antes de la recuperación. También se verificó la alerta y el reintento existentes del detalle.

Pruebas de timeout y regresión de consultas HU8:

```powershell
node --test --experimental-transform-types lib/vacancies/request-timeout.spec.mts lib/vacancies/consultation.spec.mts
```

## Recorrido completo desde una sola URL (sin backend)

Con el frontend iniciado con `npm run dev`, abrir únicamente:

`http://localhost:3000/vacantes?hu8Demo=recorrido`

1. La consulta muestra el skeleton durante aproximadamente 1,2 segundos y devuelve las seis vacantes originales.
2. Pulsar «Ver oferta» en Frontend Junior, revisar «Competencias requeridas» y pulsar «Volver a vacantes». Abrir Backend para contrastar los requisitos y volver. La navegación no avanza el recorrido ni pierde filtros u orden.
3. Pulsar el icono «Actualizar listado» de la franja informativa. La fuente demo responde con cero vacantes y aparece la pantalla vacía.
4. Pulsar «Actualizar listado» en la pantalla vacía. La siguiente consulta demo falla y muestra «Reintentar», sin conservar filas como datos actuales.
5. Pulsar «Reintentar». La consulta se recupera con ocho ofertas, la confirmación «Listado actualizado», dos etiquetas «Nueva» y los botones «Ver oferta» de ambas incorporaciones.
6. Abrir Full Stack o UX/UI y volver: se mantienen las ocho filas y las dos etiquetas. Actualizar otra vez conserva las ocho ofertas y ya no las considera nuevas para esa siguiente consulta.

El vacío y el error de este recorrido son respuestas controladas de la fuente de desarrollo, activadas por acciones normales del listado; no se introducen botones especiales. Cada acción completada avanza una sola vez, incluso si React repite un efecto o se vuelve desde el detalle. Una consulta cancelada no consume un paso.

La sesión permanece solo en memoria dentro de `/vacantes`; recargar completamente la pestaña reinicia el recorrido. No se guardan fixtures ni fases en cookies, `localStorage` o `sessionStorage`. Las consultas reales y cada modo demo tienen historiales separados. Quitar `hu8Demo` vuelve a la API real, aunque esa API devuelva errores. En producción el parámetro se ignora y la fuente demo rechaza su uso.

En el funcionamiento real se usa el mismo listado: carga mientras se consulta la API, tabla ante una respuesta con vacantes, estado vacío ante `[]`, error ante fallos y una nueva consulta al reintentar/actualizar. «Nueva» se calcula por IDs que no figuraban en consultas anteriores de la sesión; no se usan IDs ni fechas de los fixtures para decidirlo. Una respuesta vacía o fallida no borra ese historial. El detalle vuelve a consultar por su ID y no reutiliza requisitos de otra fila.

## URLs individuales para comprobaciones puntuales

Estas URLs anteriores se conservan para comprobaciones puntuales; no son necesarias para presentar el recorrido integrado. No es necesario editar `.env`, cambiar `NEXT_PUBLIC_API_URL`, iniciar el servidor simulado ni insertar registros. La demostración se activa **por URL y solo en desarrollo**. Si no está iniciado, desde `frontend`:

```powershell
npm run dev -- --port 3000
```

| Pantalla | URL exacta |
| --- | --- |
| Listado de las seis vacantes | `http://localhost:3000/vacantes?hu8Demo=listado` |
| Carga permanente con skeleton | `http://localhost:3000/vacantes?hu8Demo=carga` |
| Sin vacantes | `http://localhost:3000/vacantes?hu8Demo=sin-vacantes` |
| Error de consulta y reintento | `http://localhost:3000/vacantes?hu8Demo=error` |
| Listado actualizado de ocho vacantes | `http://localhost:3000/vacantes?hu8Demo=actualizado` |
| Detalle de Frontend Junior | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=listado` |
| Detalle de Backend | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000002?hu8Demo=listado` |
| Detalle de Datos Junior | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000003?hu8Demo=listado` |
| Detalle de Calidad de Software | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000004?hu8Demo=listado` |
| Detalle de Infraestructura TI | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000005?hu8Demo=listado` |
| Detalle de Ciberseguridad | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000006?hu8Demo=listado` |
| Detalle nuevo de Full Stack | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000007?hu8Demo=actualizado` |
| Detalle nuevo de UX/UI | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000008?hu8Demo=actualizado` |
| Detalle actualizado de Frontend Junior | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=actualizado` |
| Carga del detalle | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=carga` |
| Error del detalle | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=error` |
| Vacante inexistente | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000099?hu8Demo=listado` |
| Simulación explícita de 404 | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=inexistente` |
| Sin requisitos técnicos | `http://localhost:3000/vacantes/80000000-0000-4000-8000-000000000001?hu8Demo=sin-requisitos` |
| Conexión real, sin demostración | `http://localhost:3000/vacantes` |

Los seis nombres y empresas corresponden a la lista proporcionada por el usuario. Sus IDs, requisitos, ubicaciones y otros campos son datos ilustrativos de desarrollo; no se presentan como registros reales ni como una transcripción verificada de todas las pantallas de Figma.

El detalle usa un encabezado panorámico y dos columnas, según la captura «Vacantes disponibles · Detalle». El fixture de Frontend Junior reproduce los textos y las competencias visibles en esa referencia; los demás detalles contienen contenido ilustrativo propio. Los campos adicionales se agrupan en `detailContent`, un modelo de presentación separado del contrato de la API. En consultas reales no se rellenan campos ausentes con fixtures. La normalización de competencias ignora mayúsculas, tildes y espacios repetidos, conservando el texto del primer requisito.

«Postular a la oferta», «Guardar oferta» y «Ver perfil de empresa» están deshabilitados en este detalle. No escriben postulaciones, favoritos ni datos de empresa. La ruta de postulación heredada usa almacenamiento local y no constituye una integración real con estas vacantes.

Recursos visuales locales, limitados al detalle:

- Fotografía decorativa de edificios: [Sean Pollock, Unsplash](https://unsplash.com/photos/low-angle-photo-of-high-rise-building-PhYq704ffdA), archivo `public/hu8/buildings-panorama.jpg`. Es una imagen genérica, no una fotografía de la empresa seleccionada.
- Fuente [Inter](https://github.com/rsms/inter), autoalojada como `public/hu8/InterVariable.woff2`; licencia SIL Open Font License en `public/hu8/Inter-LICENSE.txt`. Su familia CSS es exclusiva de este detalle para no alterar otras pantallas.

| Últimos dígitos del ID | Vacante | Empresa |
| --- | --- | --- |
| `000001` | Desarrollador Frontend Junior | TechSolutions S.A. |
| `000002` | Desarrollador Backend | TechSolutions S.A. |
| `000003` | Analista de Datos Junior | Jalasoft |
| `000004` | Analista de Calidad de Software | TechSolutions S.A. |
| `000005` | Ingeniero de Infraestructura TI | Jalasoft |
| `000006` | Especialista en Ciberseguridad | TechSolutions S.A. |
| `000007` (solo actualizado) | Desarrollador Full Stack | Jalasoft |
| `000008` (solo actualizado) | Diseñador UX/UI | TechSolutions S.A. |

Todos los IDs completos siguen el patrón `80000000-0000-4000-8000-00000000000N`. Cada botón “Ver oferta” conserva `hu8Demo` y abre los requisitos del ID de esa fila. Los enlaces de regreso conservan también el modo. El ejemplo de Backend contiene `Python`, `python` y `pythón` para comprobar su deduplicación visual.

La demostración no añade recuadros, botones, selectores ni paneles a la interfaz. `recorrido` se activa desde su única URL y avanza con las acciones habituales; las URLs individuales permiten además fijar un estado. Los datos siguen siendo fixtures; quitar su identificación visual no los convierte en registros reales. El escenario individual `inexistente` conserva las seis filas, pero al abrir cualquier oferta simula un 404; un ID que no pertenece a los fixtures devuelve igualmente un 404 en el escenario normal.

En el modo individual `carga` la consulta permanece pendiente hasta salir de esa vista. En el modo individual `error`, reintentar conserva el fallo simulado; la recuperación sin cambiar URL se comprueba en `recorrido`. `actualizado` conserva las seis vacantes originales y añade Full Stack y UX/UI, con IDs propios y detalles consultables: ocho filas en total. También cambia Frontend Junior a modalidad híbrida, actualiza su descripción y agrega “Pruebas de interfaces” a su detalle. Los nombres y textos de las dos vacantes nuevas son ilustrativos; no se dispone de la captura oficial del listado actualizado para transcribirlos. Sus IDs se consultan en `actualizado` y en la fase final de `recorrido`; las otras vistas individuales devuelven 404 para ellos. El icono “Actualizar listado” vuelve a consultar conservando filtros y orden; su estado de éxito no requiere que hayan cambiado los datos.

**Desactivar:** quitar `?hu8Demo=…` del listado y del detalle. No hay cookies ni `localStorage` que mantengan activa la demostración. Los valores desconocidos de `hu8Demo` también usan la API real. Un error de la API nunca activa los fixtures.

**Producción:** `resolveHu8DemoScenario` ignora el parámetro fuera de `NODE_ENV=development`; el adaptador repite esa comprobación antes de importar dinámicamente los fixtures y la fuente de desarrollo los rechaza fuera de ese entorno. La conexión normal sigue utilizando los servicios existentes. No hay escrituras a Supabase, Elasticsearch o al almacenamiento del navegador.

La hora de **Última consulta** representa la recepción real de la respuesta, incluso en demostración; no se atribuye al backend una fecha de actualización inventada.

## Pruebas automatizadas de servicios

Desde `frontend`, con una versión de Node compatible con los scripts existentes:

```powershell
node --test --experimental-transform-types lib/vacancies/client.spec.mts lib/vacancies/technical-requirements-client.spec.mts lib/vacancies/consultation.spec.mts
```

Las pruebas nuevas cubren normalización, separación de vacantes, ausencia de requisitos, 404, ID inválido, red, reintento, cancelación, respuesta malformada, rechazo de otro ID y actualización sin caché.

Para comprobar el historial de incorporaciones y la separación entre sesiones:

```powershell
node --test --experimental-transform-types lib/vacancies/consultation-session.spec.mts
```

## Alternativa: servidor de prueba local independiente

No hay que editar archivos `.env`, instalar dependencias ni escribir en el backend. Usar dos terminales nuevas, ambas dentro de `frontend`.

Terminal 1:

```powershell
node --experimental-transform-types tests/hu8-mock-api.mts normal
```

Terminal 2:

```powershell
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:3109'
npm run dev -- --port 3108 --hostname 127.0.0.1
```

Abrir `http://127.0.0.1:3108/vacantes`. La variable solo afecta esta terminal. Al terminar, cerrar ambos procesos y esa terminal. El servidor simulado solo escucha en localhost y rechaza ejecutarse con `NODE_ENV=production`.

Para cambiar el escenario, detener solo la terminal 1 y volver a iniciarla cambiando el último argumento. Luego pulsar **Actualizar listado**, **Intentar nuevamente** o volver a abrir el detalle, según corresponda.

| Escenario | Verificación |
| --- | --- |
| `normal` | Tres filas en la tabla, cada una con “Ver oferta”. Abrir A: muestra Python una sola vez y SQL; abrir B: muestra únicamente Java; la tercera muestra el mensaje exacto de ausencia de requisitos en su detalle. |
| `carga` | Respuestas con 2,5 segundos de demora para observar las pantallas de carga y navegar antes de que terminen. |
| `vacio` | Listado sin vacantes y acción para actualizar; si hay filtros activos, permite limpiarlos. |
| `error` | Error 503 con mensaje amigable. Reiniciar en `normal` y reintentar; se conserva el filtro del listado. Para error de red, detener el servidor simulado. |
| `inexistente` | El listado conserva sus filas, pero sus detalles devuelven 404 y no muestran requisitos. |
| `actualizado` | A cambia a TypeScript y B desaparece. Actualizar el listado manteniendo la búsqueda; volver a abrir A para ver los requisitos actuales. |

Un ID no registrado, por ejemplo `44444444-4444-4444-8444-444444444444`, permite probar el 404 en el escenario normal. `/vacantes/enlace-invalido` permite probar un identificador inválido.

Comprobar también escritorio y móvil, teclado, navegación rápida A → listado → B y búsquedas consecutivas durante una respuesta demorada. No deben aparecer requisitos de A en B, resultados de filtros anteriores ni datos viejos al reintentar.

## Listado de Bolsa de trabajo

La ruta `/vacantes` presenta cuatro filtros combinables: título o empresa, área laboral, modalidad y ubicación. Las opciones de los selectores salen de los datos recibidos; no existe un catálogo ficticio en producción. “Limpiar filtros” restablece los cuatro campos. Actualizar o reintentar conserva los valores seleccionados.

El servicio existente no busca por empresa ni recibe los otros tres filtros. Para conservar ese contrato, la página solicita `GET /vacantes/buscar?q=` y filtra localmente el conjunto recibido. El backend limita actualmente ese conjunto a 100 vacantes, sin paginación; los filtros y el contador se refieren a ese conjunto. Una búsqueda completa sobre más registros depende de ampliar el servicio en otra tarea.

La tabla conserva cinco columnas:

| Columna | Campo existente |
| --- | --- |
| Vacante y empresa | `titulo`, `empresa` |
| Área laboral | `area` |
| Modalidad | `modalidad` |
| Publicación | `fechaCreacion`, la única fecha disponible en el contrato actual; el tooltip la identifica como fecha de registro. Si falta o es inválida, se muestra “No disponible”. |
| Oferta | Enlace “Ver oferta” a `/vacantes/[id]`, con el ID real de la fila. |

La fecha se presenta en la zona horaria de Bolivia. No se generan fechas, empresas, áreas ni vacantes de reemplazo. Si falla la consulta, se muestra el estado de error y se permite reintentar.

La franja informativa utiliza la hora real en que el navegador recibe una respuesta exitosa y la identifica como **Última consulta**, en horario BOT. No representa una fecha de actualización del backend. El icono de actualización de esa franja conserva los cuatro filtros y el orden seleccionado. El selector “Ordenar: más recientes” ordena por `fechaCreacion`; las fechas ausentes o inválidas quedan al final.

La carga usa filas de esqueleto con los mismos encabezados. Una actualización completada muestra “Listado actualizado”; una actualización fallida muestra el error, sin presentar las filas anteriores como datos actuales. En pantallas pequeñas la tabla permite desplazamiento horizontal dentro de su contenedor.

Para revisar los filtros manualmente: buscar por el nombre real de la empresa de prueba A, combinar los tres selectores, limpiar los campos y actualizar conservando los filtros. Los fixtures actuales comparten área, modalidad y ubicación; para contrastar valores diferentes, usar datos reales disponibles o ampliar exclusivamente los fixtures de prueba.

## Fuente real y límites de integración

- Listado: `GET /vacantes/buscar?q=…`, respaldado por Elasticsearch.
- Detalle: `GET /vacantes/:id`, respaldado por Supabase; se muestran sus `requisitos` (`id`, `nombre`).
- HU8 no combina estos datos con `GET /vacantes/:id/requisitos`, que actualmente utiliza memoria, ni con el respaldo local del editor de HU2.
- El backend debe mantener actualizado el índice de búsqueda. Refrescar el frontend no reindexa datos.
- El contrato no entrega una fecha de publicación separada de `fechaCreacion`.
- Nivel, tipo y descripción por competencia requieren un contrato persistente coherente si los mockups los exigen. El contrato actual del detalle no los entrega.
- La comparación visual exacta queda pendiente de disponer de los mockups oficiales.

## Diagnóstico de la API local

Durante esta revisión, `http://localhost:3000/vacantes` respondió HTTP 200 y `http://localhost:3001/vacantes/buscar?q=` respondió **HTTP 503** con el mensaje **“El servicio de búsqueda no está configurado.”** El código del servicio de búsqueda produce ese mensaje cuando no dispone de `ELASTICSEARCH_NODE`. Es una dependencia de configuración del backend, no un listado vacío ni un fallo de conexión del navegador. No se modificó el backend ni su configuración.

La interfaz distingue ese 503 de un fallo de red y mantiene el reintento. Los fixtures se usan en pruebas o mediante el modo de demostración explícito de desarrollo descrito arriba, sin reemplazar la respuesta real en el funcionamiento normal.

## Alcance del encabezado y referencias visuales

El encabezado de Figma se limita a `/vacantes` y `/vacantes/[id]`. `/mis-vacantes`, creación, disponibilidad, edición y las demás rutas conservan el encabezado existente. Eventos, Mentorías, Beneficios y Comunidad aparecen como secciones no disponibles, porque sus rutas no existen en este repositorio; no se inventaron destinos.

Los estilos llevan prefijos exclusivos `hu8-board-` y `hu8-header-`, compatibles con el cargador CSS existente. No se modificaron estilos globales ni la configuración de Next.js.

Se recibieron capturas del listado normal y del detalle, además del enlace `https://www.figma.com/design/MKWsZ1i5hPqx7y4Ht1MYGe/Untitled?node-id=0-1`. El acceso web al archivo falló y la integración de Figma no estaba conectada. Las capturas de Chrome permiten comparar composición, encabezado, filtros, tabla, columnas y tarjetas con esas dos referencias. Carga, vacío, error y actualizado conservan el mismo estilo, pero su cotejo exacto queda pendiente de sus referencias oficiales; no se certifica una coincidencia píxel a píxel de pantallas no disponibles.
