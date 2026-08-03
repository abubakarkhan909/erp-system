export declare class UpdateCompanySettingsDto {
    name: string;
    logoPath?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    crNumber?: string | null;
    vatNumber?: string | null;
    currency?: string;
    defaultVatRate?: string;
    invoicePrefix?: string;
    receiptFooter?: string | null;
}
