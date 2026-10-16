import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { VacantesController } from '../src/modules/vacantes/vacantes.controller';
import { VacantesIndexService } from '../src/modules/vacantes/indexacion/vacantes-index.service';
import { VacantesEstructuraService } from '../src/modules/vacantes/vacantes-estructura.service';
import { VacantesService } from '../src/modules/vacantes/vacantes.service';

const ID = '00000000-0000-4000-8000-000000000006';

describe('HU6 disponibilidad de vacantes (e2e)', () => {
  let app: INestApplication<App>;
  const actualizarDisponibilidad = jest.fn(
    async (id: string, disponible: boolean) => ({ id, disponible }),
  );

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [VacantesController],
      providers: [
        { provide: VacantesEstructuraService, useValue: {} },
        { provide: VacantesService, useValue: {} },
        { provide: VacantesIndexService, useValue: { actualizarDisponibilidad } },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('desactiva usando el UUID original', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/vacantes/${ID}/disponibilidad`)
      .send({ disponible: false })
      .expect(200);
    expect(response.body).toEqual({ id: ID, disponible: false });
    expect(actualizarDisponibilidad).toHaveBeenCalledWith(ID, false);
  });

  it('reactiva usando el UUID original', async () => {
    await request(app.getHttpServer())
      .patch(`/vacantes/${ID}/disponibilidad`)
      .send({ disponible: true })
      .expect(200);
    expect(actualizarDisponibilidad).toHaveBeenLastCalledWith(ID, true);
  });

  it('rechaza valores no booleanos', async () => {
    await request(app.getHttpServer())
      .patch(`/vacantes/${ID}/disponibilidad`)
      .send({ disponible: 'no' })
      .expect(400);
  });
});
