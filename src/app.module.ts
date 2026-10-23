import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { VacanteModule } from './vacante/vacante.module';

@Module({
  imports: [PrismaModule, VacanteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}