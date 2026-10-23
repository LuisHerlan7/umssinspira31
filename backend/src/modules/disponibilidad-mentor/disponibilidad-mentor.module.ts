
import { Module } from '@nestjs/common';
import { DisponibilidadMentorController } from './disponibilidad-mentor.controller';
import { DisponibilidadMentorService } from './disponibilidad-mentor.service';

@Module({
  controllers: [DisponibilidadMentorController],
  providers: [DisponibilidadMentorService],
})
export class DisponibilidadMentorModule {}
