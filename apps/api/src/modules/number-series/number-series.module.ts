import { Module } from '@nestjs/common';
import { NumberSeriesService } from './number-series.service';

@Module({
  providers: [NumberSeriesService],
  exports: [NumberSeriesService],
})
export class NumberSeriesModule {}
