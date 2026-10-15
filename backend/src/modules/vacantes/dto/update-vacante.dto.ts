import { OmitType } from '@nestjs/mapped-types';
import { CreateVacanteDto } from './create-vacante.dto';

export class UpdateVacanteDto extends OmitType(CreateVacanteDto, [
  'idEmpresa',
] as const) {}
