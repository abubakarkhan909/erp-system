import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NumberSeriesModule } from '../number-series/number-series.module';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

@Module({
  imports: [AuthModule, NumberSeriesModule],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
