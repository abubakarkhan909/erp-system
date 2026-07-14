export type PeriodGranularity = 'daily' | 'monthly' | 'yearly';
export declare function parseIsoDate(value?: string): Date | undefined;
export declare function startOfDayUtc(d: Date): Date;
export declare function endOfDayUtc(d: Date): Date;
export declare function resolveDateRange(query: {
    from?: string;
    to?: string;
    date?: string;
    year?: number | string;
    month?: number | string;
    period?: PeriodGranularity;
}): {
    from: Date;
    to: Date;
    period: PeriodGranularity;
};
export declare function vatPeriodRange(year: number, month?: number, quarter?: number): {
    from: Date;
    to: Date;
    label: string;
};
