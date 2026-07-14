"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postJournalEntry = postJournalEntry;
const common_1 = require("@nestjs/common");
async function postJournalEntry(prisma, numberSeries, params, tx) {
    const db = tx ?? prisma;
    const accountCodes = [...new Set(params.lines.map((l) => l.accountCode))];
    const accounts = await db.account.findMany({
        where: { code: { in: accountCodes }, isActive: true },
    });
    const accountMap = new Map(accounts.map((a) => [a.code, a.id]));
    for (const code of accountCodes) {
        if (!accountMap.has(code)) {
            throw new common_1.NotFoundException(`GL account ${code} not found`);
        }
    }
    const number = await numberSeries.nextNumber('JOURNAL', 'JE', tx);
    const entry = await db.journalEntry.create({
        data: {
            number,
            entryDate: params.entryDate,
            memo: params.memo,
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            createdById: params.userId,
            lines: {
                create: params.lines.map((line) => ({
                    accountId: accountMap.get(line.accountCode),
                    debit: line.debit ?? 0,
                    credit: line.credit ?? 0,
                    partyType: line.partyType ?? null,
                    partyId: line.partyId ?? null,
                    narration: line.narration ?? null,
                })),
            },
        },
        select: { id: true, number: true },
    });
    return entry;
}
//# sourceMappingURL=journal.helper.js.map