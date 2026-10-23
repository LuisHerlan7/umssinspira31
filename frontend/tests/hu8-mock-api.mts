/** Local visual test server. Never imported by the application. No real data is read or written. */
import { createServer } from 'node:http';
import { setTimeout } from 'node:timers/promises';
import { vacancyA, vacancyB, vacancyWithoutRequirements } from './fixtures/hu8.ts';

if (process.env.NODE_ENV === 'production') {
  throw new Error('El servidor simulado de HU8 solo se permite para pruebas locales.');
}

const scenario = process.argv[2] ?? 'normal';
const scenarios = ['normal', 'carga', 'vacio', 'error', 'inexistente', 'actualizado'];
if (!scenarios.includes(scenario)) {
  throw new Error(`Escenario inválido. Opciones: ${scenarios.join(', ')}`);
}

const updatedVacancy = {
  ...vacancyA,
  requisitos: [{ id: 'a-updated', nombre: 'TypeScript' }],
};
const vacancies = scenario === 'actualizado'
  ? [updatedVacancy, vacancyWithoutRequirements]
  : [vacancyA, vacancyB, vacancyWithoutRequirements];

const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store');
  const send = (status: number, data: unknown) => {
    if (response.destroyed) return;
    response.writeHead(status);
    response.end(JSON.stringify(data));
  };

  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
  if (request.method !== 'GET') { send(405, { message: 'Solo se simulan consultas de HU8.' }); return; }

  const url = new URL(request.url ?? '/', 'http://127.0.0.1:3109');
  if (scenario === 'carga') await setTimeout(2500);
  if (scenario === 'error') { send(503, { message: 'Fallo simulado para pruebas de HU8.' }); return; }

  if (url.pathname === '/vacantes/buscar') {
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    send(200, scenario === 'vacio' ? [] : vacancies.filter((vacancy) =>
      vacancy.titulo.toLowerCase().includes(query) || vacancy.id === query));
    return;
  }

  const match = url.pathname.match(/^\/vacantes\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      send(400, { message: 'El identificador de vacante no es válido.' }); return;
    }
    const vacancy = scenario === 'inexistente' ? undefined : vacancies.find((item) => item.id === id);
    send(vacancy ? 200 : 404, vacancy ?? { message: 'La vacante no existe.' });
    return;
  }
  send(404, { message: 'Esta ruta no forma parte de las consultas simuladas de HU8.' });
});

server.listen(3109, '127.0.0.1', () => {
  console.log(`HU8: datos SIMULADOS (${scenario}) en http://127.0.0.1:3109. Ctrl+C para cerrar.`);
});
