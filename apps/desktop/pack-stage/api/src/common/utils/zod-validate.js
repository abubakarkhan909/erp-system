"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodValidate = zodValidate;
const common_1 = require("@nestjs/common");
function zodValidate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new common_1.BadRequestException(message);
    }
    return result.data;
}
//# sourceMappingURL=zod-validate.js.map