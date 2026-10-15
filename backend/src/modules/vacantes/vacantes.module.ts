import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../config/supabase.module';
import { VacantesController } from './vacantes.controller';
import { VacantesEstructuraService } from './vacantes-estructura.service';
import { VacantesService } from './vacantes.service';

@Module({
  imports: [SupabaseModule],
  controllers: [VacantesController],
  providers: [
    VacantesEstructuraService,
    VacantesService,
  ],
  exports: [
    VacantesEstructuraService,
    VacantesService,
  ],
})
export class VacantesModule {}
