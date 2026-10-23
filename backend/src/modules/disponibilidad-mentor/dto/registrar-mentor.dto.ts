
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarMentorDto {
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Debes seleccionar al menos un área de especialidad.',
  })
  @ArrayUnique({
    message: 'No puedes repetir un área de especialidad.',
  })
  @IsUUID('4', { each: true })
  areas: string[];

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  experiencia?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  aniosExp?: number;
}