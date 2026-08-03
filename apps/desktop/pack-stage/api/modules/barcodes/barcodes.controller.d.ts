import { BarcodesService } from './barcodes.service';
export declare class BarcodesController {
    private readonly barcodesService;
    constructor(barcodesService: BarcodesService);
    generate(productId: string): Promise<{
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
    scan(code: string): Promise<{
        minStockQty: string;
        stockBalance: {
            onHandQty: string;
            onHandWeight: string;
        } | null;
    }>;
}
