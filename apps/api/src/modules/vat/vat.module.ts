import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VatController } from './vat.controller';
import { VatService } from './vat.service';

@Module({
  imports: [AuthModule],
  controllers: [VatController],
  providers: [VatService],
  exports: [VatService],
})
export class VatModule {}
