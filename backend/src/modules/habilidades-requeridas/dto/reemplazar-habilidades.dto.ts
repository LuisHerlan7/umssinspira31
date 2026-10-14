import {
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

export class ReemplazarHabilidadesDto {
  @IsArray()
  @ArrayUnique({ message: 'No se permiten habilidades duplicadas.' })
  @IsUUID('4', { each: true })
  habilidades!: string[];
}