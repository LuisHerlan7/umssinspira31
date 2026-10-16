import { IsBoolean } from 'class-validator';

export class UpdateDisponibilidadDto {
  @IsBoolean({ message: 'disponible debe ser un valor booleano.' })
  disponible!: boolean;
}
