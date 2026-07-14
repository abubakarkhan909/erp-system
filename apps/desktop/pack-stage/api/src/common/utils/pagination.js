"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.paginatedResult = paginatedResult;
exports.decimalStr = decimalStr;
function parsePagination(query) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const skip = (page - 1) * pageSize;
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    return { page, pageSize, skip, take: pageSize, search: query.search?.trim(), sortBy: query.sortBy, sortDir };
}
function paginatedResult(data, total, page, pageSize) {
    return { data, meta: { page, pageSize, total } };
}
function decimalStr(value) {
    if (value == null)
        return '0.000';
    if (typeof value === 'object' && value !== null && 'toFixed' in value) {
        return value.toFixed(3);
    }
    const n = Number(value);
    if (Number.isNaN(n))
        return '0.000';
    return n.toFixed(3);
}
//# sourceMappingURL=pagination.js.map