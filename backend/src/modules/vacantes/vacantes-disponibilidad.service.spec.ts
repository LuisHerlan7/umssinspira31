import { jest } from '@jest/globals';
import { SupabaseService } from '../../config/supabase.service';
import { VacantesService } from './vacantes.service';

const ID = '00000000-0000-4000-8000-000000000006';

describe('VacantesService - persistencia HU6', () => {
  it('actualiza Supabase y después lee la versión vigente conservando el registro', async () => {
    const calls: string[] = [];
    const maybeSingle = jest.fn(async () => {
      calls.push('persist');
      return { data: { id: ID }, error: null };
    });
    const query = {
      update: jest.fn(() => query),
      eq: jest.fn(() => query),
      select: jest.fn(() => query),
      maybeSingle,
    };
    const adminClient = { from: jest.fn(() => query) };
    const service = new VacantesService({
      getClient: () => ({}),
      getAdminClient: () => adminClient,
    } as unknown as SupabaseService);
    jest.spyOn(service, 'obtenerPorId').mockImplementation(async (id) => {
      calls.push('read');
      return {
        id,
        idEmpresa: '11111111-1111-4111-8111-111111111111',
        empresa: 'Empresa real',
        titulo: 'Vacante persistida',
        modalidad: 'Remoto',
        estado: 'Publicada',
        fechaCreacion: null,
        descripcion: '',
        ubicacion: '',
        area: '',
        condiciones: '',
        requisitos: [],
        disponible: false,
        disponibilidadActualizadaAt: '2026-10-15T17:30:00.000Z',
      };
    });

    const result = await service.actualizarDisponibilidad(ID, false);

    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({ disponible: false }),
    );
    expect(query.eq).toHaveBeenCalledWith('id', ID);
    expect(calls).toEqual(['persist', 'read']);
    expect(result).toMatchObject({ id: ID, disponible: false });
  });
});
