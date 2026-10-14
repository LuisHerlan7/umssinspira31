import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './config/supabase.module';
import { FormacionAcademicaModule } from './modules/formacion-academica/formacion-academica.module';
import { ExperienciaLaboralModule } from './modules/experiencia-laboral/experiencia-laboral.module';
import { HabilidadesRequeridasModule } from './modules/habilidades-requeridas/habilidades-requeridas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    FormacionAcademicaModule,
    ExperienciaLaboralModule,
    HabilidadesRequeridasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}