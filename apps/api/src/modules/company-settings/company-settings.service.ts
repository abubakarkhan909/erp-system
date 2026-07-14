import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr } from '../../common/utils/pagination';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const company = await this.prisma.company.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!company) {
      throw new NotFoundException('Company settings not configured');
    }

    return this.serialize(company);
  }

  async update(dto: UpdateCompanySettingsDto) {
    const existing = await this.prisma.company.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    const data = {
      name: dto.name,
      logoPath: dto.logoPath !== undefined ? dto.logoPath : undefined,
      address: dto.address !== undefined ? dto.address : undefined,
      phone: dto.phone !== undefined ? dto.phone : undefined,
      email: dto.email !== undefined ? dto.email : undefined,
      crNumber: dto.crNumber !== undefined ? dto.crNumber : undefined,
      vatNumber: dto.vatNumber !== undefined ? dto.vatNumber : undefined,
      currency: dto.currency ?? 'OMR',
      defaultVatRate: dto.defaultVatRate
        ? new Prisma.Decimal(dto.defaultVatRate)
        : undefined,
      invoicePrefix: dto.invoicePrefix !== undefined ? dto.invoicePrefix : undefined,
      receiptFooter: dto.receiptFooter !== undefined ? dto.receiptFooter : undefined,
    };

    const company = existing
      ? await this.prisma.company.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.company.create({ data });

    return this.serialize(company);
  }

  private serialize(company: {
    id: string;
    name: string;
    logoPath: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    crNumber: string | null;
    vatNumber: string | null;
    currency: string;
    defaultVatRate: Prisma.Decimal;
    invoicePrefix: string;
    receiptFooter: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: company.id,
      name: company.name,
      logoPath: company.logoPath,
      address: company.address,
      phone: company.phone,
      email: company.email,
      crNumber: company.crNumber,
      vatNumber: company.vatNumber,
      currency: company.currency,
      defaultVatRate: decimalStr(company.defaultVatRate),
      invoicePrefix: company.invoicePrefix,
      receiptFooter: company.receiptFooter,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
