export declare function parsePagination(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}): {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
    search: string | undefined;
    sortBy: string | undefined;
    sortDir: string;
};
export declare function paginatedResult<T>(data: T[], total: number, page: number, pageSize: number): {
    data: T[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
    };
};
export declare function decimalStr(value: unknown): string;
