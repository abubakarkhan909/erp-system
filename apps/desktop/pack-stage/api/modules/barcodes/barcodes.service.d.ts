import { PrismaService } from '../../prisma/prisma.service';
export declare class BarcodesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateBarcodeString(sku: string, productId: string): string;
    generateForProduct(productId: string): Promise<{
        productId: string;
        barcode: string;
        generated: boolean;
        product?: undefined;
    } | {
        productId: string;
        barcode: string | null;
        generated: boolean;
        product: {
            minStockQty: string;
        };
    }>;
    getByBarcode(code: string): Promise<{
        minStockQty: string;
        stockBalance: {
            onHandQty: string;
            onHandWeight: string;
        } | null;
    }>;
}
