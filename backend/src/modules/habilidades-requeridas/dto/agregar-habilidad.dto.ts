import { IsUUID } from 'class-validator';

export class AgregarHabilidadDto {
  @IsUUID()
  idHabilidad!: string;
}