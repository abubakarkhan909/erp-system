import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
export declare class CompanySettingsController {
    private readonly companySettingsService;
    constructor(companySettingsService: CompanySettingsService);
    get(): Promise<{
        id: string;
        name: string;
        logoPath: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        crNumber: string | null;
        vatNumber: string | null;
        currency: string;
        defaultVatRate: string;
        invoicePrefix: string;
        receiptFooter: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(dto: UpdateCompanySettingsDto): Promise<{
        id: string;
        name: string;
        logoPath: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        crNumber: string | null;
        vatNumber: string | null;
        currency: string;
        defaultVatRate: string;
        invoicePrefix: string;
        receiptFooter: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
