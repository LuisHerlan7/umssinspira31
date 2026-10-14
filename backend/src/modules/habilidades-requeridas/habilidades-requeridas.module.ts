import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../config/supabase.module';
import { HabilidadesRequeridasController } from './habilidades-requeridas.controller';
import { HabilidadesRequeridasService } from './habilidades-requeridas.service';

@Module({
  imports: [SupabaseModule],
  controllers: [HabilidadesRequeridasController],
  providers: [HabilidadesRequeridasService],
  exports: [HabilidadesRequeridasService],
})
export class HabilidadesRequeridasModule {}