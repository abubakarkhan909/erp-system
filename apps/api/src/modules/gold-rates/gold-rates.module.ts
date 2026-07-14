import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GoldRatesController } from './gold-rates.controller';
import { GoldRatesService } from './gold-rates.service';

@Module({
  imports: [AuthModule],
  controllers: [GoldRatesController],
  providers: [GoldRatesService],
  exports: [GoldRatesService],
})
export class GoldRatesModule {}
