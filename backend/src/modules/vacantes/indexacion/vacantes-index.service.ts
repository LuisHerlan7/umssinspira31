import { Injectable } from '@nestjs/common';
import { UpdateVacanteDto } from '../dto/update-vacante.dto';
import { VacantesService } from '../vacantes.service';
import { ElasticsearchService } from './elasticsearch.service';
import type { VacancyIndexDocument } from './vacancy-index.types';

type VacancySource = Awaited<ReturnType<VacantesService['obtenerPorId']>>;

@Injectable()
export class VacantesIndexService {
  constructor(
    private readonly vacantesService: VacantesService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexarVacante(id: string) {
    const vacancy = await this.vacantesService.obtenerPorId(id);
    const index = await this.indexarFuente(vacancy);

    return { indexed: true, id: vacancy.id, index };
  }

  buscar(query: string) {
    return this.elasticsearchService.searchVacancies(query);
  }

  async actualizarVacante(id: string, dto: UpdateVacanteDto) {
    const vacancy = await this.vacantesService.actualizar(id, dto);
    await this.indexarFuente(vacancy);
    return vacancy;
  }

  mapToIndexDocument(vacancy: VacancySource): VacancyIndexDocument {
    return {
      id: vacancy.id,
      idEmpresa: vacancy.idEmpresa,
      empresa: vacancy.empresa,
      titulo: vacancy.titulo,
      modalidad: vacancy.modalidad,
      estado: vacancy.estado,
      fechaCreacion: vacancy.fechaCreacion,
      descripcion: vacancy.descripcion,
      ubicacion: vacancy.ubicacion,
      area: vacancy.area,
      condiciones: vacancy.condiciones,
      requisitos: vacancy.requisitos.map((requirement) => ({
        id: requirement.id,
        nombre: requirement.nombre,
      })),
    };
  }

  private indexarFuente(vacancy: VacancySource) {
    return this.elasticsearchService.indexVacancy(
      this.mapToIndexDocument(vacancy),
    );
  }
}
