import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NumberSeriesModule } from '../number-series/number-series.module';
import { AdvancesController } from './advances.controller';
import { AdvancesService } from './advances.service';

@Module({
  imports: [AuthModule, NumberSeriesModule],
  controllers: [AdvancesController],
  providers: [AdvancesService],
  exports: [AdvancesService],
})
export class AdvancesModule {}
